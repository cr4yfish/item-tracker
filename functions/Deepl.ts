import ISettings from "@/interfaces/ISettings";
import * as deepl from "deepl-node";
import { SourceLanguageCode, TargetLanguageCode } from "deepl-node/dist/types";

// Remove before commit
let translator: deepl.Translator;
let isInit = false;

export async function initDeepl(settings : ISettings) {
    if(isInit) return;
    translator = new deepl.Translator(settings.deeplKey);
    isInit = true;
}

export async function translate(text: string, sourceLang: SourceLanguageCode, targetLang: TargetLanguageCode) {
    if(!isInit) throw new Error("Deepl not initialized");
    const result = await translator.translateText(text, sourceLang, targetLang);
    return result;
}