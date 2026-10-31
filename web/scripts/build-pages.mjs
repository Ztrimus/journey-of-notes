import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Only replace this app's generated subtree; preserve the existing Pages policies.
const source = fileURLToPath(new URL("../dist/", import.meta.url));
const destination = fileURLToPath(new URL("../../docs/practice/", import.meta.url));
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
console.log("Prepared docs/practice for the existing GitHub Pages site.");
