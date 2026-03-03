import { existsSync } from "node:fs";

import { collectGitChanges } from "../../utils/git-collector.js";
import { logDebug } from "../../utils/log.js";
import { paths } from "../../utils/paths.js";
import {
  AGENT_DISPLAY_NAMES,
  AgentName,
  type AgentEventResult,
  type AgentProvider,
} from "../types.js";
import { GeminiCliInstaller } from "./gemini-cli-installer.js";
import {
  extractProjectName,
  isValidAfterAgentEvent,
  parseAfterAgentEvent,
  parseTranscriptForUsage,
} from "./gemini-cli-parser.js";

export class GeminiCliProvider implements AgentProvider {
  readonly name = AgentName.GeminiCli;
  readonly displayName = AGENT_DISPLAY_NAMES[AgentName.GeminiCli];
  readonly settleDelayMs = 0;
  readonly submitKeys = ["Enter"];

  detect(): boolean {
    return existsSync(paths.geminiDir);
  }

  isHookInstalled(): boolean {
    return GeminiCliInstaller.isInstalled();
  }

  installHook(port: number, secret: string): void {
    GeminiCliInstaller.install(port, secret);
  }

  uninstallHook(): void {
    GeminiCliInstaller.uninstall();
  }

  verifyIntegrity(): { complete: boolean; missing: string[] } {
    return GeminiCliInstaller.verifyIntegrity();
  }

  parseEvent(raw: unknown): AgentEventResult {
    if (!isValidAfterAgentEvent(raw)) {
      return this.createFallbackResult(raw);
    }

    const event = parseAfterAgentEvent(raw);
    logDebug(`[GeminiCli:raw] sessionId=${event.sessionId} cwd=${event.cwd}`);

    let usage = { model: "", durationMs: 0, inputTokens: 0, outputTokens: 0 };
    try {
      if (event.transcriptPath) usage = parseTranscriptForUsage(event.transcriptPath);
    } catch {
      /* noop */
    }

    const gitChanges = event.cwd ? collectGitChanges(event.cwd) : [];
    const obj = raw as Record<string, unknown>;
    const tmuxTarget = typeof obj.tmux_target === "string" ? obj.tmux_target : undefined;

    return {
      projectName: extractProjectName(event.cwd),
      responseSummary: event.promptResponse,
      durationMs: usage.durationMs,
      gitChanges,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      model: usage.model,
      agentSessionId: event.sessionId || undefined,
      cwd: event.cwd,
      tmuxTarget,
    };
  }

  private createFallbackResult(raw: unknown): AgentEventResult {
    const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
    const cwd = typeof obj.cwd === "string" ? obj.cwd : "";
    const tmuxTarget = typeof obj.tmux_target === "string" ? obj.tmux_target : undefined;

    return {
      projectName: cwd ? extractProjectName(cwd) : "unknown",
      responseSummary: "",
      durationMs: 0,
      gitChanges: cwd ? collectGitChanges(cwd) : [],
      inputTokens: 0,
      outputTokens: 0,
      model: "",
      cwd,
      tmuxTarget,
    };
  }
}
