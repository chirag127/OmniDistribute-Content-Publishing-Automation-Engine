import "dotenv/config";
import http from "http";
import url from "url";
import { exec } from "child_process";

// Configuration
const CLIENT_ID = process.env.TUMBLR_CONSUMER_KEY;
const CLIENT_SECRET = process.env.TUMBLR_CONSUMER_SECRET;
const REDIRECT_URI = "http://localhost:3000/callback";
const PORT = 3000;

async function main() {
    console.log("==================================================");
    console.log("   Tumblr OAuth 2.0 Token Generator");
    console.log("==================================================");

    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error(
            "❌ Error: TUMBLR_CONSUMER_KEY and TUMBLR_CONSUMER_SECRET must be set in .env"
        );
        process.exit(1);
    }

    // 1. Start Local Server
    const server = http.createServer(async (req, res) => {
        if (req.url?.startsWith("/callback")) {
            const qs = new url.URL(req.url, `http://localhost:${PORT}`)
                .searchParams;
            const code = qs.get("code");
            const error = qs.get("error");

            if (error) {
                res.end(`Error: ${error}`);
                console.error(`❌ OAuth Error: ${error}`);
                server.close();
                process.exit(1);
                return;
            }

            if (code) {
                res.end(
                    "Authentication successful! Check your terminal for the token."
                );
                console.log(
                    "\n✅ Authorization code received. Exchanging for token..."
                );

                try {
                    // 2. Exchange code for token
                    const tokenUrl = "https://api.tumblr.com/v2/oauth2/token";
                    const params = new URLSearchParams();
                    params.append("grant_type", "authorization_code");
                    params.append("code", code);
                    params.append("client_id", CLIENT_ID);
                    params.append("client_secret", CLIENT_SECRET);
                    params.append("redirect_uri", REDIRECT_URI);

                    const tokenRes = await fetch(tokenUrl, {
                        method: "POST",
                        body: params,
                    });

                    const data = await tokenRes.json();

                    if (data.access_token) {
                        console.log(
                            "\n=================================================="
                        );
                        console.log(
                            "   🎉 SUCCESS! Here are your credentials:"
                        );
                        console.log(
                            "=================================================="
                        );
                        console.log(
                            `\nTUMBLR_ACCESS_TOKEN=${data.access_token}`
                        );
                        console.log(
                            `TUMBLR_REFRESH_TOKEN=${data.refresh_token}\n`
                        );
                        console.log(
                            "=================================================="
                        );
                        console.log("1. Copy the tokens above.");
                        console.log("2. Paste them into your .env file.");
                    } else {
                        console.error("❌ Failed to retrieve token:", data);
                    }
                } catch (err) {
                    console.error("❌ Error exchanging code:", err);
                } finally {
                    server.close();
                    process.exit(0);
                }
            }
        } else {
            res.end("Omni-Publisher Tumblr Auth");
        }
    });

    server.listen(PORT, () => {
        // 3. Generate Auth URL
        const authUrl = `https://www.tumblr.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&scope=basic%20write%20offline_access&state=tumblr_auth&redirect_uri=${encodeURIComponent(
            REDIRECT_URI
        )}`;

        console.log(`\n1. Opening browser to: ${authUrl}`);
        console.log("2. Login and authorize the app.");

        const start =
            process.platform == "darwin"
                ? "open"
                : process.platform == "win32"
                ? "start"
                : "xdg-open";
        exec(`${start} "${authUrl}"`);
    });
}

main().catch(console.error);
