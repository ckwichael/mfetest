import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3003
    },
    build: {
        outDir: "dist",
        lib: {
            entry: "src/remoteEntry.ts",
            name: "MfeNotifications",
            formats: ["es"],
            fileName: () => "remoteEntry.js"
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true
            }
        },
        commonjsOptions: { transformMixedEsModules: true }
    },
    define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.env": {} // prevents 'process is not defined' at runtime
    }
});
