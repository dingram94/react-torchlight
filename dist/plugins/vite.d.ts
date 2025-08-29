import { Plugin } from "vite";
interface VitePluginToursOptions {
    rootFolder?: string;
    outputPath?: string;
}
export declare function vitePluginTours(options?: VitePluginToursOptions): Plugin;
export {};
