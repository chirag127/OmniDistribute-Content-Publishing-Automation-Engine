import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class WeiboAdapter implements Adapter {
    name = "weibo";
    enabled = true;

    private readonly CHARACTER_LIMIT = 2000;

    async validate(): Promise<boolean> {
        if (!process.env.WEIBO_ACCESS_TOKEN) {
            logger.warn("WEIBO_ACCESS_TOKEN is missing");
            return false;
        }
        return true;
    }

    private createPostMessage(post: Post): string {
        if (!post.publishedUrl) {
            logger.warn("No Blogger URL available for Weibo post");
            return `New blog post: ${post.title}`;
        }

        // Create a short, engaging message with link (like Twitter adapter)
        const message = `📝 ${post.title}

${post.description || "Read my latest blog post!"}

🔗 ${post.publishedUrl}

${
    post.tags
        ? post.tags.map((tag) => `#${tag.replace(/\s+/g, "")}`).join(" ")
        : ""
}`.trim();

        // Ensure it fits within Weibo's limit
        if (message.length > this.CHARACTER_LIMIT) {
            const truncatedDesc = post.description
                ? post.description.substring(0, 100) + "..."
                : "Read more";
            return `📝 ${post.title}

${truncatedDesc}

🔗 ${post.publishedUrl}`.trim();
        }

        return message;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const status = this.createPostMessage(post);

            logger.info(
                `Posting to Weibo (${status.length}/${this.CHARACTER_LIMIT} chars)`
            );

            const params = new URLSearchParams({
                access_token: process.env.WEIBO_ACCESS_TOKEN!,
                status: status,
            });

            const response = await axios.post(
                "https://api.weibo.com/2/statuses/update.json",
                params,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const postId = response.data.id || response.data.idstr;
            const userId = response.data.user?.id || process.env.WEIBO_USER_ID;
            const postUrl = `https://weibo.com/${userId}/${postId}`;

            return {
                platform: this.name,
                success: true,
                url: postUrl,
                postId: String(postId),
            };
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                return {
                    platform: this.name,
                    success: false,
                    error: error.response?.data?.error || error.message,
                };
            }
            return {
                platform: this.name,
                success: false,
                error: error.message,
            };
        }
    }
}
