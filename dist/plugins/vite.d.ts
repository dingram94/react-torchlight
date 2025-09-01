import { Plugin } from "vite";
interface TorchlightVitePluginOptions {
    rootFolder?: string;
    outputPath?: string;
}
export declare function torchlightVitePlugin(options?: TorchlightVitePluginOptions): Plugin;
export {};
