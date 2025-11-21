import axios from "axios";
import crypto from "crypto";
import { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { formatSocialPost } from "../utils/message-template.js";

export class TwitterAdapter implements Adapter {
    name = "twitter";
    enabled = true;

    async validate(): Promise<boolean> {
        if (
            !process.env.TWITTER_API_KEY ||
            !process.env.TWITTER_API_SECRET ||
            !process.env.TWITTER_ACCESS_TOKEN ||
            !process.env.TWITTER_ACCESS_TOKEN_SECRET
        ) {
            logger.warn("TWITTER credentials are missing");
            return false;
        }
        return true;
    }

    private generateOAuthHeader(
        method: string,
        url: string,
        params: Record<string, string>
    ): string {
        const oauthParams: Record<string, string> = {
            oauth_consumer_key: process.env.TWITTER_API_KEY!,
            oauth_token: process.env.TWITTER_ACCESS_TOKEN!,
            oauth_signature_method: "HMAC-SHA1",
            oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
            oauth_nonce: crypto.randomBytes(16).toString("hex"),
            oauth_version: "1.0",
        };

        // Combine oauth and request params
        const allParams = { ...oauthParams, ...params };

        // Create signature base string
        const sortedParams = Object.keys(allParams)
            .sort()
            .map(
                (key) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(
                        allParams[key]
                    )}`
            )
            .join("&");

        const signatureBase = `${method}&${encodeURIComponent(
            url
        )}&${encodeURIComponent(sortedParams)}`;

        // Create signing key
        const signingKey = `${encodeURIComponent(
            process.env.TWITTER_API_SECRET!
        )}&${encodeURIComponent(process.env.TWITTER_ACCESS_TOKEN_SECRET!)}`;

        // Generate signature
        const signature = crypto
            .createHmac("sha1", signingKey)
            .update(signatureBase)
            .digest("base64");

        oauthParams.oauth_signature = signature;

        // Build OAuth header
        const oauthHeader =
            "OAuth " +
            Object.keys(oauthParams)
                .sort()
                .map(
                    (key) =>
                        `${encodeURIComponent(key)}="${encodeURIComponent(
                            oauthParams[key]
                        )}"`
                )
                .join(", ");

        return oauthHeader;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            if (!post.publishedUrl) {
                logger.warn(
                    "No publishedUrl available for Twitter posting. Skipping."
                );
                return {
                    platform: this.name,
                    success: false,
                    error: "No Blogger URL available to share",
                };
            }

            const { message } = formatSocialPost(post, 280); // Twitter has 280 char limit

            const url = "https://api.twitter.com/2/tweets";
            const authorization = this.generateOAuthHeader("POST", url, {});

            const response = await axios.post(
                url,
                {
                    text: message,
                },
                {
                    headers: {
                        Authorization: authorization,
                        "Content-Type": "application/json",
                    },
                }
            );

            const tweetId = response.data.data.id;
            const tweetUrl = `https://twitter.com/i/web/status/${tweetId}`;

            return {
                platform: this.name,
                success: true,
                url: tweetUrl,
                postId: tweetId,
            };
        } catch (error: any) {
            return {
                platform: this.name,
                success: false,
                error:
                    error.response?.data?.detail ||
                    error.response?.data?.title ||
                    error.message,
            };
        }
    }
}
