import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";
const mobile = createRequire(resolve("mobile/package.json"));
const expo = createRequire(mobile.resolve("expo/package.json"));
const config = createRequire(expo.resolve("@expo/metro-config"));
const metro = createRequire(config.resolve("metro/package.json"));
const imageModule = metro.resolve("image-size");
const types = resolve(dirname(imageModule), "types");
test("malformed ICNS chunks terminate instead of hanging the mobile build", () => {
  const script = `const assert=require('assert/strict');const image=require(${JSON.stringify(imageModule)});const b=Buffer.alloc(24);b.write('icns');b.writeUInt32BE(24,4);b.write('ic07',8);assert.throws(()=>image(b),/Invalid ICNS/);`;
  assert.doesNotThrow(() =>
    execFileSync(process.execPath, ["-e", script], {
      timeout: 2000,
      stdio: "pipe",
    }),
  );
});
test("ISO image boxes reject zero, undersized and truncated lengths", () => {
  const script = `const assert=require('assert/strict');const {findBox}=require(${JSON.stringify(resolve(types, "utils.js"))});for(const size of [0,1,7,99]){const b=Buffer.alloc(16);b.writeUInt32BE(size);b.write('jxlp',4);assert.equal(findBox(b,'jxlp',0),undefined);}const valid=Buffer.alloc(12);valid.writeUInt32BE(12);valid.write('jxlp',4);assert.equal(findBox(valid,'jxlp',0).size,12);`;
  assert.doesNotThrow(() =>
    execFileSync(process.execPath, ["-e", script], {
      timeout: 2000,
      stdio: "pipe",
    }),
  );
});
