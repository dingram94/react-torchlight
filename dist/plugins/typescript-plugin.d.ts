import * as ts from "typescript";
interface PluginConfig {
    outputPath?: string;
    rootFolder?: string;
}
export default function createPlugin(info: ts.server.PluginCreateInfo): ts.LanguageService;
export declare function createTransformer(program: ts.Program, config?: PluginConfig): ts.TransformerFactory<ts.SourceFile>;
export {};
