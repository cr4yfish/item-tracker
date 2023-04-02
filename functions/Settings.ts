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
    if(!checkInit) {
        initSupabase(settings);
    }
    try {
        getCategories().then((res) => { setCategories(res); })
    } catch (e) {
        console.error(e);
    }
}