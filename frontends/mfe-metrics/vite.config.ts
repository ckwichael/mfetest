import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
    plugins: [react()],
    server: { port: 3002 },
    build: {
        outDir: "dist",
        lib: {
            entry: "src/exports.ts",
            formats: ["es"],
            fileName: () => "remoteModule.js"
        },
        rollupOptions: {
            external: [], // bundle deps to avoid CJS 'process' refs
            output: { inlineDynamicImports: true }
        },
        commonjsOptions: { transformMixedEsModules: true }
    },
    define: {
        "process.env.NODE_ENV": JSON.stringify("production")
    }
});
