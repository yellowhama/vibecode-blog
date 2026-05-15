import { cp, rm } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("dist/pagefind");
const target = resolve("public/pagefind");

await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
