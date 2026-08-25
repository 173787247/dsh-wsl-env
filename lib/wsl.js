import { existsSync, readFileSync } from "node:fs";

export function detectWsl({ env = process.env, readRelease = readOsRelease } = {}) {
  if (env.WSL_DISTRO_NAME || env.WSL_INTEROP) {
    return true;
  }
  try {
    return /microsoft/i.test(readRelease());
  } catch {
    return false;
  }
}

export function userFromWindowsHome(home) {
  if (!home) return "";
  const normalized = String(home).replace(/\\/g, "/");
  const match = normalized.match(/\/Users\/([^/]+)/i);
  return match ? match[1] : "";
}

export function resolveWindowsUser(linuxUser, { env = process.env, exists = existsSync } = {}) {
  const fromProfile = userFromWindowsHome(env.USERPROFILE);
  const names = [...new Set([fromProfile, linuxUser].filter(Boolean))];
  for (const name of names) {
    if (exists(`/mnt/c/Users/${name}`)) return name;
  }
  return fromProfile || "";
}

export function windowsPathRule(user, { exists = existsSync } = {}) {
  const linuxHome = user ? `/mnt/c/Users/${user}` : "";
  if (user && exists(linuxHome)) {
    return `A Windows path such as C:\\Users\\${user}\\project is ${linuxHome}/project in this environment.`;
  }
  return "A Windows path such as C:\\Users\\name\\project is /mnt/c/Users/name/project in this environment.";
}

function readOsRelease() {
  return readFileSync("/proc/sys/kernel/osrelease", "utf8");
}
