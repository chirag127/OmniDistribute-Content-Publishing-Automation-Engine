# Omni-Publisher Content Ecosystem

A production-ready, "batteries-included" content publishing system designed to distribute Markdown blog posts to 15+ platforms simultaneously. Built with Node.js 22, TypeScript, and modern tooling.

## Features

-   **Multi-Platform Publishing**: Publish to Dev.to, Hashnode, Medium, WordPress, Ghost, HubSpot, Blogger, Tumblr, Wix, Telegraph, Mastodon, Notion, Strapi, LinkedIn, Reddit, Discord, and more.
-   **Resilient Engine**: Parallel publishing with concurrency limits, exponential backoff retries, and idempotency checks (never publish the same post twice).
-   **Static Site Generator**: Built-in generator to create a fast, SEO-optimized static blog from your Markdown content.
-   **Automated Workflows**: GitHub Actions for daily publishing, site deployment, and converting issues to posts.
-   **Strict Type Safety**: 100% TypeScript with strict mode enabled.
-   **Modern Tooling**: Uses `pnpm` for dependency management and `Biome.js` for linting/formatting.

## Getting Started

### Prerequisites

-   Node.js 22+
-   pnpm

### Installation

\`\`\`bash
pnpm install
\`\`\`

### Configuration

1. Copy `.env.example` to `.env`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
2. Fill in the API keys for the platforms you want to use. See `.env.example` for detailed instructions on how to obtain each key.

### Usage

#### Generate Seed Content

Generate 50+ SEO-optimized blog posts (5 manual, 45 AI-generated concepts).

\`\`\`bash
pnpm run seed
\`\`\`

#### Build Static Site

Generate the static HTML site in `public/`.

\`\`\`bash
pnpm run build
\`\`\`

#### Publish Content

Publish all posts to enabled platforms.

\`\`\`bash
pnpm start
\`\`\`

Options:

-   `--dry-run`: Simulate publishing without actually sending requests.
-   `--force`: Re-publish posts even if they are marked as published in `.postmap.json`.

#### Deploy

Deploy the static site to GitHub Pages (handled automatically by CI/CD).

\`\`\`bash
pnpm run deploy
\`\`\`

## Project Structure

-   `content/posts/`: Markdown blog posts.
-   `src/adapters/`: Platform-specific adapters.
-   `src/utils/`: Shared utilities (logger, markdown parser, state manager).
-   `src/publish.ts`: Main publisher engine.
-   `src/build-site.ts`: Static site generator.

# Omni-Publisher Content Ecosystem

A production-ready, "batteries-included" content publishing system designed to distribute Markdown blog posts to 15+ platforms simultaneously. Built with Node.js 22, TypeScript, and modern tooling.

## Features

-   **Multi-Platform Publishing**: Publish to Dev.to, Hashnode, Medium, WordPress, Ghost, HubSpot, Blogger, Tumblr, Wix, Telegraph, Mastodon, Notion, Strapi, LinkedIn, Reddit, Discord, and more.
-   **Resilient Engine**: Parallel publishing with concurrency limits, exponential backoff retries, and idempotency checks (never publish the same post twice).
-   **Static Site Generator**: Built-in generator to create a fast, SEO-optimized static blog from your Markdown content.
-   **Automated Workflows**: GitHub Actions for daily publishing, site deployment, and converting issues to posts.
-   **Strict Type Safety**: 100% TypeScript with strict mode enabled.
-   **Modern Tooling**: Uses `pnpm` for dependency management and `Biome.js` for linting/formatting.

## Getting Started

### Prerequisites

-   Node.js 22+
-   pnpm

### Installation

```bash
pnpm install
```

### Configuration

1. Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
2. Fill in the API keys for the platforms you want to use. See `.env.example` for detailed instructions on how to obtain each key.

### Usage

#### Generate Seed Content

Generate 50+ SEO-optimized blog posts (5 manual, 45 AI-generated concepts).

```bash
pnpm run seed
```

#### Build Static Site

Generate the static HTML site in `public/`.

```bash
pnpm run build
```

#### Publish Content

Publish all posts to enabled platforms.

```bash
pnpm start
```

Options:

-   `--dry-run`: Simulate publishing without actually sending requests.
-   `--force`: Re-publish posts even if they are marked as published in `.postmap.json`.

#### Deploy

Deploy the static site to GitHub Pages (handled automatically by CI/CD).

```bash
pnpm run deploy
```

## Project Structure

-   `content/posts/`: Markdown blog posts.
-   `src/adapters/`: Platform-specific adapters.
-   `src/utils/`: Shared utilities (logger, markdown parser, state manager).
-   `src/publish.ts`: Main publisher engine.
-   `src/build-site.ts`: Static site generator.
-   `.github/workflows/`: CI/CD pipelines.

## Supported Platforms

| Platform      | Status                        | Auth Type                 |
| :------------ | :---------------------------- | :------------------------ |
| Dev.to        | ✅                            | API Key                   |
| Hashnode      | ✅                            | PAT (GraphQL)             |
| Medium        | ✅ (deprecated for new users) | Integration Token         |
| WordPress.com | ✅                            | OAuth Token               |
| Blogger       | ✅                            | Service Account           |
| Tumblr        | ✅                            | OAuth 1.0a                |
| Wix           | ✅                            | API Key                   |
| Telegraph     | ✅                            | Access Token              |
| Mastodon      | ✅                            | Bearer Token              |
| Notion        | ✅                            | Integration Secret        |
| Strapi        | ✅                            | API Token                 |
| LinkedIn      | ✅                            | OAuth 2.0                 |
| Reddit        | ✅                            | OAuth 2.0 (Password Flow) |
| Discord       | ✅                            | Webhook URL               |
| Showwcase     | ⚠️ (placeholder)              | API Key                   |

## License

MIT
