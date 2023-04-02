import { toast } from "react-toastify";

import ISettings from "@/interfaces/ISettings";

import { initSupabase, getCategories, checkInit } from "./Supabase";

// getting settings
export const initSettings = async (setSettings : Function) => {
    try {
        let storage = localStorage.getItem("settings");
        if(storage == null) {
            throw new Error("Settings are null");
        }
        const newSettings : ISettings = JSON.parse(storage);
        setSettings(newSettings);
    } catch (e) {
        console.error(e);
    }
}

export const initCategories = async (settings: ISettings, setCategories: Function) => {
    if(!checkInit()) {
        initSupabase();
    }
    try {
        getCategories().then((res) => { setCategories(res); })
    } catch (e) {
        console.error(e);
    }
}

/**
 * Returns either the settings or false if they are invalid
 * @returns ISettings | false
 */
export const getSettings = () : ISettings | false => {
    console.log("Getting Settings");
    try {
        let storage = localStorage.getItem("settings");
        if(storage) {
            const newSettings : ISettings = JSON.parse(storage);
            if(!validateSettings(newSettings).valid) {
                throw new Error(`New settings are invalid ${JSON.stringify(newSettings)}`);
            } else {
                return newSettings;
            }
        }
    } catch (e) {
        console.error(e);
        return false;
    }
    return false
}

/**
 * Saves settings to local storage and returns true if successful or false if not
 * @param settings : ISettings
 * @returns boolean
 */
export const saveSettings = (settings: ISettings) : boolean => {
    try {
        if(!validateSettings(settings).valid) {
            throw new Error(`New settings are invalid ${JSON.stringify(settings)}`);
        } else {
            localStorage.setItem("settings", JSON.stringify(settings));
            toast("Settings saved", { type: "success" });
            return true;
        }
    } catch (e) {
        console.error(e);
    }
    return false;
}

/**
 * Returns Object with settings validity
 * @param settings : ISettings
 * @returns { valid: boolean, supabase: boolean, edamam: boolean, deepl: boolean }
 */
export const validateSettings = (settings: ISettings) => {
    let returnObj = {
        valid: false,
        supabase: false,
        edamam: false,
        deepl: false,
    }

    if(settings.supabaseUrl != "" && settings.supabaseKey != "") {
        returnObj.supabase = true;
        returnObj.valid = true; // only supbase is required
    }

    if(settings.edamamId != "" && settings.edamamKey != "") {
        returnObj.edamam = true;
    }

    if(settings.deeplKey != "") {
        returnObj.deepl = true;
    }

    return returnObj;
}