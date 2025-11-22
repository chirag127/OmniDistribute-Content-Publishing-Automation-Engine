import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { marked } from "marked";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

const execAsync = promisify(exec);

export class EdgeOneAdapter implements Adapter {
    name = "edgeone";
    enabled = true;

    async validate(): Promise<boolean> {
        if (!process.env.EDGEONE_TOKEN) {
            logger.warn("EDGEONE_TOKEN is missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        const tempDir = path.join(process.cwd(), "temp", "edgeone", post.slug!);

        try {
            // 1. Prepare Content (HTML)
            await fs.mkdir(tempDir, { recursive: true });
            const htmlContent = await marked(post.content);
            const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title}</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <article>
        <h1>${post.title}</h1>
        ${htmlContent}
        <hr>
        <p><small>Original post: <a href="${post.publishedUrl}">${post.publishedUrl}</a></small></p>
    </article>
</body>
</html>`;

            await fs.writeFile(path.join(tempDir, "index.html"), fullHtml);

            // 2. Deploy using CLI
            // Command: npx -y edgeone pages deploy <dir> --name <project-name> --token <token>
            // We use a sanitized slug as project name to ensure uniqueness/persistence
            const projectName = `post-${post.slug}`.substring(0, 30); // Limit length if needed

            logger.info(`Deploying to EdgeOne Pages: ${projectName}`);

            const { stdout, stderr } = await execAsync(
                `npx -y edgeone pages deploy "${tempDir}" --name "${projectName}" --token "${process.env.EDGEONE_TOKEN}" --force`,
                { env: { ...process.env, CI: "true" } } // CI=true might help avoid interactivity
            );

            logger.debug(`EdgeOne Output: ${stdout}`);
            if (stderr) logger.warn(`EdgeOne Stderr: ${stderr}`);

            // 3. Parse URL from output
            // Output usually contains: "Visit your site at: https://..."
            const match = stdout.match(
                /Visit your site at:\s*(https:\/\/[^\s]+)/
            );
            const url = match ? match[1] : null;

            if (!url) {
                // Fallback: Try to construct URL if we know the pattern
                // Usually https://<project-name>.pages.edgeone.ai (or similar)
                // But let's rely on output first.
                throw new Error(
                    "Could not parse deployment URL from EdgeOne CLI output"
                );
            }

            return {
                platform: this.name,
                success: true,
                url: url,
                postId: projectName,
            };
        } catch (error: any) {
            return {
                platform: this.name,
                success: false,
                error: error.message || "EdgeOne deployment failed",
            };
        } finally {
            // Cleanup temp dir
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (e) {
                // Ignore cleanup error
            }
        }
    }
}
