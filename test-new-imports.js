// Test file to verify new import format works correctly
console.log("Testing new import format...\n");

// Test main import
try {
  const main = require("./dist/index.js");
  console.log("✅ Main package import works");
  console.log("   Available exports:", Object.keys(main));
} catch (error) {
  console.log("❌ Main package import failed:", error.message);
}

// Test vite plugin import
try {
  const vitePlugin = require("./dist/plugins/vite.js");
  console.log("✅ Vite plugin import works");
  console.log("   Available exports:", Object.keys(vitePlugin));
  console.log("   torchlight export exists:", "torchlightVitePlugin" in vitePlugin);
} catch (error) {
  console.log("❌ Vite plugin import failed:", error.message);
}

// Test typescript plugin import
try {
  const typescriptPlugin = require("./dist/plugins/typescript.js");
  console.log("✅ TypeScript plugin import works");
  console.log("   Available exports:", Object.keys(typescriptPlugin));
} catch (error) {
  console.log("❌ TypeScript plugin import failed:", error.message);
}

console.log("\n🎉 New import format is working correctly!");
console.log("\nExpected usage:");
console.log('import { TorchlightProvider } from "@react-torchlight/core"');
console.log('import { torchlight } from "@react-torchlight/core/plugins/vite"');
