import "dotenv/config";
import https from "https";

const token = process.env.WORDPRESS_TOKEN;

if (!token) {
    console.error("❌ Error: WORDPRESS_TOKEN is not set in your .env file.");
    console.error("   Please generate a token first.");
    process.exit(1);
}

console.log("🔍 Fetching your WordPress.com sites...");

const options = {
    hostname: "public-api.wordpress.com",
    path: "/rest/v1.1/me/sites",
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
                console.log("\n✅ Found the following sites:\n");
                response.sites.forEach((site: any) => {
                    console.log(`   Name: ${site.name}`);
                    console.log(`   URL:  ${site.URL}`);
                    console.log(`   ID:   ${site.ID}`);
                    console.log("   -------------------------");
                });
                console.log(
                    "\nCopy the 'ID' of the site you want to publish to."
                );
                console.log("Set it as WORDPRESS_SITE_ID in your .env file.");
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
