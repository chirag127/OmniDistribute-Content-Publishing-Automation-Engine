#!/usr/bin/env tsx
/**
 * Link Verification Script
 * Systematically checks all URLs in .postmap.json for validity
 * Generates detailed reports and flags broken links
 */

import * as fs from "node:fs";
import * as path from "node:path";
import axios from "axios";

interface PostMap {
    [postSlug: string]: {
        [platform: string]: string;
    };
}

interface LinkCheckResult {
    url: string;
    status: "success" | "broken" | "empty" | "error";
    statusCode?: number;
    error?: string;
}

interface PostVerificationResult {
    postSlug: string;
    platform: string;
    result: LinkCheckResult;
}

interface VerificationReport {
    timestamp: string;
    totalPosts: number;
    totalLinks: number;
    successfulLinks: number;
    brokenLinks: number;
    emptyLinks: number;
    errorLinks: number;
    results: PostVerificationResult[];
}

const DELAY_BETWEEN_REQUESTS = 500; // ms
const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * Sleep helper for rate limiting
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a URL is valid and accessible
 */
async function checkUrl(url: string): Promise<LinkCheckResult> {
    if (!url || url.trim() === "") {
        return {
            url: url || "",
            status: "empty",
        };
    }

    try {
        // Use HEAD request first for efficiency
        const response = await axios.head(url, {
            timeout: REQUEST_TIMEOUT,
            maxRedirects: 5,
            validateStatus: (status) => status < 500, // Don't throw on 4xx errors
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        });

        // Success codes: 2xx and 3xx redirects
        if (response.status >= 200 && response.status < 400) {
            return {
                url,
                status: "success",
                statusCode: response.status,
            };
        }

        // Client/Server errors
        return {
            url,
            status: "broken",
            statusCode: response.status,
            error: `HTTP ${response.status}`,
        };
    } catch (error) {
        // If HEAD fails, try GET (some servers don't support HEAD)
        try {
            const response = await axios.get(url, {
                timeout: REQUEST_TIMEOUT,
                maxRedirects: 5,
                validateStatus: (status) => status < 500,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
            });

            if (response.status >= 200 && response.status < 400) {
                return {
                    url,
                    status: "success",
                    statusCode: response.status,
                };
            }

            return {
                url,
                status: "broken",
                statusCode: response.status,
                error: `HTTP ${response.status}`,
            };
        } catch (retryError) {
            // Both HEAD and GET failed
            const errorMessage = axios.isAxiosError(retryError)
                ? retryError.code || retryError.message
                : "Unknown error";

            return {
                url,
                status: "error",
                error: errorMessage,
            };
        }
    }
}

/**
 * Verify all links in postmap
 */
async function verifyLinks(): Promise<VerificationReport> {
    const postmapPath = path.join(process.cwd(), ".postmap.json");

    if (!fs.existsSync(postmapPath)) {
        throw new Error(".postmap.json not found");
    }

    const postmap: PostMap = JSON.parse(fs.readFileSync(postmapPath, "utf-8"));
    const results: PostVerificationResult[] = [];

    const posts = Object.entries(postmap);
    console.log(`🔍 Verifying links for ${posts.length} posts...\n`);

    for (const [postSlug, platforms] of posts) {
        console.log(`📝 Checking post: ${postSlug}`);

        for (const [platform, url] of Object.entries(platforms)) {
            console.log(`  └─ ${platform}: ${url || "(empty)"}`);

            const result = await checkUrl(url);
            results.push({
                postSlug,
                platform,
                result,
            });

            // Status indicator
            const statusEmoji =
                result.status === "success"
                    ? "✅"
                    : result.status === "empty"
                    ? "⚠️"
                    : "❌";
            console.log(
                `     ${statusEmoji} ${result.status}${
                    result.statusCode ? ` (${result.statusCode})` : ""
                }${result.error ? `: ${result.error}` : ""}`
            );

            // Rate limiting delay
            await sleep(DELAY_BETWEEN_REQUESTS);
        }

        console.log("");
    }

    // Calculate statistics
    const totalLinks = results.length;
    const successfulLinks = results.filter(
        (r) => r.result.status === "success"
    ).length;
    const brokenLinks = results.filter(
        (r) => r.result.status === "broken"
    ).length;
    const emptyLinks = results.filter(
        (r) => r.result.status === "empty"
    ).length;
    const errorLinks = results.filter(
        (r) => r.result.status === "error"
    ).length;

    return {
        timestamp: new Date().toISOString(),
        totalPosts: posts.length,
        totalLinks,
        successfulLinks,
        brokenLinks,
        emptyLinks,
        errorLinks,
        results,
    };
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report: VerificationReport): string {
    const { results } = report;

    let markdown = `# Link Verification Report\n\n`;
    markdown += `**Generated:** ${new Date(
        report.timestamp
    ).toLocaleString()}\n\n`;

    // Summary
    markdown += `## Summary\n\n`;
    markdown += `| Metric | Count |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Total Posts | ${report.totalPosts} |\n`;
    markdown += `| Total Links | ${report.totalLinks} |\n`;
    markdown += `| ✅ Successful | ${report.successfulLinks} |\n`;
    markdown += `| ❌ Broken | ${report.brokenLinks} |\n`;
    markdown += `| ⚠️ Empty | ${report.emptyLinks} |\n`;
    markdown += `| 🔥 Errors | ${report.errorLinks} |\n\n`;

    // Broken Links
    const brokenResults = results.filter((r) => r.result.status === "broken");
    if (brokenResults.length > 0) {
        markdown += `## ❌ Broken Links (${brokenResults.length})\n\n`;
        markdown += `| Post | Platform | URL | Status |\n`;
        markdown += `|------|----------|-----|--------|\n`;

        for (const { postSlug, platform, result } of brokenResults) {
            markdown += `| ${postSlug} | ${platform} | ${result.url} | ${
                result.error || result.statusCode
            } |\n`;
        }
        markdown += `\n`;
    }

    // Empty Links (especially Discord)
    const emptyResults = results.filter((r) => r.result.status === "empty");
    if (emptyResults.length > 0) {
        markdown += `## ⚠️ Empty Links (${emptyResults.length})\n\n`;
        markdown += `| Post | Platform |\n`;
        markdown += `|------|----------|\n`;

        for (const { postSlug, platform } of emptyResults) {
            markdown += `| ${postSlug} | ${platform} |\n`;
        }
        markdown += `\n`;
    }

    // Error Links
    const errorResults = results.filter((r) => r.result.status === "error");
    if (errorResults.length > 0) {
        markdown += `## 🔥 Error Links (${errorResults.length})\n\n`;
        markdown += `| Post | Platform | URL | Error |\n`;
        markdown += `|------|----------|-----|-------|\n`;

        for (const { postSlug, platform, result } of errorResults) {
            markdown += `| ${postSlug} | ${platform} | ${result.url} | ${result.error} |\n`;
        }
        markdown += `\n`;
    }

    // Recommendations
    markdown += `## 💡 Recommendations\n\n`;

    if (emptyResults.length > 0) {
        markdown += `- **Remove ${emptyResults.length} empty entries** (especially Discord)\n`;
    }

    if (brokenResults.length > 0) {
        markdown += `- **Fix or remove ${brokenResults.length} broken links**\n`;
    }

    if (errorResults.length > 0) {
        markdown += `- **Investigate ${errorResults.length} error links** (may be temporary network issues or authentication required)\n`;
    }

    if (
        brokenResults.length === 0 &&
        emptyResults.length === 0 &&
        errorResults.length === 0
    ) {
        markdown += `- ✅ All links are working correctly!\n`;
    }

    return markdown;
}

/**
 * Main execution
 */
async function main() {
    console.log("🚀 Starting Link Verification\n");

    try {
        const report = await verifyLinks();

        // Save JSON report
        const jsonPath = path.join(
            process.cwd(),
            "link-verification-report.json"
        );
        fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
        console.log(`\n✅ JSON report saved: ${jsonPath}`);

        // Save Markdown report
        const markdown = generateMarkdownReport(report);
        const mdPath = path.join(process.cwd(), "link-verification-report.md");
        fs.writeFileSync(mdPath, markdown);
        console.log(`✅ Markdown report saved: ${mdPath}\n`);

        // Print summary
        console.log("📊 Summary:");
        console.log(`   Total Links: ${report.totalLinks}`);
        console.log(`   ✅ Successful: ${report.successfulLinks}`);
        console.log(`   ❌ Broken: ${report.brokenLinks}`);
        console.log(`   ⚠️ Empty: ${report.emptyLinks}`);
        console.log(`   🔥 Errors: ${report.errorLinks}\n`);

        // Exit with error code if issues found
        if (report.brokenLinks > 0 || report.emptyLinks > 0) {
            console.log("⚠️ Issues found! Please review the reports.\n");
            process.exit(1);
        }

        console.log("✅ All links verified successfully!\n");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

main();
