import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

import { paths } from "../../utils/paths.js";

export interface GeminiAfterAgentEvent {
  sessionId: string;
  cwd: string;
  promptResponse: string;
  transcriptPath: string;
  timestamp: string;
}

export interface GeminiTranscriptUsage {
  model: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
}

const EMPTY_USAGE: GeminiTranscriptUsage = {
  model: "",
  durationMs: 0,
  inputTokens: 0,
  outputTokens: 0,
};

export function isValidAfterAgentEvent(data: unknown): data is Record<string, unknown> {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return typeof obj.session_id === "string" && typeof obj.prompt_response === "string";
}

export function parseAfterAgentEvent(raw: Record<string, unknown>): GeminiAfterAgentEvent {
  return {
    sessionId: typeof raw.session_id === "string" ? raw.session_id : "",
    cwd: typeof raw.cwd === "string" ? raw.cwd : "",
    promptResponse: typeof raw.prompt_response === "string" ? raw.prompt_response : "",
    transcriptPath: typeof raw.transcript_path === "string" ? raw.transcript_path : "",
    timestamp: typeof raw.timestamp === "string" ? raw.timestamp : "",
  };
}

export function parseTranscriptForUsage(transcriptPath: string): GeminiTranscriptUsage {
  try {
    if (!transcriptPath) return EMPTY_USAGE;

    const resolved = resolve(transcriptPath);
    if (!resolved.startsWith(paths.geminiDir)) return EMPTY_USAGE;

    const content = readFileSync(resolved, "utf-8");
    const lines = content.split("\n").filter((l) => l.trim());

    let model = "";
    let inputTokens = 0;
    let outputTokens = 0;
    let firstTimestamp = 0;
    let lastTimestamp = 0;

    for (const line of lines) {
      let obj: Record<string, unknown>;
      try {
        obj = JSON.parse(line);
      } catch {
        continue;
      }

      if (typeof obj.model === "string" && obj.model) model = obj.model;

      const usage = obj.usageMetadata as Record<string, unknown> | undefined;
      if (usage && typeof usage === "object") {
        if (typeof usage.promptTokenCount === "number") inputTokens += usage.promptTokenCount;
        if (typeof usage.candidatesTokenCount === "number")
          outputTokens += usage.candidatesTokenCount;
      } else {
        const stdUsage = obj.usage as Record<string, unknown> | undefined;
        if (stdUsage && typeof stdUsage === "object") {
          if (typeof stdUsage.input_tokens === "number") inputTokens += stdUsage.input_tokens;
          if (typeof stdUsage.output_tokens === "number") outputTokens += stdUsage.output_tokens;
        }
      }

      const ts =
        typeof obj.timestamp === "string"
          ? new Date(obj.timestamp).getTime()
          : typeof obj.timestamp === "number"
            ? obj.timestamp
            : 0;
      if (ts > 0) {
        if (firstTimestamp === 0 || ts < firstTimestamp) firstTimestamp = ts;
        if (ts > lastTimestamp) lastTimestamp = ts;
      }
    }

    const durationMs =
      firstTimestamp > 0 && lastTimestamp > firstTimestamp
        ? Math.round(lastTimestamp - firstTimestamp)
        : 0;

    return { model, durationMs, inputTokens, outputTokens };
  } catch {
    return EMPTY_USAGE;
  }
}

export function extractProjectName(cwd: string): string {
  return basename(cwd) || "unknown";
}
