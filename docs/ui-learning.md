Betul. Koreksi pattern-nya seperti ini:

````md
# Docs Detail Page UI Pattern

## Layout Structure

Use a 3-column documentation layout:

```text
Top Navigation
├─ Breadcrumb
├─ Page Title
└─ Tab Switcher

Main Layout
├─ Left TOC
├─ Main Content
└─ Right Related Content
```
````

## Top Navigation

Top area must contain:

- Breadcrumb path
- Current documentation title
- Tab switching navigation

Example:

```text
REST API / Authentication

Quickstart for GitHub REST API

[ GitHub CLI ] [ curl ] [ JavaScript ]
```

Tab behavior:

- Active tab has strong text and bottom indicator
- Tabs switch content variant for the same documentation topic
- Tabs must stay close to the title, before article body

## Left Sidebar: TOC

The left sidebar is the documentation table of contents.

Purpose:

- Navigate docs hierarchy
- Show current docs section
- Support nested menu groups
- Highlight active page

Example:

```text
REST API
API Version: latest

Quickstart

About the REST API
Using the REST API
Authentication
Guides
Actions
Activity
Agent tasks
Apps
Billing
Branches
```

Behavior:

- Sticky
- Independently scrollable
- Collapsible groups
- Active item highlighted with left indicator
- API version selector appears above TOC when relevant

## Center: Main Content

The center column is the article body.

Structure:

```text
Introduction
Using GitHub CLI in the command line
Using GitHub CLI in GitHub Actions
Next steps
```

Rules:

- Max width around 760–860px
- Markdown-friendly
- Strong typography hierarchy
- Code blocks with copy button
- Step list support
- Heading anchor links
- Tab content changes the examples or commands

## Right Sidebar: Related Content

The right sidebar is not the TOC. It is for contextual support content.

Examples:

```text
Related content

Authentication
Rate limits
GitHub CLI
REST API reference
Troubleshooting
```

Can include:

- Related articles
- Next/previous docs
- Helpful links
- API references
- “Was this helpful?”
- External resources

Behavior:

- Sticky on desktop
- Hidden or moved below content on smaller screens
- Should not duplicate the left TOC

## Final Architecture

```text
┌───────────────────────────────────────────────────────────────┐
│ Breadcrumb                                                    |
│ Title                                                         |
│ Tabs                                                          │
├────────────────┬──────────────────────────┬───────────────────┤
│ Docs TOC       │ Article Content           │ Related Content  │
│ Navigation     │                          │                   │
└────────────────┴──────────────────────────┴───────────────────┘
```

## Instruction

Build a GitHub Docs-inspired detail page where:

1. Left column is the documentation TOC.
2. Center column is the active article content.
3. Right column is related content, not article headings.
4. Top content area includes breadcrumb, page title, description, and tab switcher.
5. Tabs switch article examples or content variants.
6. Use Tailwind semantic tokens and existing shadcn-vue components.
7. Keep layout dense, technical, and documentation-first.

```

```
