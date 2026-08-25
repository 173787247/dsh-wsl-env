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

export function windowsPathRule(user, { exists = existsSync } = {}) {
  const linuxHome = `/mnt/c/Users/${user}`;
  if (exists(linuxHome)) {
    return `A Windows path such as C:\\Users\\${user}\\project is ${linuxHome}/project in this environment.`;
  }
  return "A Windows path such as C:\\Users\\name\\project is /mnt/c/Users/name/project in this environment.";
}

function readOsRelease() {
  return readFileSync("/proc/sys/kernel/osrelease", "utf8");
}
