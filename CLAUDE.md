# CLAUDE.md — Project Context for AI Assistants

This file provides quick context for Claude Code sessions working on this project.

## Project Summary

**Autonomous Website Platform** is an AI-managed website development and deployment system built on Claude Code + GitHub + Cloudflare. The project uses Claude as the primary development agent — generating, testing, deploying, and maintaining websites on custom domains — with GitHub as the version control backbone and Cloudflare as the hosting/infrastructure layer. All workflows are accessible through Slack, Cowork scheduled tasks, Claude Code CLI, and GitHub Issues.

The system extends beyond website generation into continuous automated management across three operational domains: **security**, **SEO**, and **marketing/advertising**.

## Architecture Overview

```
┌────────────────────────────────────────────────────────────┐
│                    ACCESS CHANNELS                          │
├──────────┬───────────┬──────────────┬──────────────────────┤
│  Slack   │  Cowork   │  Claude Code │   GitHub Issues      │
│ always-on│ scheduled │  CLI / Web   │   async triggers     │
└────┬─────┴─────┬─────┴──────┬───────┴──────────┬───────────┘
     │           │            │                  │
     ▼           ▼            ▼                  ▼
┌────────────────────────────────────────────────────────────┐
│                    CLAUDE CODE                              │
│  Web sessions · CLI sessions · GH Action · Agent SDK       │
│  ┌──────────────────────────────────────────────────┐      │
│  │ MCP Servers: Cloudflare, GitHub, Slack, GSC,     │      │
│  │ Brevo, Google Ads, GA4, Firecrawl                │      │
│  └──────────────────────────────────────────────────┘      │
├────────────────────────┬───────────────────────────────────┤
│                        │  CF Container (optional headless) │
└────────────┬───────────┴───────────────┬───────────────────┘
             │  git push / open PR       │  git push
             ▼                           ▼
┌────────────────────────────────────────────────────────────┐
│                      GITHUB                                 │
│  Repos · Pull Requests · Actions CI/CD · Change History    │
│  ┌──────────────────────────────────────────────────┐      │
│  │ Actions: security-review, deploy, lighthouse     │      │
│  └──────────────────────────────────────────────────┘      │
└────────────────────────┬───────────────────────────────────┘
                         │  auto-deploy on merge
                         ▼
┌────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE                                │
│  ┌─────────┐  ┌─────────┐  ┌──────┐  ┌────────────┐      │
│  │  Pages  ├──▶ Workers ├──▶ DNS  │  │ WAF / TLS  │      │
│  └─────────┘  └─────────┘  └──────┘  └────────────┘      │
└────────────────────────┬───────────────────────────────────┘
                         │  custom domain + CDN + SSL
                         ▼
              ┌──────────────────────┐
              │    yoursite.com      │
              └──────────────────────┘
```

## Workflow Rules

This is the **orchestration workspace**. Claude Code sessions here may:
- Read and explore all project files
- Create/update GitHub issues and project items
- Research, plan, and document
- Run infrastructure commands (Cloudflare MCP, GitHub CLI)
- Execute agent commands (`/infra-setup`, `/site-builder`, `/security-audit`, etc.)

Code changes to the website(s) are performed via agents that create branches, make changes, and open PRs. Direct pushes to `main` are never allowed.

### Git Conventions
- **Branch naming**: `<type>/<short-description>` (e.g., `feat/add-booking-page`, `fix/broken-nav-link`, `security/update-deps`)
- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`, `security:`, `seo:`, `content:`)
- **PRs**: Always created via agents with a structured description including what changed, why, and any data that informed the decision
- **Merges**: Squash merge to `main`; Cloudflare Pages auto-deploys on merge

## Repository Structure

```
website-platform/
├── sites/
│   └── <site-name>/                # Each managed site gets a directory
│       ├── src/                    # Source files (HTML, CSS, JS, assets)
│       ├── public/                 # Static assets
│       ├── package.json            # Build config (if using a framework)
│       └── wrangler.toml           # Cloudflare Pages/Workers config
├── workers/
│   ├── redirects/                  # Edge redirect logic
│   ├── ab-testing/                 # A/B test variant routing
│   └── security-headers/           # Transform rules at the edge
├── agents/
│   ├── infra-setup.md              # Cloudflare + GitHub bootstrap agent
│   ├── site-builder.md             # Website generation agent
│   ├── security-auditor.md         # Security audit + remediation agent
│   ├── seo-auditor.md              # SEO audit + optimization agent
│   └── marketing-analyst.md        # Marketing/ad analysis agent
├── config/
│   ├── cloudflare/                 # Tracked CF config (WAF rules, DNS baseline)
│   ├── scheduled-tasks/            # Cowork task prompt templates
│   └── mcp-servers.json            # MCP server registry for this project
├── reports/
│   ├── security/                   # Security audit reports (auto-generated)
│   ├── seo/                        # SEO audit reports
│   └── marketing/                  # Marketing performance reports
├── docs/
│   ├── architecture.md             # Detailed architecture documentation
│   ├── runbooks/                   # Operational runbooks
│   └── decisions/                  # Architecture Decision Records (ADRs)
├── .github/
│   └── workflows/
│       ├── deploy.yml              # Cloudflare Pages deployment
│       ├── security-review.yml     # Claude security review on PRs
│       └── lighthouse.yml          # Performance/SEO CI checks
├── CLAUDE.md                       # This file
└── AGENTS.md                       # Contributor & agent guidelines
```

## Bootstrap Process

The initial setup is designed to be driven entirely from a Claude Code CLI session on your laptop. Claude uses the Cloudflare MCP server to provision infrastructure and the GitHub CLI to create the repository.

### Phase 1: Environment Setup
```bash
# Verify Claude Code is installed and authenticated
claude --version

# Verify GitHub CLI
gh auth status

# Set environment variables (add to PowerShell profile or .env)
$env:CLOUDFLARE_API_TOKEN = "<your-token>"    # Scoped: Pages, Workers, DNS, WAF
$env:CLOUDFLARE_ACCOUNT_ID = "<your-acct-id>"
$env:GITHUB_TLENGMAN_WEBSITE_PLATFORM_AGENT_KEY = "<your-token>"  # Fine-grained PAT: repo, workflow (no Projects — use gh CLI for that)
```

### Phase 2: MCP Server Configuration
Add to Claude Code MCP config (`~/.claude/settings.json` or project `.mcp.json`):
```json
{
  "mcpServers": {
    "cloudflare": {
      "url": "https://mcp.cloudflare.com/mcp"
    },
    "github": {
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "slack": {
      "type": "http",
      "url": "https://mcp.slack.com/mcp"
    },
    "gsc": {
      "command": "python",
      "args": ["-m", "mcp_gsc"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "<path-to-service-account-key>"
      }
    },
    "brevo": {
      "url": "https://mcp.brevo.com/v1/brevo/mcp",
      "headers": {
        "Authorization": "Bearer <your-brevo-mcp-token>"
      }
    }
  }
}
```

### Phase 3: Infrastructure Bootstrap
Run `/infra-setup` to have Claude:
1. Create the GitHub repository
2. Create the Cloudflare Pages project via MCP
3. Connect the Pages project to the GitHub repo
4. Configure custom domain DNS records via MCP
5. Set up SSL, security headers, and baseline WAF rules
6. Create GitHub Actions workflow files
7. Commit and push the initial scaffold

## Agents

Agents are invoked via slash commands. Each agent reads its specification from `agents/<name>.md` and follows a phase-by-phase workflow.

### `/infra-setup` — Infrastructure Bootstrap Agent
**Purpose**: Provision Cloudflare infrastructure and GitHub repo from scratch.
**When to use**: First-time project setup, adding a new site, or major infrastructure changes.
**Capabilities**: Creates CF Pages projects, configures DNS, sets up WAF rules, creates GH repos and Actions workflows, manages SSL settings.

### `/site-builder [description or issue#]` — Website Generation Agent
**Purpose**: Generate or modify website code based on a description or GitHub issue.
**When to use**: Building new pages, implementing design changes, adding features.
**Workflow**: Creates branch → generates/modifies code → runs local tests → commits → opens PR.
**Capabilities**: Full-stack web development (HTML, CSS, JS, frameworks), asset optimization, structured data generation, accessibility compliance.

### `/security-audit [--full | --quick | --deps]` — Security Auditor Agent
**Purpose**: Audit code and infrastructure for security vulnerabilities.
**When to use**: Before releases, on schedule (weekly), or when investigating incidents.
**Workflow**: Scans codebase → checks dependencies → audits CF config via MCP → generates report → opens fix PRs for auto-remediable issues.
**Capabilities**:
- Code: XSS, injection, auth flaws, hardcoded secrets, insecure data handling
- Dependencies: Known CVEs via Dependabot/GitHub security scanning
- Infrastructure: WAF rules, TLS config, security headers, DNS integrity
- Config: Claude Code settings, MCP server permissions, hook injection analysis

### `/seo-audit [--technical | --content | --full]` — SEO Auditor Agent
**Purpose**: Audit and optimize for search engine visibility.
**When to use**: Weekly scheduled task, after content changes, or when investigating ranking drops.
**Workflow**: Pulls GSC data → crawls site → analyzes against best practices → opens fix PRs → posts report to Slack.
**Capabilities**:
- Technical: Meta tags, structured data (JSON-LD), sitemaps, robots.txt, canonical URLs, page speed, mobile usability
- Content: Title/description optimization, heading structure, internal linking, content freshness, keyword alignment
- Monitoring: Ranking position tracking, CTR analysis, crawl error detection, indexing status

### `/marketing-report [--daily | --weekly | --monthly]` — Marketing Analyst Agent
**Purpose**: Analyze marketing performance across all channels and recommend actions.
**When to use**: On schedule or on-demand when evaluating campaigns.
**Workflow**: Pulls data from ad platforms + Brevo + GSC + GA4 → cross-references → generates insights → recommends actions → posts to Slack.
**Capabilities**:
- Ads: Campaign performance, keyword waste detection, budget pacing, ROAS tracking
- Email: Open/click rates, deliverability, A/B test results, list health
- Attribution: Cross-channel ROI, customer journey analysis, conversion path mapping
- Content: Landing page performance, A/B test results, CWV impact on conversions

## MCP Server Reference

| Server | URL / Command | Purpose | Auth |
|--------|--------------|---------|------|
| **Cloudflare** | `https://mcp.cloudflare.com/mcp` | Full API (2,500+ endpoints): Pages, Workers, DNS, WAF, R2, Zero Trust | OAuth or API Token |
| **GitHub** | `https://api.githubcopilot.com/mcp/` | Repos, PRs, Actions, Issues, Projects | GitHub token |
| **Slack** | `https://mcp.slack.com/mcp` | Channel messaging, search, context | OAuth |
| **Google Search Console** | Local: `mcp-gsc` Python server | Search analytics, URL inspection, sitemaps | Service account JSON |
| **Brevo** | `https://mcp.brevo.com/v1/brevo/mcp` | Email campaigns, contacts, transactional, SMS, analytics | MCP API key |
| **Google Ads** | Local: `mcp-google-ads` or Pipeboard | Campaign data, keywords, budgets, search terms | OAuth + Dev Token |
| **Meta Ads** | Remote: Pipeboard MCP | Facebook/Instagram campaigns, creative, audiences | Pipeboard token |
| **GA4** | Via Composio or Windsor.ai | On-site analytics, conversion funnels, attribution | OAuth |
| **Firecrawl** | Local MCP server | Site crawling, competitor analysis, content extraction | API key |

### Adding MCP Servers to Claude Code
```bash
# Remote HTTP servers (preferred — no local install)
claude mcp add cloudflare --url https://mcp.cloudflare.com/mcp
claude mcp add brevo --url https://mcp.brevo.com/v1/brevo/mcp --header "Authorization: Bearer $BREVO_MCP_TOKEN"

# Local servers (require runtime installed)
claude mcp add gsc -- python -m mcp_gsc
claude mcp add google-ads -- npx mcp-google-ads
```

## GitHub Actions

### Security Review (on every PR)
```yaml
# .github/workflows/security-review.yml
name: Security Review
permissions:
  pull-requests: write
  contents: read
on:
  pull_request:
    types: [opened, synchronize, ready_for_review, reopened]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2
      - uses: anthropics/claude-code-security-review@main
        with:
          comment-pr: true
          claude-api-key: ${{ secrets.CLAUDE_API_KEY }}
```

### Cloudflare Pages Deploy (on merge to main)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy ./sites/<site-name>/dist --project-name=<project-name>
```

### Lighthouse CI (on PRs touching site code)
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse Audit
on:
  pull_request:
    paths: ['sites/**']
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            https://<preview-url>/
          budgetPath: ./config/lighthouse-budget.json
```

## Scheduled Task Templates

These are prompt templates for Cowork scheduled tasks. Each runs on a cadence with only the MCP servers it needs.

### Daily: Ad Performance Monitor
**Cadence**: Daily 8:00 AM · **MCP**: Google Ads, Meta Ads · **Action**: Slack report
```
Pull Google Ads and Meta Ads performance for the last 24 hours.
Compare spend, clicks, conversions, and ROAS against the 7-day average.
Flag campaigns where CPA increased >25% or ROAS dropped below target.
For flagged campaigns, analyze search terms and recommend negative keywords.
Post a summary to Slack #marketing with specific recommended actions.
```

### Daily: Crawl Error Monitor
**Cadence**: Daily 7:00 AM · **MCP**: GSC, GitHub · **Action**: Auto-fix or Slack alert
```
Check Google Search Console for new crawl errors and 404s in the last 24 hours.
For each 404: determine if a redirect target exists (renamed or moved page).
If obvious redirect: add to the redirect Worker config, create branch, open PR.
If ambiguous: post to Slack #seo with the URL, referring pages, and suggestions.
Also check for any pages that dropped out of the index unexpectedly.
```

### Weekly: Security Audit
**Cadence**: Monday 6:00 AM · **MCP**: GitHub, Cloudflare · **Action**: PRs + Slack report
```
Run /security-audit --full on the site repository.
Check dependencies for known CVEs and open a PR for any updates.
Audit Cloudflare WAF rules and TLS settings via MCP — compare against the
baseline in config/cloudflare/. Flag any drift.
Check security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy).
Scan for hardcoded secrets or exposed API keys in the codebase.
Post a security summary to Slack #security with severity ratings.
```

### Weekly: SEO Health Check
**Cadence**: Monday 9:00 AM · **MCP**: GSC, Firecrawl, GitHub · **Action**: PRs + Slack report
```
Pull 28-day search performance from GSC. Compare against previous 28 days.
Identify: pages with >20% impression drops, new crawl errors, indexing issues.
Run a technical audit: missing meta descriptions, duplicate titles, invalid
structured data, orphan pages not in sitemap, broken internal links.
For auto-fixable issues: create branch, fix, open PR.
For content issues (title/description rewrites): draft recommendations.
Identify quick wins: pages ranking 5-20 with >500 impressions where the title
doesn't match the top queries. Suggest optimized titles.
Post full report to Slack #seo.
```

### Weekly: Email Performance Review
**Cadence**: Friday 2:00 PM · **MCP**: Brevo · **Action**: Slack report
```
Pull Brevo campaign analytics for all sends this week.
Report: open rates, click rates, bounce rates, unsubscribes by campaign.
Compare against historical averages (last 30 days).
For underperforming campaigns: analyze subject lines, send times, segments.
Check contact list health: bounce rate trends, unsubscribe velocity.
Post summary to Slack #marketing with specific improvement recommendations.
```

### Monthly: Full Marketing ROI Analysis
**Cadence**: 1st of month, 10:00 AM · **MCP**: Google Ads, Meta Ads, GSC, Brevo, GA4 · **Action**: Slack report
```
Pull last 30 days of data from all marketing channels.
Calculate total spend and revenue attributable to each channel.
Produce channel-by-channel ROAS breakdown.
Identify underperforming channels relative to cost.
Analyze customer acquisition cost trends over the last 3 months.
Recommend specific budget reallocation with dollar amounts.
Compare organic vs paid traffic trends and conversion rates.
Post comprehensive analysis to Slack #marketing.
```

## Cloudflare Infrastructure Baseline

Track infrastructure configuration in `config/cloudflare/` so changes are auditable:

```
config/cloudflare/
├── dns-records.json          # Expected DNS records (baseline for drift detection)
├── waf-rules.json            # Custom WAF rules with rationale comments
├── security-headers.json     # Transform rules for security headers
├── page-rules.json           # Caching and redirect rules
└── tls-settings.json         # SSL mode, min TLS version, cipher preferences
```

When agents modify Cloudflare settings via MCP, they must also update the corresponding config file and include it in the PR. This creates a complete audit trail of who (or what) changed infrastructure and why.

## Environment Notes

- **OS**: Windows 11 (PowerShell) with Claude Code CLI installed
- **Node.js**: Required for local MCP servers and Wrangler CLI
- **Python**: Required for GSC MCP server and Firecrawl
- **Wrangler**: Cloudflare CLI (`npm install -g wrangler`) for local dev/deploy
- **GitHub CLI**: `gh` for issue/project management
- **Secrets**: Never commit. Use environment variables or `--env` flags.
  Store tokens in Windows Credential Manager or `.env` files (gitignored).

### Local Development
```bash
# Start local dev server for a site
cd sites/<site-name>
npx wrangler pages dev ./dist

# Preview with Workers (if using edge logic)
npx wrangler dev workers/security-headers/index.js
```

## Quick Commands

```bash
# Agents
/infra-setup                        # Bootstrap Cloudflare + GitHub infrastructure
/site-builder "Add a booking page"  # Generate site changes from description
/site-builder 42                    # Implement GitHub issue #42
/security-audit --full              # Full security audit
/security-audit --deps              # Dependency-only scan
/seo-audit --technical              # Technical SEO audit
/seo-audit --content                # Content optimization audit
/marketing-report --weekly          # Weekly marketing performance report

# Infrastructure (via Cloudflare MCP)
# These are natural language — Claude translates to MCP calls:
"List all DNS records for my zone"
"Add a CNAME record pointing www to my Pages project"
"Show current WAF rules for my zone"
"What's my current TLS minimum version?"

# GitHub
gh repo view
gh issue list
gh pr list
gh project item-list <project-id> --owner <owner> --format json

# Deployment
npx wrangler pages deploy ./sites/<site>/dist --project-name=<name>
npx wrangler pages project list

# Local MCP server management
claude mcp list
claude mcp add <name> --url <url>
claude mcp remove <name>
```

## Security Principles

1. **Least privilege MCP tokens**: Each MCP server gets only the permissions it needs. The Cloudflare token for SEO tasks doesn't need WAF write access.
2. **Git as audit trail**: Every infrastructure change is tracked. WAF rules, DNS records, security headers — if Claude modifies it, the change is committed.
3. **Human-in-the-loop gates**: Technical fixes (broken links, missing alt text, dependency updates) can auto-merge with CI checks. Content changes, security policy changes, and budget decisions require PR approval.
4. **No secrets in code**: API keys, tokens, and credentials live in environment variables, Windows Credential Manager, or GitHub Secrets — never in committed files.
5. **Branch protection**: `main` requires PR approval + passing CI (security review, Lighthouse) before merge.

## What to Read First

1. This file (CLAUDE.md)
2. `AGENTS.md` — Contributor & agent guidelines
3. `agents/infra-setup.md` — Infrastructure bootstrap agent spec
4. `docs/architecture.md` — Detailed architecture documentation

## Current Priorities

1. **IMMEDIATE**: Bootstrap infrastructure (run `/infra-setup` to create repo, CF project, DNS)
2. **HIGH**: Build initial site and deploy to custom domain
3. **HIGH**: Set up GitHub Actions (security review, deploy, Lighthouse)
4. **HIGH**: Configure Cowork scheduled tasks for daily/weekly automation
5. **MEDIUM**: Connect all MCP servers (GSC, Brevo, Google Ads, GA4)
6. **MEDIUM**: Build out security, SEO, and marketing agent specs
7. **LOWER**: A/B testing infrastructure via Cloudflare Workers
8. **LOWER**: Cloudflare Container setup for headless agent execution
