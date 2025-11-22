import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { formatSocialPost } from "../utils/message-template.js";

export class FacebookAdapter implements Adapter {
    name = "facebook";
    enabled = true;

    async validate(): Promise<boolean> {
        if (
            !process.env.FACEBOOK_PAGE_ACCESS_TOKEN ||
            !process.env.FACEBOOK_PAGE_ID
        ) {
            logger.warn(
                "FACEBOOK_PAGE_ACCESS_TOKEN or FACEBOOK_PAGE_ID is missing"
            );
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            if (!post.publishedUrl) {
                logger.warn(
                    "No publishedUrl available for Facebook posting. Skipping."
                );
                return {
                    platform: this.name,
                    success: false,
                    error: "No Blogger URL available to share",
                };
            }

            const { message } = formatSocialPost(post, 5000); // Facebook has generous limit

            const response = await axios.post(
                `https://graph.facebook.com/v24.0/${process.env.FACEBOOK_PAGE_ID}/feed`,
                {
                    message: message,
                    link: post.publishedUrl,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.FACEBOOK_PAGE_ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const postId = response.data.id;
            const postUrl = `https://www.facebook.com/${postId}`;

            return {
                platform: this.name,
                success: true,
                url: postUrl,
                postId: postId,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    platform: this.name,
                    success: false,
                    error:
                        error.response?.data?.error?.message || error.message,
                };
            }
            return {
                platform: this.name,
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}
