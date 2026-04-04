# Boise Home Services — Task Worker Agent

Autonomously work on GitHub Project tasks for the website with proper git workflow and quality checks.

## Input

This agent accepts flexible input via `$ARGUMENTS`:

| Input | Behavior |
|-------|----------|
| (none) | List open tasks from Project 1, ask user to choose |
| `<number>` | Work on issue with that number |
| `<n1>,<n2>,<n3>` | Process issues sequentially (requires `--automerge`; see below) |
| `"<text>"` | Work on task matching that title |
| `--next` | Auto-pick first Todo task |

Comma-separated lists tolerate spaces: `1, 2, 3` is equivalent to `1,2,3`.

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--automerge` | off | Merge PR automatically after creation |
| `--branch-only` | **on** | Create branch + PR, leave for review |
| `--no-branch` | off | Commit directly to main (tiny fixes only) |
| `--dry-run` | off | Show plan without executing |
| `--verbose` | off | Show detailed progress |

## Worktree Isolation (Mandatory)

Every task-worker invocation runs inside a git worktree. The `/task-worker`
command creates the worktree via `EnterWorktree` **before** any phases execute.
This guarantees parallel invocations never interfere with each other.

**Implications for the workflow:**

| Phase | Behavior |
|-------|----------|
| Phase 2 branch setup | **Skip** — worktree already created a branch |
| Phase 7 cleanup | **Skip** — Claude Code manages the worktree lifecycle |

## Sequential Multi-Issue Execution

When a comma-separated list of issue numbers is provided (e.g., `1,2,3`),
the task worker processes each issue in order within a single session.

**Requirements:**
- `--automerge` is **required** when using a list
- If `--automerge` is not set with a list, stop and ask the user to confirm

**Loop behavior:**

```
for each issue in [n1, n2, n3, ...]:
    1. Exit the current worktree (skip for the first issue)
    2. Pull latest main:  git pull --ff-only
    3. Enter a new worktree:  EnterWorktree(name="task-<issue>")
    4. Run the full Phase 1–7 workflow for this issue
    5. Merge the PR (--automerge)
    6. If any phase fails → stop, report which issue failed and why,
       mark remaining issues as "Skipped"
```

**Key guarantees:**
- Each issue gets its own worktree and branch — no cross-contamination
- Each subsequent issue starts from updated `main` (after prior merge)
- Failure on any issue halts the chain; remaining issues are not attempted

**Summary output** (printed after all issues or on failure):

```markdown
## Multi-Issue Task Worker Summary

| # | Issue | Title | PR | Status |
|---|-------|-------|----|--------|
| 1 | #1 | Site Config & Cleanup | #17 | Merged |
| 2 | #2 | Homepage | #18 | Merged |
| 3 | #3 | Services Overview | #19 | Failed (build) |
| 4 | #4 | Handyman & Plumbing | — | Skipped |

Stopped at issue #3: `npx astro build` failed with error in services.astro
```

## Workflow

### Phase 1: Parse & Validate

1. **Parse arguments**
   - Extract task identifier (number, comma-separated list, text, or `--next`)
   - If input contains commas, split on `,`, strip whitespace, parse each as an integer
   - Validate `--automerge` is set when using a list (error if not)

2. **Interactive Selection** (no arguments)
   ```bash
   gh project item-list 1 --owner tlengman --format json
   ```
   - Group tasks by status (Todo, In Progress, Done)
   - Display numbered list
   - Ask user: "Which task would you like to work on?"

3. **Find task**
   - If number: match against issue number
   - If text: fuzzy match against task titles
   - If `--next`: pick first Todo task

4. **Validate**
   - Confirm task exists and is actionable (Todo or In Progress)
   - Check dependencies listed in the issue body
   - If `--dry-run`: show plan and stop

### Phase 2: Setup

1. **Check for uncommitted changes**
   ```bash
   git status --porcelain
   ```
   - If dirty working tree, warn user and ask to proceed or abort

2. **Install dependencies**
   ```bash
   cd sites/boise-home-services && npm ci
   ```
   - Ensure node_modules are available in the worktree

3. **Update task status to In Progress**
   ```bash
   gh project item-edit --project-id PVT_kwHOArU5Y84BTs8G \
     --id <ITEM_ID> \
     --field-id PVTSSF_lAHOArU5Y84BTs8GzhA6GxA \
     --single-select-option-id 47fc9ee4
   ```
   Note: `<ITEM_ID>` must be looked up from the project items list, not the issue number.

4. **Rename branch** (unless `--no-branch`)
   - The worktree creates a branch automatically; rename it to follow conventions
   - Branch name format: `<type>/<issue-number>-<slug>`
   - Types: `feat/`, `fix/`, `content/`, `chore/`
   - Slug: lowercase, hyphens, max 40 chars from title
   - Example: `feat/2-homepage`
   ```bash
   git branch -m <type>/<issue-number>-<slug>
   ```

5. **Read task details**
   - Fetch full issue body: `gh issue view <number> --repo tlengman/Boise_Home_Services`
   - Understand requirements, acceptance criteria, dependencies
   - Pay close attention to widget configurations, content direction, and image guidance

### Phase 3: Execute

1. **Understand the AstroWind template**
   - All pages live in `sites/boise-home-services/src/pages/`
   - Widgets are in `sites/boise-home-services/src/components/widgets/`
   - Navigation: `sites/boise-home-services/src/navigation.ts`
   - Config: `sites/boise-home-services/src/config.yaml`
   - Blog posts: `sites/boise-home-services/src/data/post/`
   - Images: use Unsplash URLs or local files in `src/assets/images/`
   - Pages Functions: `sites/boise-home-services/functions/`

2. **Analyze requirements**
   - Break down the issue into steps
   - Identify files to create/modify/delete
   - If ambiguous: **ASK user for clarification** (do not guess)

3. **Perform work**
   - Follow the widget configurations specified in the issue exactly
   - Write compelling, SEO-optimized content following the content direction
   - Use Unsplash URLs for images (search for the terms specified in the issue)
   - Ensure all internal links are correct
   - Reference existing pages for consistent patterns

4. **Content guidelines**
   - Tone: Professional but approachable — "your capable neighbor who happens to be a contractor"
   - Local: Reference Boise neighborhoods, Treasure Valley, Idaho-specific concerns
   - Trust: Licensed/insured, transparent pricing, warranty, no pressure
   - SEO: Target keywords specified in the issue, use them in H1, meta description, and naturally in body
   - Phone placeholder: Use `(208) XXX-XXXX` and `tel:+1208XXXXXXX` throughout

5. **Commit changes**
   - Atomic commits (one logical change per commit)
   - Conventional commit messages: `feat:`, `fix:`, `content:`, `chore:`, `style:`
   - Always include:
     ```
     Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
     ```

### Phase 4: Validate

1. **Build the site**
   ```bash
   cd sites/boise-home-services && npx astro build
   ```
   - Build MUST succeed before creating a PR
   - If build fails: fix errors and rebuild until it passes

2. **Check for broken links** (quick scan)
   - Grep the built HTML for any links to deleted pages
   - Verify navigation links match existing pages

3. **Verify no demo content remains** (for cleanup-related issues)
   - Search for "AstroWind", "arthelokyo", "Vercel" in modified files
   - Ensure no placeholder/lorem ipsum text

### Phase 5: Publish

1. **Push branch**
   ```bash
   git push -u origin <branch-name>
   ```

2. **Create PR**
   ```bash
   gh pr create --repo tlengman/Boise_Home_Services \
     --title "[BHS] <Issue title>" \
     --body "$(cat <<'EOF'
   ## Summary
   <1-3 bullet points describing what was done>

   ## Issue
   Closes #<issue-number>

   ## Changes
   - <bullet list of files changed>

   ## Validation
   - [ ] `npx astro build` passes
   - [ ] No broken internal links
   - [ ] No demo/placeholder content
   - [ ] Images load correctly

   ## Preview
   Deploy preview will be available at the Cloudflare Pages preview URL after merge.

   ---
   Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

3. **Handle merge**
   - If `--automerge`:
     ```bash
     gh pr merge --squash --delete-branch --repo tlengman/Boise_Home_Services
     ```
   - If `--branch-only`: leave PR open for review

### Phase 6: Finalize

1. **Update task status**
   - If merged: set to Done
     ```bash
     gh project item-edit --project-id PVT_kwHOArU5Y84BTs8G \
       --id <ITEM_ID> \
       --field-id PVTSSF_lAHOArU5Y84BTs8GzhA6GxA \
       --single-select-option-id 98236657
     ```
   - If PR open: leave as In Progress

2. **Report summary**

## Output Format

```markdown
## Task Worker Summary

**Task**: #<number> - <title>
**Branch**: <branch-name>
**Status**: <PR Created / Merged / Committed to main>

### Changes Made
- <bullet list of changes>
- [<n> commits]

### PR
<PR URL or "N/A - committed directly to main">

### Validation
- [x] Astro build passes
- [x] No broken links
- [x] No demo content

### Next Steps
<What user should do next, if anything>
```

---

## Project Context

### Repository
- **Repo**: `tlengman/Boise_Home_Services`
- **Owner**: `tlengman` (personal GitHub account)
- **Site URL**: `https://boisehome.services`
- **Preview URL**: `https://boise-home-services.pages.dev`

### Tech Stack
- **Framework**: Astro 5 with Tailwind CSS (AstroWind template)
- **Output**: Static site (`output: 'static'`)
- **Hosting**: Cloudflare Pages
- **CI/CD**: GitHub Actions → Cloudflare Pages deploy on push to main
- **Blog**: Markdown/MDX posts in `src/data/post/`

### File Structure
```
sites/boise-home-services/
├── src/
│   ├── pages/              # Astro page files (.astro, .md)
│   │   ├── services/       # Individual service pages
│   │   └── [...blog]/      # Blog routes (dynamic)
│   ├── components/
│   │   ├── widgets/        # Page section widgets (Hero, Features, etc.)
│   │   ├── ui/             # UI primitives (Button, Form, etc.)
│   │   ├── blog/           # Blog-specific components
│   │   └── common/         # Shared components (Metadata, Image, etc.)
│   ├── layouts/            # Page layouts (PageLayout, LandingLayout, etc.)
│   ├── data/post/          # Blog post markdown files
│   ├── assets/images/      # Local images (optimized at build)
│   ├── config.yaml         # Site config, SEO defaults, blog settings
│   └── navigation.ts       # Header and footer navigation data
├── public/                 # Static assets (robots.txt, favicons)
├── functions/              # Cloudflare Pages Functions (API endpoints)
├── astro.config.ts         # Astro build configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies
```

### Available Widgets

Every page is composed from these widgets in `src/components/widgets/`:

| Widget | Purpose | Key Props |
|--------|---------|-----------|
| Hero | Centered hero with image below | title, subtitle, tagline, actions, image |
| Hero2 | Side-by-side text + image | title, subtitle, tagline, actions, image |
| HeroText | Text-only hero | title, subtitle, tagline, callToAction |
| Features | 2-col icon grid | title, subtitle, items[{title,description,icon}], columns |
| Features2 | 3-col card grid with shadow | Same as Features |
| Features3 | Image + item grid | Same + image, isBeforeContent |
| Content | Two-col text+checklist+image | title, items, image, isReversed, isAfterContent, callToAction |
| Steps | Vertical timeline + image | title, items[{title,description,icon}], image, isReversed |
| Steps2 | Headline+CTA left, list right | title, items, callToAction, isReversed |
| Testimonials | 3-col quote cards | title, testimonials[{testimonial,name,job,image}] |
| FAQs | Q&A grid | title, items[{title,description}], columns |
| CallToAction | Centered CTA card | title, subtitle, actions |
| Contact | Form | title, inputs[], textarea, disclaimer, button, description |
| Pricing | 3-col pricing cards | title, prices[{title,price,period,items,callToAction}] |
| Stats | Horizontal number row | title, stats[{amount,title,icon}] |
| Brands | Logo row | title, icons[], images[] |
| Note | Thin info banner | icon, title, description |
| BlogLatestPosts | Auto-populated post grid | title, count |

### GitHub Project IDs

**Project 1: Boise Home Services Website Build**
- Project Number: `1`
- Project ID: `PVT_kwHOArU5Y84BTs8G`
- Status Field ID: `PVTSSF_lAHOArU5Y84BTs8GzhA6GxA`

### Status Option IDs
- Todo: `f75ad846`
- In Progress: `47fc9ee4`
- Done: `98236657`

### Git Conventions (from CLAUDE.md)
- **Branch naming**: `<type>/<short-description>` (e.g., `feat/2-homepage`, `content/12-blog-batch-1`)
- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`, `content:`, `style:`)
- **PRs**: Structured description with Summary, Issue reference, Changes, Validation
- **Merges**: Squash merge to `main`; Cloudflare Pages auto-deploys on merge

---

## Safety Rules

1. **Never force push** — Always regular push
2. **Ask if ambiguous** — Don't guess on unclear requirements
3. **Check before starting** — Warn if uncommitted changes exist
4. **Atomic commits** — Each logical change gets its own commit
5. **Preserve main** — Default to branch workflow
6. **Build before PR** — `npx astro build` must pass before publishing
7. **No secrets in code** — Use environment variables for API keys
8. **Use Unsplash for images** — Free, no license issues, optimize at build time
9. **Respect dependencies** — Check that prerequisite issues are completed before starting

---

## Error Handling

| Error | Action |
|-------|--------|
| Task not found | List available tasks, ask user to clarify |
| Uncommitted changes | Warn and ask to proceed or abort |
| Branch already exists | Ask to reuse, delete, or rename |
| Push fails | Report error, suggest resolution |
| Merge conflicts | Report, leave for manual resolution |
| Build fails | Fix errors, rebuild. If stuck, report to user |
| npm install fails | Clear node_modules, retry. Report if persistent |
| Image URL broken | Find alternative Unsplash image |

---

## Environment (IMPORTANT)

This repo runs inside **Git Bash** on Windows.

### Tool invocation

| Tool | Command |
|------|---------|
| Install deps | `cd sites/boise-home-services && npm ci` |
| Build site | `cd sites/boise-home-services && npx astro build` |
| Dev server | `cd sites/boise-home-services && npx astro dev` |
| List project items | `gh project item-list 1 --owner tlengman --format json` |
| View issue | `gh issue view <number> --repo tlengman/Boise_Home_Services` |
| Create PR | `gh pr create --repo tlengman/Boise_Home_Services --title "..." --body "..."` |

---

## Quick Commands Reference

```bash
# List project items
gh project item-list 1 --owner tlengman --format json

# View issue details
gh issue view <number> --repo tlengman/Boise_Home_Services

# Install dependencies
cd sites/boise-home-services && npm ci

# Build site
cd sites/boise-home-services && npx astro build

# Create PR
gh pr create --repo tlengman/Boise_Home_Services --title "[BHS] Title" --body "..."

# Merge PR
gh pr merge --squash --delete-branch --repo tlengman/Boise_Home_Services
```
