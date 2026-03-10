import { execSync } from "node:child_process";

export const GitChangeStatus = {
  Modified: "modified",
  Added: "added",
  Deleted: "deleted",
  Renamed: "renamed",
} as const;

export type GitChangeStatus = (typeof GitChangeStatus)[keyof typeof GitChangeStatus];

export const InstallMethod = {
  Global: "global",
  GitClone: "git-clone",
  Npx: "npx",
} as const;

export type InstallMethod = (typeof InstallMethod)[keyof typeof InstallMethod];

export const CliCommand = {
  Setup: "setup",
  Update: "update",
  Uninstall: "uninstall",
  Project: "project",
  Channel: "channel",
  Help: "help",
  HelpFlag: "--help",
  HelpShort: "-h",
} as const;

export type CliCommand = (typeof CliCommand)[keyof typeof CliCommand];

export const PackageManager = {
  Npm: "npm",
  Pnpm: "pnpm",
  Yarn: "yarn",
  Bun: "bun",
} as const;

export type PackageManager = (typeof PackageManager)[keyof typeof PackageManager];

export const ApiRoute = {
  HookStop: "/hook/stop",
  HookSessionStart: "/hook/session-start",
  HookNotification: "/hook/notification",
  HookAskUserQuestion: "/hook/ask-user-question",
  HookPermissionRequest: "/hook/permission-request",
  ResponseData: "/api/responses/:id",
  Health: "/health",
} as const;

export const DEFAULT_HOOK_PORT = 9377;
export const CCPOKE_MARKER = "ccpoke";
export const MINI_APP_BASE_URL_ENV = "CCPOKE_MINI_APP_BASE_URL";

export const ChannelName = {
  Telegram: "telegram",
  Discord: "discord",
  Slack: "slack",
} as const;

export type ChannelName = (typeof ChannelName)[keyof typeof ChannelName];

export const Platform = {
  Windows: "win32",
  MacOS: "darwin",
  Linux: "linux",
} as const;

export type Platform = (typeof Platform)[keyof typeof Platform];

export const currentPlatform = process.platform;

export function isWindows(): boolean {
  return currentPlatform === Platform.Windows;
}

export function isMacOS(): boolean {
  return currentPlatform === Platform.MacOS;
}

export function isLinux(): boolean {
  return currentPlatform === Platform.Linux;
}

export function getMiniAppBaseUrl(): string | null {
  const rawValue = process.env[MINI_APP_BASE_URL_ENV]?.trim();
  if (!rawValue) return null;

  try {
    return new URL(rawValue).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getMiniAppOrigin(): string | null {
  const miniAppBaseUrl = getMiniAppBaseUrl();
  if (!miniAppBaseUrl) return null;
  return new URL(miniAppBaseUrl).origin;
}

export function buildMiniAppResponseUrl(
  apiBase: string,
  responseId: string,
  projectName: string,
  agent: string
): string {
  const miniAppBaseUrl = getMiniAppBaseUrl();

  if (!miniAppBaseUrl) {
    return new URL(`/api/responses/${responseId}`, `${apiBase}/`).toString();
  }

  const responseUrl = new URL("response/", `${miniAppBaseUrl}/`);
  responseUrl.search = new URLSearchParams({
    id: responseId,
    api: apiBase,
    p: projectName,
    a: agent,
  }).toString();
  return responseUrl.toString();
}

export function refreshWindowsPath(): void {
  if (!isWindows()) return;
  try {
    const userPathRaw = execSync('reg query "HKCU\\Environment" /v Path', {
      encoding: "utf-8",
      stdio: "pipe",
      timeout: 5000,
    });
    const userPath =
      userPathRaw
        .replace(/\r/g, "")
        .match(/REG_(?:EXPAND_)?SZ\s+(.+)/)?.[1]
        ?.trim() ?? "";

    const machinePathRaw = execSync(
      'reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /v Path',
      { encoding: "utf-8", stdio: "pipe", timeout: 5000 }
    );
    const machinePath =
      machinePathRaw
        .replace(/\r/g, "")
        .match(/REG_(?:EXPAND_)?SZ\s+(.+)/)?.[1]
        ?.trim() ?? "";

    process.env.PATH = `${userPath};${machinePath}`;
  } catch {
    /* best-effort */
  }
}
