import { readFileSync } from "node:fs";
import { basename } from "node:path";

import { expandHome, paths } from "../../utils/paths.js";

export function extractProjectName(cwd: string, transcriptPath: string): string {
  if (transcriptPath) {
    const expanded = expandHome(transcriptPath);
    if (expanded.startsWith(`${paths.claudeProjectsDir}/`)) {
      const encodedDir = expanded.slice(`${paths.claudeProjectsDir}/`.length).split("/")[0];
      if (encodedDir) {
        const projectPath = resolveProjectPath(encodedDir, cwd);
        if (projectPath) return basename(projectPath);
      }
    }
  }
  return basename(cwd);
}

function resolveProjectPath(encodedDir: string, cwd: string): string | null {
  const encodedCwd = encodePathSegment(cwd);
  if (encodedDir === encodedCwd) return cwd;

  if (encodedDir.startsWith(encodedCwd)) return cwd;
  if (encodedCwd.startsWith(encodedDir)) return cwd;

  return null;
}

function encodePathSegment(absolutePath: string): string {
  return absolutePath.replaceAll("/", "-");
}

interface TranscriptEntry {
  type?: string;
  message?: MessageContent;
  timestamp?: string;
  durationMs?: number;
  sessionId?: string;
  parentUuid?: string;
  uuid?: string;
  summary?: string;
}

interface MessageContent {
  role: string;
  content?: ContentPart[];
  usage?: TokenUsage;
  model?: string;
}

interface ContentPart {
  type: string;
  text?: string;
}

interface TokenUsage {
  input_tokens?: number;
  output_tokens?: number;
}

export interface StopEvent {
  session_id: string;
  transcript_path: string;
  cwd: string;
}

export interface TranscriptSummary {
  lastAssistantMessage: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export function isValidStopEvent(data: unknown): data is StopEvent {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.session_id === "string" &&
    typeof obj.transcript_path === "string" &&
    typeof obj.cwd === "string"
  );
}

export function parseTranscript(transcriptPath: string): TranscriptSummary {
  const expandedPath = expandHome(transcriptPath);
  const raw = readFileSync(expandedPath, "utf-8");
  const lines = raw.split("\n");

  let lastAssistantText = "";
  let summaryText = "";
  let lastUserTimestamp: Date | null = null;
  let lastAssistantTimestamp: Date | null = null;
  let turnInputTokens = 0;
  let turnOutputTokens = 0;
  let model = "";

  for (const line of lines) {
    if (!line.trim()) continue;

    let entry: TranscriptEntry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }

    if (entry.type === "summary" && entry.summary) {
      summaryText = entry.summary;
    }

    const msg = entry.message;
    if (msg?.role === "user" && entry.timestamp) {
      const d = new Date(entry.timestamp);
      if (!isNaN(d.getTime())) {
        lastUserTimestamp = d;
        turnInputTokens = 0;
        turnOutputTokens = 0;
        lastAssistantTimestamp = null;
        lastAssistantText = "";
        model = "";
      }
    }

    if (msg?.role === "assistant") {
      if (entry.timestamp) {
        const d = new Date(entry.timestamp);
        if (!isNaN(d.getTime())) lastAssistantTimestamp = d;
      }

      const rawContent = msg.content ?? [];
      const contentArray = Array.isArray(rawContent) ? rawContent : [];
      const text = extractTextFromContent(contentArray);
      if (text) lastAssistantText = text;

      if (msg.model) model = msg.model;

      if (msg.usage) {
        const inp = msg.usage.input_tokens ?? 0;
        if (inp > 0) turnInputTokens = inp;
        turnOutputTokens += msg.usage.output_tokens ?? 0;
      }
    }
  }

  let durationMs = 0;
  if (lastUserTimestamp && lastAssistantTimestamp && lastAssistantTimestamp > lastUserTimestamp) {
    durationMs = lastAssistantTimestamp.getTime() - lastUserTimestamp.getTime();
  }

  const finalMessage = lastAssistantText || summaryText;

  return {
    lastAssistantMessage: finalMessage,
    durationMs,
    inputTokens: turnInputTokens,
    outputTokens: turnOutputTokens,
    model,
  };
}

function extractTextFromContent(parts: ContentPart[]): string {
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text!)
    .join("\n");
}
