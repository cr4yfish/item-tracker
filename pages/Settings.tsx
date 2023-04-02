import { Input, Button } from '@nextui-org/react';
import { FormEvent, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { toast } from 'react-toastify';

import ICategory from '@/interfaces/ICategory';
import ISettings from '@/interfaces/ISettings';

import MaterialInput from '@/components/MaterialInput';

import { validateSettings, saveSettings } from '@/functions/Settings';

import styles from "../styles/Settings.module.css";
import "material-icons/iconfont/material-icons.css"

export default function Settings() {
    const [settings, setSettings] = useState<ISettings>({} as ISettings);

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({
            ...settings,
            [e.currentTarget.name]: e.currentTarget.value
        })
    }

    const handleFormEvent = async (e: FormEvent) => {
        e.preventDefault();
        console.log("saving settings");
        saveSettings(settings);
    }

    const initSettings = () => {
        try {
            let storage = localStorage.getItem("settings");
            if(storage == null) {
                throw new Error("Settings are null");
            }
            const newSettings : ISettings = JSON.parse(storage);
            if(!validateSettings(newSettings).valid) {
                throw new Error(`New settings are invalid ${JSON.stringify(newSettings)}`);
            }
            setSettings(newSettings);
        } catch (e) {
            console.log(e);
        }
        console.log("new settings:", settings);
    }

    const pasteSettingsFromClipboard = () => {
        navigator.clipboard.readText().then(text => {
            try {
                const newSettings : ISettings = JSON.parse(text);
                if(!validateSettings(newSettings).valid) {
                    throw new Error(`New settings are invalid: ${JSON.stringify(newSettings)}`);
                }
                setSettings(newSettings);
                saveSettings(newSettings);
                toast("Settings pasted from clipboard", { position: "bottom-right", type: "success" });
            } catch (e) {
                console.error(e);
                toast(`Error parsing settings: ${e}`, { position: "bottom-right", type: "error" });
                return;
            }
        })
    }

    const copySettingsToClipBoard = () => {
        navigator.clipboard.writeText(JSON.stringify(settings)).then(() => {
            toast("Settings copied to clipboard", { position: "bottom-right", type: "success" });
        }, () => {
            toast("Error copying settings to clipboard", { position: "bottom-right", type: "error" });
        })
    }

    useEffect(() => {
        console.log("Settings:", settings)
        if(!settings.supabaseUrl) {
            console.log("Refreshing url");
            initSettings();
        }
    }, [settings])

    return (
        <>
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <Link href="/"><Button auto ghost ><span className='material-icons'>chevron_left</span></Button></Link>
                <h1>Settings</h1>
            </header>

            <div className={styles.settingsGroup}>
                <h2>General</h2>
                <form onSubmit={handleFormEvent} method='post' className={styles.inputGroup}>
                    <MaterialInput 
                        label="Supabase URL"
                        name="supabaseUrl"
                        onChange={handleOnChange}
                        value={settings.supabaseUrl}
                        required
                    />
                    <MaterialInput
                        label="Supabase Key"
                        name="supabaseKey"
                        type="password"
                        value={settings.supabaseKey}
                        onChange={handleOnChange}
                        required
                    />
                    <MaterialInput
                        label="Edamam ID"
                        name="edamamId"
                        value={settings.edamamId}
                        onChange={handleOnChange}
                    />
                    <MaterialInput
                        label="Edamam Key"
                        name="edamamKey"
                        type="password"
                        value={settings.edamamKey}
                        onChange={handleOnChange}
                    />
                    <MaterialInput
                        label="Deepl API Key"
                        name="deeplKey"
                        type="password"
                        value={settings.deeplKey}
                        onChange={handleOnChange}
                    />
                    <div style={{
                        display: "flex", flexDirection: "row", gap: "1rem", 
                        alignItems: "center", flexWrap: "wrap",
                        marginTop: "1rem"
                    }}>
                        <Button type='submit' auto>Save</Button>
                        <Button
                            onClick={pasteSettingsFromClipboard} 
                            ghost flat auto icon={<span className='material-icons'>content_paste</span>}
                            color="secondary" >
                                Paste from Clipboard
                        </Button>
                        <Button
                            onClick={copySettingsToClipBoard} 
                            ghost flat auto icon={<span className='material-icons'>content_copy</span>}
                            color="secondary" >
                                Copy
                        </Button>
                    </div>
                    
                </form>
            </div>

            <div className={styles.settingsGroup}>
                <h2>Preferences</h2>
                <div className={styles.settingsGroupContent}>

                    <Link href="/Settings/Categories">
                        <button className={styles.button}>
                            <span>Change Categories</span>
                            <span className='material-icons'>arrow_right_alt</span>
                        </button>
                    </Link>

                    <Link href="/Settings/Users">
                        <button className={styles.button}>
                            <span>Change Users</span>
                            <span className='material-icons'>arrow_right_alt</span>
                        </button>
                    </Link>

                </div>
            </div>
        </div>
        </>
    )

}