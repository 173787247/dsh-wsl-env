import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectWsl, distroName, resolveWindowsUser, userFromWindowsHome, windowsPathRule } from "../lib/wsl.js";

describe("detectWsl", () => {
  it("trusts WSL_DISTRO_NAME", () => {
    assert.equal(detectWsl({ env: { WSL_DISTRO_NAME: "Ubuntu-24.04" }, readRelease: () => { throw new Error("unused"); } }), true);
  });

  it("trusts WSL_INTEROP", () => {
    assert.equal(detectWsl({ env: { WSL_INTEROP: "/run/WSL/1_interop" }, readRelease: () => { throw new Error("unused"); } }), true);
  });

  it("reads the kernel osrelease when env is empty", () => {
    assert.equal(detectWsl({ env: {}, readRelease: () => "6.8.0-microsoft-standard-WSL2" }), true);
    assert.equal(detectWsl({ env: {}, readRelease: () => "6.8.0-generic" }), false);
  });

  it("returns false when osrelease cannot be read", () => {
    assert.equal(detectWsl({ env: {}, readRelease: () => { throw new Error("ENOENT"); } }), false);
  });
});

describe("windowsPathRule", () => {
  it("uses the Linux username when /mnt/c/Users/<user> exists", () => {
    const text = windowsPathRule("rchua", { exists: (p) => p === "/mnt/c/Users/rchua" });
    assert.match(text, /C:\\Users\\rchua\\project/);
    assert.match(text, /\/mnt\/c\/Users\/rchua\/project/);
  });

  it("falls back to a generic mapping when that home is missing", () => {
    const text = windowsPathRule("rchua", { exists: () => false });
    assert.match(text, /C:\\Users\\name\\project/);
    assert.match(text, /\/mnt\/c\/Users\/name\/project/);
  });
});

describe("userFromWindowsHome", () => {
  it("reads the Windows username from USERPROFILE", () => {
    assert.equal(userFromWindowsHome("C:\\Users\\rchua"), "rchua");
    assert.equal(userFromWindowsHome("/mnt/c/Users/rchua"), "rchua");
    assert.equal(userFromWindowsHome(""), "");
  });
});

describe("resolveWindowsUser", () => {
  it("prefers USERPROFILE when that Windows home is mounted", () => {
    const name = resolveWindowsUser("linuxuser", {
      env: { USERPROFILE: "C:\\Users\\rchua" },
      exists: (p) => p === "/mnt/c/Users/rchua",
    });
    assert.equal(name, "rchua");
  });

  it("falls back to the Linux username when that home is mounted", () => {
    const name = resolveWindowsUser("rchua", {
      env: {},
      exists: (p) => p === "/mnt/c/Users/rchua",
    });
    assert.equal(name, "rchua");
  });
});

describe("distroName", () => {
  it("prefers WSL_DISTRO_NAME", () => {
    assert.equal(distroName({ env: { WSL_DISTRO_NAME: "Ubuntu-24.04" }, readOsReleaseFile: () => { throw new Error("unused"); } }), "Ubuntu-24.04");
  });

  it("reads PRETTY_NAME from os-release when the env var is missing", () => {
    const text = 'NAME="Ubuntu"\nPRETTY_NAME="Ubuntu 24.04.3 LTS"\n';
    assert.equal(distroName({ env: {}, readOsReleaseFile: () => text }), "Ubuntu 24.04.3 LTS");
  });

  it("falls back to WSL when os-release is missing", () => {
    assert.equal(distroName({ env: {}, readOsReleaseFile: () => { throw new Error("ENOENT"); } }), "WSL");
  });
});
