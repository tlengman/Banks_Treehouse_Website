# Task Worker

Work on a GitHub Project task with proper git workflow for the Boise Home Services website.

Read and follow the agent specification in `agents/task-worker.md`.

## Task Selection

$ARGUMENTS

If no arguments provided, list available tasks from Project 1 and ask which to work on.

**Comma-separated lists** (e.g., `1,2,3 --automerge`) are supported — see
the "Sequential Multi-Issue Execution" section in `agents/task-worker.md`.
When a list is detected, loop through each issue sequentially: exit the
current worktree, pull latest main, enter a new worktree, and run the full
workflow. `--automerge` is required for lists.

## Worktree Isolation (always runs first)

Before any git or file operations, create an isolated worktree so parallel
task-worker invocations never conflict:

1. **Enter a worktree** using the `EnterWorktree` tool
   - If an issue number is available, name it `task-<issue>` (e.g., `task-2`)
   - Otherwise let Claude Code generate a random name
2. All subsequent phases run inside this worktree

## Execution

1. Parse arguments to identify the target task (single number, comma-separated list, text, or `--next`)
2. If comma-separated list: validate `--automerge` is set, then loop per "Sequential Multi-Issue Execution"
3. Follow the phase-by-phase workflow in `agents/task-worker.md`
4. Ensure the Astro site builds successfully before creating PR
5. Report summary when complete (use multi-issue summary table for lists)
