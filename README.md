# dsh-wsl-env

DeepSeek Harness plugin: inject **WSL / Windows** path and shell facts into the system prompt.

给「浏览器在 Windows、agent 在 WSL」的环境用。模型默认不知道自己跑在 Linux 里，容易去用 `C:\`、PowerShell，或把 Windows 盘当工作区扫一遍。

注入内容（保持很短）：发行版与用户、Linux 路径映射、`/mnt/c` 的 CRLF、不要把 Windows 盘当日常 git 树、Node 24 要用代理时设 `NODE_USE_ENV_PROXY=1`。

## Install

Already running `dsh web`:

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-env
# or a local checkout:
dsh plugin --profile web add /absolute/path/to/dsh-wsl-env
```

Restart `dsh web`. Existing sessions keep the old prompt; open a **new** session.

## Verify

1. Send any message (Trajectory is empty until there is a turn).
2. Open **Trajectory** → click **SYSTEM / Initial System Prompt**.
3. Switch from the **Tools** tab to **System Prompt**.
4. Search for `Windows Subsystem for Linux`.

You should see the distro name (for example `Ubuntu-24.04`), Linux path rules, and a `C:\Users\...` → `/mnt/c/Users/...` mapping. The UI concatenates sections, so the internal name `runtime:wsl-windows` may not appear as a heading.

Non-WSL hosts skip injection by default. To force it, override the whole row in the profile `cordis.patch.yml` (later layers replace the entire `config`, so restate every key you still want):

```yaml
- id: dsh-wsl-env
  name: dsh-wsl-env
  config:
    when: always
    order: 15
    extraNotes: "Prefer /home over /mnt/c for new files."
```

## Config

| Key | Default | Meaning |
|---|---|---|
| `when` | `wsl` | Inject only in WSL, or `always`. |
| `order` | `15` | Prompt section order (after persona `0`, before tool guidance `100–199`). |
| `extraNotes` | `""` | Optional extra operator notes appended to the section. |

## Changelog

- **0.2.1** — map `C:\Users` from `USERPROFILE` when the Linux username differs; fall back to `/etc/os-release` when `WSL_DISTRO_NAME` is missing.
- **0.2.0** — also warn about CRLF on `/mnt/c`, git on the Windows mount, and `NODE_USE_ENV_PROXY` for Node 24.
- **0.1.0** — first release: distro, Linux paths, `C:\` → `/mnt/c`.

## Test

```sh
npm test
```

## Topics

On GitHub, add `dsh-plugin`.
