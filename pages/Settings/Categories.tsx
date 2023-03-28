import { useState, useEffect } from "react"
import { Collapse, Button, Text } from "@nextui-org/react"
import { v4 as uuidv4 } from "uuid";

import PageHeader from "@/components/PageHeader"
import MaterialInput from "@/components/MaterialInput";

import { checkInit, initSupabase, getCategories, upsertCategory, deleteCategory, supabase } from "@/functions/Supabase"

import ICategory from "@/interfaces/ICategory"
import ISettings from "@/interfaces/ISettings"

import styles from "../../styles/Settings/Categories.module.css"
import "material-icons/iconfont/material-icons.css"

export default function Categories() {
    const [categories, setCategories] = useState<ICategory[]>([] as ICategory[])
    const [newCategory, setNewCategory] = useState<ICategory>({} as ICategory);

    useEffect(() => {
        (async () => {
            if(!checkInit()) {
                // get settings
                console.log("Initing supabase");
                const store = localStorage.getItem("settings");
                if(store == null) throw new Error("Settings are null. Cannot init supabase");
                const settings = JSON.parse(store) as ISettings;
                await initSupabase(settings);
            }
            console.log("Supabase ready, getting data");
            await getCategories().then((res) => {
                console.log("Categories:",res);
                setCategories(res as ICategory[])
            })

            // Realtime updates
        if(checkInit()) {
            console.log("Realtime enabled");
            const changes = supabase.channel('custom-all-channel')
            .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'categories' },
            async (payload : any) => {
                const cats = await getCategories();

                console.log('Change received!', payload)
                console.log("Finding indices for ", cats);
                const indexOld = cats.findIndex((category) => category.id === payload.old.id);
                const indexNew = cats.findIndex((category) => category.id === payload.new.id);
                console.log(`IndexOld: ${indexOld}. IndexNew: ${indexNew}`, !payload.new);

                if(!payload.new.hasOwnProperty("id")) {
                    console.log("Removing item");
                    // filter out the removed item
                    if(indexOld != -1) {
                        const tmp = cats;
                        const removedItem = tmp.splice(indexOld, 1);
                        console.log("new categories:", tmp, "with removed item:", removedItem);
                        setCategories(tmp as ICategory[]);
                    } else {
                        const newCats = await getCategories();
                        setCategories(newCats);
                    }
                } else if(payload.eventType != "DELETE") {
                    console.log("Updating item");
                    console.log(payload.eventType, "adapting categories array")
                    if(indexNew == -1) {
                        // new item
                        console.log("Adding new item");
                        let tmp = cats;
                        const newItem : ICategory = { id: payload.new.id, name: payload.new.name, created_at: payload.new.created_at};
                        tmp.push(newItem);
                        console.log("new categories:", tmp, "with new item:", newItem);
                        setCategories(tmp);
                    } else {
                        console.log("Changing item");
                        const tmp = cats;
                        tmp[indexNew] = payload.new;
                        setCategories(tmp);
                    }
                }
            }
            )
            changes.subscribe();
        } else {
            //
            console.log("Can't enable realtime");
        }
        })();
    }, [])

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCategory({
            ...newCategory,
            [e.currentTarget.name]: e.currentTarget.value
        })
    }

    const handleAddNewCategory = async () => {
        newCategory.id = uuidv4();
        await upsertCategory(newCategory);
        setNewCategory({} as ICategory);
    }


    return (
        <>
        <main className={styles.mainWrapper}>
            <PageHeader text="Change Categories" link="/Settings" />
            <Collapse className={styles.categoryList} title="Categories">
                {categories.map((category) => {
                    return (
                        <div className={styles.categoryCard} key={category.id} title={category.name}>
                            <Text h4>{category.name}</Text>
                            <div className={styles.categoryCardButtons}>
                                <Button 
                                    auto 
                                    ghost 
                                    color="error"
                                    onPress={() => deleteCategory(category)}
                                >
                                    <span className="material-icons">delete</span>
                                </Button>
                                <Button disabled auto ghost color="warning">
                                    <span className="material-icons">edit</span>
                                </Button>
                                
                            </div>
                        </div>
                    )
                })}
            </Collapse>

            <div className={styles.newCategory}>
                <Text h2>Add a new Category</Text>
                <div className={styles.inputGroup}>
                    <MaterialInput
                        onChange={handleOnChange}
                        label="Name"
                        name="name"
                    />
                </div>
                <Button onPress={handleAddNewCategory} auto flat icon={<span className="material-icons">add</span>}>Add</Button>
            </div>
        </main>
        </>
    )
}