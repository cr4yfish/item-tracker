import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import IItem from "@/interfaces/IItem";
import ISettings from "@/interfaces/ISettings";
import ICategory from "@/interfaces/ICategory";

import ChangeItem from "@/components/ChangeItem";

import { getItemById, checkInit, initSupabase, getCategories } from "@/functions/Supabase";

export default function Item() {
    const [item, setItem] = useState<IItem>({} as IItem);

    // get params from path
    const router = useRouter();

    useEffect(() => {
        (async () => {if(router.isReady) {
            const id = router.query.id;

            // Check if valid ID
            if(!id || (typeof id != "string")) throw new Error(id + " is not a valid id");
            
            // init supabase if not already
            if(!checkInit()) {
                // get settings
                const settings = localStorage.getItem("settings");
                if(settings == null) throw new Error ("Settings are null. Cannot init supabase");
                const newSettings = JSON.parse(settings) as ISettings;
                await initSupabase(newSettings);
            };

            // set item
            getItemById(id).then((res) => {
                const item = res;
                setItem(item);
            });
        }})();
    }, [router.isReady]);

    return (
    <>
        {item && 
            <ChangeItem
                presetItem={item}
                presetSetItem={setItem}
                editMode={true}
            />
        }
    </>
    )
}