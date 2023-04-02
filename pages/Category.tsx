import { useRouter } from "next/router";
import Head from "next/head";
import { useState, useEffect } from "react";
import { Dropdown } from "@nextui-org/react";

import { getItems, getPersons, getCategories, checkInit, initSupabase, supabase } from "@/functions/Supabase";

import IItem from "@/interfaces/IItem";
import ICategory from "@/interfaces/ICategory";
import IPerson from "@/interfaces/IPerson";
import ISettings from "@/interfaces/ISettings";

import FoodPreview from "@/components/ItemPreview";
import PageHeader from "@/components/PageHeader";

import styles from "@/styles/Category.module.css";

export default function Category() {
    const router = useRouter();
    
    // data
    const [items, setItems] = useState<IItem[]>([] as IItem[]);
    const [categories, setCategories] = useState<ICategory[]>([] as ICategory[]);
    const [persons, setPersons] = useState<IPerson[]>([] as IPerson[]);
    const [online, setOnline] = useState<boolean>(false);
    const [currentCategory, setCurrentCategory] = useState<ICategory | undefined>({} as ICategory);
    const [currentSort, setCurrentSort] = useState< "dueDate" | "name" | "place" >("dueDate");
     
    const sorts = ["dueDate", "name", "place"];

    const sort = (items: IItem[], sort: "dueDate" | "name" | "place") => {
        switch(sort) {
            case "dueDate":
                return items.sort((a, b) => a.date - b.date);
            case "name":
                return items.sort((a, b) => a.name.localeCompare(b.name));
            case "place":
                return items.sort((a, b) => a.place.localeCompare(b.place));
        }
    }

    useEffect(() => {
        console.log("Running data");

        if(!router.isReady) {
            console.error("Router isn't ready");
            return;
        }

        console.log("Router is ready");

        const id = router.query.id;
        console.log("Query id: " + id);
        (async () => {
            
            console.log("Getting settings");
            let storage = localStorage.getItem("settings");
            if(storage != null) {
                const settings = await JSON.parse(storage) as ISettings;
                if(!checkInit()) {
                    await initSupabase();
                }
            }

            // Realtime updates
            if(checkInit()) {
                console.log("Supabase is initialized, running data jobs");
    
                const tmpCategories = await getCategories();
                console.log("Setting categories", tmpCategories);
                setCategories(tmpCategories as ICategory[]);

                const currentCat = tmpCategories.find((category) => category.id === id);
                console.log("Setting current category", currentCat, tmpCategories, id);
                if(currentCat) setCurrentCategory(currentCat);

                const tmpItems = await getItems();
                const filteredItems = currentCat? tmpItems.filter((item) => (item.category === currentCat.id) && !item.deleted) : items;
                console.log("Setting items", filteredItems, tmpItems, currentCategory);
                setItems(filteredItems);
    
                const tmpPersons = await getPersons();
                setPersons(tmpPersons);

                const changes = supabase.channel('custom-all-channel')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'items' },
                    (payload : any) => {
                    console.log('Change received!', payload)
                    const index = items.findIndex((item) => item.id === payload.new.id);
                    if(index > -1) {
                        items[index] = payload.new;
                        setItems([...items]);
                    }
                    }
                )
                changes.subscribe();
                setOnline(true);
                console.log(categories, items, persons)
            } else {
                setOnline(false);
            }
        })();
    }, [router.isReady]);


    useEffect(() => {
        console.log("sort change");
        setItems(sort(items, currentSort));

        console.log("new items", items);

    }, [currentSort])
    
    return (
        <>

        <Head>
            <title>{currentCategory?.name} | ItemsTracker</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>
    
        <main className={styles.mainWrapper}>
            <PageHeader link="/" text={currentCategory?.name ? currentCategory.name : "Category"} />

            <Dropdown>
              <Dropdown.Button>{currentSort ? currentSort : "Select Sort"}</Dropdown.Button>
              <Dropdown.Menu
                disallowEmptySelection
                selectionMode='single'
                selectedKeys={[currentSort]}
                onSelectionChange={(e : any) => setCurrentSort(e.currentKey )}
              >
                {sorts.map((sort) => (
                  <Dropdown.Item key={sort}>
                    {sort}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <div className={styles.itemsWrapper}>
                {items.map((item) => (
                    <FoodPreview key={item.id} size="medium" food={item} />
                ))}
            </div>

        </main>
        </>

        
    )
}