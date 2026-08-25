import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectWsl, windowsPathRule } from "../lib/wsl.js";

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
