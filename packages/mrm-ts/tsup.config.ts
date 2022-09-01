import { defineConfig } from "tsup";

export default defineConfig({
	name: "mrm",
	target: 'node14',
	entry: ["./src/cli.ts"],
	splitting: false,
	sourcemap: true,
	clean: true,
});
