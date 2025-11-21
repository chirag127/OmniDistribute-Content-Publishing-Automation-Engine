import { markdownToTelegraph } from "./src/utils/telegraph-converter";

const text = "Don't install social media or games on it";
const nodes = markdownToTelegraph(text);
console.log(JSON.stringify(nodes, null, 2));
