import { defineConfig } from "vite";

export default defineConfig({
    server: { port: 3004 },
    build: {
        outDir: "dist",
        lib: {
            entry: "src/remoteEntry.ts",
            formats: ["es"],
            fileName: () => "remoteModule.js"
        }
    }
});
