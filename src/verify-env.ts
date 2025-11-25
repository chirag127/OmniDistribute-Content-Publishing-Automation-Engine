import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Load dotenv
dotenv.config();

// 1. Check if .env file exists
const envPath = path.join(process.cwd(), ".env");
try {
  const exists = fs.existsSync(envPath);
  if (exists) {
    fs.statSync(envPath);
  } else {
    process.exit(1);
  }
} catch (_error: any) {
  process.exit(1);
}
const envVars = [
  "DEV_TO_API_KEY",
  "HASHNODE_TOKEN",
  "HASHNODE_PUBLICATION_ID",
  "MEDIUM_INTEGRATION_TOKEN",
  "MEDIUM_USER_ID",
  "WORDPRESS_TOKEN",
  "WORDPRESS_SITE_ID",
  "BLOGGER_CLIENT_EMAIL",
  "BLOGGER_PRIVATE_KEY",
  "BLOGGER_BLOG_ID",
  "TUMBLR_CONSUMER_KEY",
  "TUMBLR_CONSUMER_SECRET",
  "TUMBLR_TOKEN",
  "TUMBLR_TOKEN_SECRET",
  "TUMBLR_BLOG_IDENTIFIER",
  "WIX_API_KEY",
  "WIX_SITE_ID",
  "TELEGRAPH_ACCESS_TOKEN",
  "MASTODON_INSTANCE_URL",
  "MASTODON_ACCESS_TOKEN",
  "NOTION_TOKEN",
  "NOTION_DATABASE_ID",
  "STRAPI_URL",
  "STRAPI_TOKEN",
  "LINKEDIN_ACCESS_TOKEN",
  "LINKEDIN_PERSON_URN",
  "REDDIT_CLIENT_ID",
  "REDDIT_CLIENT_SECRET",
  "REDDIT_USERNAME",
  "REDDIT_PASSWORD",
  "REDDIT_SUBREDDIT",
  "DISCORD_WEBHOOK_URL",
  "SHOWWCASE_API_KEY",
];

const loadedVars: string[] = [];
const missingVars: string[] = [];

for (const varName of envVars) {
  const value = process.env[varName];
  if (value && value.trim() !== "") {
    loadedVars.push(varName);
  } else {
    missingVars.push(varName);
  }
}
const adapterConfigs = [
  {
    name: "Dev.to",
    required: ["DEV_TO_API_KEY"],
  },
  {
    name: "Hashnode",
    required: ["HASHNODE_TOKEN", "HASHNODE_PUBLICATION_ID"],
  },
  {
    name: "Medium",
    required: ["MEDIUM_INTEGRATION_TOKEN", "MEDIUM_USER_ID"],
  },
  {
    name: "WordPress",
    required: ["WORDPRESS_TOKEN", "WORDPRESS_SITE_ID"],
  },
  {
    name: "Blogger",
    required: ["BLOGGER_CLIENT_EMAIL", "BLOGGER_PRIVATE_KEY", "BLOGGER_BLOG_ID"],
  },
  {
    name: "Tumblr",
    required: [
      "TUMBLR_CONSUMER_KEY",
      "TUMBLR_CONSUMER_SECRET",
      "TUMBLR_TOKEN",
      "TUMBLR_TOKEN_SECRET",
    ],
  },
  {
    name: "Wix",
    required: ["WIX_API_KEY", "WIX_SITE_ID"],
  },
  {
    name: "Telegraph",
    required: ["TELEGRAPH_ACCESS_TOKEN"],
  },
  {
    name: "Mastodon",
    required: ["MASTODON_ACCESS_TOKEN", "MASTODON_INSTANCE_URL"],
  },
  {
    name: "Notion",
    required: ["NOTION_TOKEN", "NOTION_DATABASE_ID"],
  },
  {
    name: "Strapi",
    required: ["STRAPI_URL", "STRAPI_TOKEN"],
  },
  {
    name: "LinkedIn",
    required: ["LINKEDIN_ACCESS_TOKEN", "LINKEDIN_PERSON_URN"],
  },
  {
    name: "Reddit",
    required: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USERNAME", "REDDIT_PASSWORD"],
  },
  {
    name: "Discord",
    required: ["DISCORD_WEBHOOK_URL"],
  },
];

let enabledCount = 0;
for (const adapter of adapterConfigs) {
  const allPresent = adapter.required.every(
    (varName) => process.env[varName] && process.env[varName]?.trim() !== "",
  );
  if (allPresent) {
    enabledCount++;
  } else {
  }
}

// Read .env file content to check for issues
const envContent = fs.readFileSync(envPath, "utf8");

// Check for BOM (Byte Order Mark)
if (envContent.charCodeAt(0) === 0xfeff) {
}

// Check for quotes around values
const lines = envContent.split("\n");
let hasQuotedValues = false;
for (const line of lines) {
  if (line.trim().startsWith("#") || !line.includes("=")) continue;
  const [, value] = line.split("=");
  if (value && (value.startsWith('"') || value.startsWith("'"))) {
    hasQuotedValues = true;
    break;
  }
}
if (hasQuotedValues) {
}

// Check for empty lines before keys
const hasEmptyLines = envContent.includes("\n\n");
if (hasEmptyLines) {
}

if (enabledCount === 0) {
} else {
}
