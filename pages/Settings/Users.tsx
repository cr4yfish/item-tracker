import { useState, useEffect } from "react"
import { Collapse, Button, Text } from "@nextui-org/react"
import { v4 as uuidv4 } from "uuid";

import PageHeader from "@/components/PageHeader"
import MaterialInput from "@/components/MaterialInput";

import { checkInit, initSupabase, getPersons, upsertPerson, deletePerson, supabase } from "@/functions/Supabase"

import IPerson from "@/interfaces/IPerson";
import ISettings from "@/interfaces/ISettings"

import styles from "../../styles/Settings/Categories.module.css"
import "material-icons/iconfont/material-icons.css"

export default function Users() {
    const [persons, setPersons] = useState<IPerson[]>([] as IPerson[])
    const [newPerson, setNewPerson] = useState<IPerson>({} as IPerson);

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
            await getPersons().then((res) => {
                console.log("persons:",res);
                setPersons(res as IPerson[])
            })

            // Realtime updates
        if(checkInit()) {
            console.log("Realtime enabled");
            const changes = supabase.channel('custom-all-channel')
            .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'persons' },
            async (payload : any) => {
                const cats = await getPersons();

                console.log('Change received!', payload)
                console.log("Finding indices for ", cats);
                const indexOld = cats.findIndex((person) => person.id === payload.old.id);
                const indexNew = cats.findIndex((person) => person.id === payload.new.id);
                console.log(`IndexOld: ${indexOld}. IndexNew: ${indexNew}`, !payload.new);

                if(!payload.new.hasOwnProperty("id")) {
                    console.log("Removing item");
                    // filter out the removed item
                    if(indexOld != -1) {
                        const tmp = cats;
                        const removedItem = tmp.splice(indexOld, 1);
                        console.log("new person:", tmp, "with removed item:", removedItem);
                        setPersons(tmp as IPerson[]);
                    } else {
                        const newCats = await getPersons();
                        setPersons(newCats);
                    }
                } else if(payload.eventType != "DELETE") {
                    console.log("Updating item");
                    console.log(payload.eventType, "adapting persons array")
                    if(indexNew == -1) {
                        // new item
                        console.log("Adding new item");
                        let tmp = cats;
                        const newItem : IPerson = { id: payload.new.id, name: payload.new.name, created_at: payload.new.created_at};
                        tmp.push(newItem);
                        console.log("new persons:", tmp, "with new item:", newItem);
                        setPersons(tmp);
                    } else {
                        console.log("Changing item");
                        const tmp = cats;
                        tmp[indexNew] = payload.new;
                        setPersons(tmp);
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
        setNewPerson({
            ...newPerson,
            [e.currentTarget.name]: e.currentTarget.value
        })
    }

    const handleAddNewPerson = async () => {
        newPerson.id = uuidv4();
        await upsertPerson(newPerson);
        setNewPerson({} as IPerson);
    }


    return (
        <>
        <main className={styles.mainWrapper}>
            <PageHeader text="Change Users" link="/Settings" />
            <Collapse className={styles.categoryList} title="Users">
                {persons.map((person) => {
                    return (
                        <div className={styles.categoryCard} key={person.id} title={person.name}>
                            <Text h4>{person.name}</Text>
                            <div className={styles.categoryCardButtons}>
                                <Button 
                                    auto 
                                    ghost 
                                    color="error"
                                    onPress={() => deletePerson(person)}
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
                <Text h2>Add a new User</Text>
                <div className={styles.inputGroup}>
                    <MaterialInput
                        onChange={handleOnChange}
                        label="Name"
                        name="name"
                    />
                </div>
                <Button onPress={handleAddNewPerson} auto flat icon={<span className="material-icons">add</span>}>Add</Button>
            </div>
        </main>
        </>
    )
}