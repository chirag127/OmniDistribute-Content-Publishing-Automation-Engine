import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class PixnetAdapter implements Adapter {
    name = "pixnet";
    enabled = true;

    async validate(): Promise<boolean> {
        if (!process.env.PIXNET_API_KEY || !process.env.PIXNET_ACCESS_TOKEN) {
            logger.warn("PIXNET_API_KEY or PIXNET_ACCESS_TOKEN is missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const requestBody = {
                title: post.title,
                body: post.content,
                status: "publish", // or "draft"
                ...(post.tags &&
                    post.tags.length > 0 && { tags: post.tags.join(",") }),
                ...(post.publishedUrl && {
                    comments: `Originally published at: ${post.publishedUrl}`,
                }),
            };

            const response = await axios.post(
                "https://emma.pixnet.cc/blog/articles",
                requestBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.PIXNET_ACCESS_TOKEN}`,
                    },
                    params: {
                        api_key: process.env.PIXNET_API_KEY,
                    },
                }
            );

            const articleId = response.data.article?.id;
            const articleSlug = response.data.article?.slug || articleId;
            const username = process.env.PIXNET_USERNAME || "user";
            const postUrl = `https://${username}.pixnet.net/blog/post/${articleSlug}`;

            return {
                platform: this.name,
                success: true,
                url: postUrl,
                postId: String(articleId),
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

    async update(post: Post, postId: string): Promise<PublishResult> {
        try {
            const requestBody = {
                title: post.title,
                body: post.content,
                ...(post.tags &&
                    post.tags.length > 0 && { tags: post.tags.join(",") }),
                ...(post.publishedUrl && {
                    comments: `Originally published at: ${post.publishedUrl}`,
                }),
            };

            const response = await axios.post(
                `https://emma.pixnet.cc/blog/articles/${postId}`,
                requestBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.PIXNET_ACCESS_TOKEN}`,
                    },
                    params: {
                        api_key: process.env.PIXNET_API_KEY,
                    },
                }
            );

            const articleSlug = response.data.article?.slug || postId;
            const username = process.env.PIXNET_USERNAME || "user";
            const postUrl = `https://${username}.pixnet.net/blog/post/${articleSlug}`;

            return {
                platform: this.name,
                success: true,
                url: postUrl,
                postId: postId,
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
