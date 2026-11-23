# Desk buddy

A dot-matrix face that shows what your coding agent is doing: working, needs you, failed, done, asleep.

```bash
node buddy/buddy.mjs        # then open http://127.0.0.1:4747
```

Add the hooks in [`hooks.json`](hooks.json) to `.claude/settings.json` (your project's or `~/.claude/settings.json`).
Claude Code then sets the mood as it works:

| Claude Code event | Face |
|---|---|
| You send a prompt, it uses a tool | working |
| It needs your permission or input | needs you |
| A tool call fails | failed |
| It finishes | done |
| The session ends, or 2 minutes of quiet | asleep |

Any other agent or script can set it too: `curl -X POST http://127.0.0.1:4747/mood/happy`
(`idle`, `thinking`, `waiting`, `happy`, `sad`, `sleepy`). `GET /mood` reads it.

The server has no dependencies, listens on 127.0.0.1 only, serves four files, and accepts only those six moods.
The hooks run in the background (`async`) and give up after a second, so they never slow your agent down.

ESP32 version: in progress. Try it in your browser first: https://elrootlabs.com/opensource/dotmatrix/desk-buddy
