# dsh-wsl-env

DeepSeek Harness plugin: inject **WSL / Windows** path and shell facts into the system prompt.

Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 ↓](#中文)

---

## English

### Why

The model often assumes a Windows shell (`C:\`, PowerShell) even when the agent runs in Linux/WSL. This plugin adds a short system-prompt section so it prefers Linux paths, understands `/mnt/c`, and knows about Node 24 proxy quirks.

### What gets injected

Kept short on purpose:

- Distro name and Linux user
- Linux path mapping (`C:\Users\...` → `/mnt/c/Users/...`)
- CRLF / git caveats on `/mnt/c`
- Prefer Linux home over the Windows mount for day-to-day work
- `NODE_USE_ENV_PROXY=1` when Node 24 must use `HTTP(S)_PROXY`

### Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-env
# or:
dsh plugin --profile web add /absolute/path/to/dsh-wsl-env
```

Restart `dsh web`. Open a **new** session (existing sessions keep the old prompt).

### Verify

1. Send any message.
2. Trajectory → **SYSTEM** → **System Prompt** (not the Tools tab).
3. Search for `Windows Subsystem for Linux`.

You should see the distro name and path mapping. The UI concatenates sections, so the internal id `runtime:wsl-windows` may not appear as a heading.

Non-WSL hosts skip injection by default (`when: wsl`).

### Config

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

### Test

```sh
npm test
```

### License

MIT

---

## 中文

### 为什么需要

Agent 跑在 WSL（Linux）里时，模型仍常按 Windows 习惯写 `C:\`、PowerShell。本插件往 system prompt 注入一小段事实，让它优先用 Linux 路径，并了解 `/mnt/c` 与 Node 24 代理注意点。

### 注入内容

- 发行版与 Linux 用户
- 路径映射（`C:\Users\...` → `/mnt/c/Users/...`）
- `/mnt/c` 上的 CRLF / git 注意点
- 日常工作优先家目录，而不是 Windows 盘
- 需要代理时提醒 `NODE_USE_ENV_PROXY=1`

### 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-env
```

重启 `dsh web`，并开**新会话**。

### 验证

Trajectory → SYSTEM → System Prompt，搜索 `Windows Subsystem for Linux`。

### 配置

| 键 | 默认 | 含义 |
|----|------|------|
| `when` | `wsl` | 仅 WSL 注入，或 `always` |
| `order` | `15` | 段落顺序 |
| `extraNotes` | `""` | 追加运维说明 |

### 许可

MIT
