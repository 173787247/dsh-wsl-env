import { existsSync, readFileSync } from "node:fs";
import os from "node:os";

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

  const distro = process.env.WSL_DISTRO_NAME || "WSL";
  const user = os.userInfo().username;
  let text = [
    `You are running inside Windows Subsystem for Linux (${distro}) as ${user}.`,
    "The browser may be on Windows, but tools and the shell run in Linux.",
    "",
    "Path and shell rules:",
    "- Use bash and Linux paths. Do not use PowerShell, cmd.exe, or Windows drive letters as command paths.",
    `- ${windowsPathRule(user)}`,
    "- Prefer the selected workspace and {{cwd}}. Do not scan the entire Windows home or Desktop unless asked.",
    "- Node, git, python, and package managers mean the Linux copies in this distro, not the Windows ones.",
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

function windowsPathRule(user) {
  const linuxHome = `/mnt/c/Users/${user}`;
  if (existsSync(linuxHome)) {
    return `A Windows path such as C:\\Users\\${user}\\project is ${linuxHome}/project in this environment.`;
  }
  return "A Windows path such as C:\\Users\\name\\project is /mnt/c/Users/name/project in this environment.";
}

function detectWsl() {
  if (process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP) {
    return true;
  }
  try {
    const release = readFileSync("/proc/sys/kernel/osrelease", "utf8");
    return /microsoft/i.test(release);
  } catch {
    return false;
  }
}
