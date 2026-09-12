# dsh-wsl-env
> **Install set:** part of [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit). Prefer `KIT_SET=daily` | `llm` | `github` | `full` (see kit README). Fault tree: [TROUBLESHOOTING.md](https://github.com/173787247/dsh-wsl-kit/blob/master/docs/TROUBLESHOOTING.md).


DeepSeek Harness plugin: inject **WSL / Windows** path and shell facts into the system prompt.

Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 → README.zh.md](./README.zh.md)

---
## Compatibility

| Field | Value |
|-------|-------|
| **Plugin** | `dsh-wsl-env` **0.3.0** |
| **Minimum dsh** | ≥ **0.1.2** (web UI one-shot `?token=` on Windows relay `:3081`) |
| **Latest verified** | See [dsh-wsl-kit Compatibility](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) (currently **`0.1.5-rc.1`**) — single source of truth for the suite |
| **Kit set** | `daily` (also in `github` / `full`; fetch+net also in `llm`) |
| **Cloud Flash** | Use model id **`deepseek-flash`** (V4.1 Flash) in `~/.dsh/settings.yaml` / `llm-deepseek` — not configured by this plugin |
| **Agent Teams** | Upstream experimental; not required here |

Suite floor versions: kit [`check-plugin-versions.sh`](https://github.com/173787247/dsh-wsl-kit/blob/master/scripts/check-plugin-versions.sh). Fault tree: [TROUBLESHOOTING.md](https://github.com/173787247/dsh-wsl-kit/blob/master/docs/TROUBLESHOOTING.md).

## Why

The model often assumes a Windows shell (`C:\`, PowerShell) even when the agent runs in Linux/WSL. This plugin adds a short system-prompt section so it prefers Linux paths, understands `/mnt/c`, and knows about Node 24 proxy quirks.

## What gets injected

Kept short on purpose:

- Distro name and Linux user
- Linux path mapping (`C:\Users\...` → `/mnt/c/Users/...`)
- CRLF / git caveats on `/mnt/c`
- Prefer Linux home over the Windows mount for day-to-day work
- `NODE_USE_ENV_PROXY=1` when Node 24 must use `HTTP(S)_PROXY`

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-env
# or:
dsh plugin --profile web add /absolute/path/to/dsh-wsl-env
```

Restart `dsh web`. Open a **new** session (existing sessions keep the old prompt).

## Verify

1. Send any message.
2. Trajectory → **SYSTEM** → **System Prompt** (not the Tools tab).
3. Search for `Windows Subsystem for Linux`.

You should see the distro name and path mapping. The UI concatenates sections, so the internal id `runtime:wsl-windows` may not appear as a heading.

Non-WSL hosts skip injection by default (`when: wsl`).

## Config

Later profile layers that set `config` **replace the whole object**—restate every key you keep:

```yaml
- id: dsh-wsl-env
  name: dsh-wsl-env
  config:
    when: wsl          # or: always
    order: 15
    extraNotes: "Prefer /home over /mnt/c for new files."
```

| Key | Default | Meaning |
|-----|---------|---------|
| `when` | `wsl` | Inject only in WSL, or `always` |
| `order` | `15` | Prompt section order |
| `extraNotes` | `""` | Extra operator notes appended to the section |

## Test

```sh
npm test
```

## License

MIT
