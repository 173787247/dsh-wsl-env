import os from "node:os";
import { detectWsl, distroName, resolveWindowsUser, windowsPathRule } from "./lib/wsl.js";

export const name = "dsh-wsl-env";
export const inject = ["systemPrompt"];

export function apply(ctx, config = {}) {
  const when = config.when === "always" ? "always" : "wsl";
  const extra = String(config.extraNotes ?? "").trim();
  const order = Number.isFinite(config.order) ? config.order : 15;
  const wsl = detectWsl();

  if (when === "wsl" && !wsl) {
    console.log("[dsh-wsl-env] not running in WSL; skipping prompt injection");
    return;
  }

  const distro = distroName();
  const linuxUser = os.userInfo().username;
  const windowsUser = resolveWindowsUser(linuxUser);
  let text = [
    `You are running inside Windows Subsystem for Linux (${distro}) as ${linuxUser}.`,
    "The browser may be on Windows, but tools and the shell run in Linux.",
    "",
    "Path and shell rules:",
    "- Use bash and Linux paths. Do not use PowerShell, cmd.exe, or Windows drive letters as command paths.",
    `- ${windowsPathRule(windowsUser || linuxUser)}`,
    "- Prefer the selected workspace and {{cwd}}. Do not scan the entire Windows home or Desktop unless asked.",
    "- Node, git, python, and package managers mean the Linux copies in this distro, not the Windows ones.",
    "- Files under /mnt/c often have CRLF endings. Strip carriage returns before running a script with bash.",
    "- Prefer {{cwd}} and /home for git and new files. Do not treat /mnt/c as the daily working tree unless asked.",
    "- Node 24 fetch ignores HTTP_PROXY/HTTPS_PROXY unless NODE_USE_ENV_PROXY=1. Set that when a Node script must use the proxy.",
  ].join("\n");

  if (extra) {
    text += `\n\nAdditional operator notes:\n${extra}`;
  }

  ctx.systemPrompt.section({
    name: "runtime:wsl-windows",
    order,
    text,
  });
}
