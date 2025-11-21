import { marked } from "marked";

const text = "Don't install social media or games on it";
const tokens = marked.lexer(text);
console.log(JSON.stringify(tokens, null, 2));

const text2 = "Don't";
const tokens2 = marked.lexer(text2);
console.log(JSON.stringify(tokens2, null, 2));
