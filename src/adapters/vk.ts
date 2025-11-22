import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class VKAdapter implements Adapter {
    name = "vk";
    enabled = true;

    private readonly CHARACTER_LIMIT = 16350;
    private readonly API_VERSION = "5.131";

    async validate(): Promise<boolean> {
        if (!process.env.VK_ACCESS_TOKEN) {
            logger.warn("VK_ACCESS_TOKEN is missing");
            return false;
        }
        return true;
    }

    private truncateContent(content: string, bloggerUrl?: string): string {
        const footer = bloggerUrl
            ? `\n\n📖 Read full article: ${bloggerUrl}`
            : "";
        const availableLength = this.CHARACTER_LIMIT - footer.length - 100; // Buffer

        if (content.length + footer.length <= this.CHARACTER_LIMIT) {
            return content + footer;
        }

        const truncated = content.substring(0, availableLength);
        const lastParagraph = truncated.lastIndexOf("\n\n");
        const finalContent =
            lastParagraph > 0
                ? truncated.substring(0, lastParagraph)
                : truncated;

        return `${finalContent}...\n\n${footer}`;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const message = this.truncateContent(
                post.content,
                post.publishedUrl
            );

            const params = new URLSearchParams({
                message: message,
                access_token: process.env.VK_ACCESS_TOKEN!,
                v: this.API_VERSION,
            });

            const response = await axios.post(
                "https://api.vk.ru/method/wall.post",
                params,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            if (response.data.error) {
                throw new Error(
                    response.data.error.error_msg || "VK API error"
                );
            }

            const postId = response.data.response?.post_id;
            const ownerId =
                response.data.response?.owner_id || process.env.VK_OWNER_ID;
            const postUrl = ownerId
                ? `https://vk.com/wall${ownerId}_${postId}`
                : `https://vk.com/wall?post=${postId}`;

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
                    error:
                        error.response?.data?.error?.error_msg || error.message,
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
