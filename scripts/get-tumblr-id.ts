import "dotenv/config";
import https from "https";

const token = process.env.TUMBLR_TOKEN;

if (!token) {
    console.error("❌ Error: TUMBLR_TOKEN is not set in your .env file.");
    process.exit(1);
}

console.log("🔍 Fetching your Tumblr blogs...");

const options = {
    hostname: "api.tumblr.com",
    path: "/v2/user/info",
    method: "GET",
    headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Omni-Publisher/1.0",
    },
};

const req = https.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
        data += chunk;
    });

    res.on("end", () => {
        if (res.statusCode === 200) {
            try {
                const response = JSON.parse(data);
                console.log("\n✅ Found the following blogs:\n");

                if (
                    response.response &&
                    response.response.user &&
                    response.response.user.blogs
                ) {
                    response.response.user.blogs.forEach((blog: any) => {
                        console.log(`   Title: ${blog.title}`);
                        console.log(`   URL:   ${blog.url}`);
                        console.log(
                            `   ID:    ${blog.name} (Use this as TUMBLR_BLOG_IDENTIFIER)`
                        );
                        console.log("   -------------------------");
                    });
                } else {
                    console.log("No blogs found in response.");
                }

                console.log(
                    "\nCopy the 'ID' (e.g. 'myblogname') of the blog you want to publish to."
                );
                console.log(
                    "Set it as TUMBLR_BLOG_IDENTIFIER in your .env file."
                );
            } catch (e) {
                console.error("❌ Error parsing response:", e);
            }
        } else {
            console.error(
                `❌ API Request Failed: ${res.statusCode} ${res.statusMessage}`
            );
            console.log("Response:", data);
        }
    });
});

req.on("error", (e) => {
    console.error("❌ Request Error:", e);
});

req.end();
