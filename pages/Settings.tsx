import { Input, Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';

import ICategory from '@/interfaces/ICategory';
import ISettings from '@/interfaces/ISettings';

import MaterialInput from '@/components/MaterialInput';

import { supabase, upsertCategory } from '@/functions/Supabase';

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

    const saveSettings = async () => {
        localStorage.setItem("settings", JSON.stringify(settings));
    }

    const initSettings = () => {
        try {
            let storage = localStorage.getItem("settings");
            if(storage == null) {
                throw new Error("Settings are null");
            }
            const newSettings : ISettings = JSON.parse(storage);
            setSettings(newSettings);
        } catch (e) {
            console.log(e);
        }
        console.log("new settings:", settings);
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
                <div className={styles.inputGroup}>
                    <MaterialInput 
                        label="Supabase URL"
                        name="supabaseUrl"
                        onChange={handleOnChange}
                        value={settings.supabaseUrl}
                    />
                    <MaterialInput
                        label="Supabase Key"
                        name="supabaseKey"
                        type="password"
                        value={settings.supabaseKey}
                        onChange={handleOnChange}
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
                    <Button onClick={() => saveSettings()} style={{ marginTop: "1rem" }} auto>Save</Button>
                </div>
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