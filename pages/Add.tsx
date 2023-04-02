import { useState, useEffect } from "react";
import { Dropdown, Button } from "@nextui-org/react";
import Link from "next/link";
import Router from "next/router";
import { v4 as uuidv4 } from "uuid";

import MaterialInput from "@/components/MaterialInput";
import MaterialCheckbox from "@/components/MaterialCheckbox";
import FoodPreview from "@/components/ItemPreview";

import styles from "../styles/Add.module.css";
import "material-icons/iconfont/material-icons.css"

import IItem from "@/interfaces/IItem";
import ICategory from "@/interfaces/ICategory";
import ISettings from "@/interfaces/ISettings";

import { getCategories, upsertItem, initSupabase, checkInit } from "@/functions/Supabase";
import { getFoodNLP, getImage } from "@/functions/FoodDatabase";


export default function Add() {
    const [newItem, setNewItem] = useState<IItem>({} as IItem);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [suggestions, setSuggestions] = useState<any>([]);
    const [suggestionsOverlay, setSuggestionsOverlay] = useState<boolean>(false);
    const [settings, setSettings] = useState<ISettings>({} as ISettings);

    // getting settings
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

    const initCategories = () => {
        if(!checkInit) {
            initSupabase(settings);
        }
        try {
            getCategories().then((res) => { setCategories(res); })
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        (async () => {console.log("Settings:", settings)
        if(!settings.supabaseUrl) {
            console.log("Refreshing url");
            initSettings();
        } else {
            // success
            if(!checkInit()) {
                console.log("initializing supabase");
                await initSupabase(settings);
                initCategories();
            } else {
                console.log("supabase already initialized")
                initCategories();
            }
        }})();
    }, [settings])

    // Suggestions
    useEffect(() => {
        if(!settings.edamamId) {
            console.log("No edamam id. Suggestions are disabled");
            return;
        }

        (async () => {
            /*
            // Translate German -> English
            const result = await fetch("/api/translate", {
                method: "POST",
                body: JSON.stringify({
                    sourceText: newItem.name,
                    source: "de",
                    target: "en-US"
                })
            })
            const translation = (await result.json()).text;
            console.log("Translation:", translation);
            */
            const nlp = await getFoodNLP(newItem.name, settings.edamamId, settings.edamamKey);
            if(!nlp) {
                console.log("Got error connecting to food db");
                return;
            }
            
            // Filter out suggestions without images
            const onlyWithImage = nlp.hints.filter((hint: any) => hint.food.hasOwnProperty("image"));
            
            // Filter out duplicated suggestions by foodId
            const filtered = onlyWithImage.filter((hint: any, index: number, self: any) =>
                index === self.findIndex((t: any) => (
                    t.food.foodId === hint.food.foodId
                ))
            )
            console.log("Filter did something: ",onlyWithImage == filtered);

            setSuggestions(filtered);
            setSuggestionsOverlay(true);
        })();
    }, [newItem.name])

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        switch(e.currentTarget.type) {
            case "date":
                setNewItem({
                    ...newItem,
                    [e.currentTarget.name]: new Date(e.currentTarget.value).getTime()
                })
                break;
            default:
                setNewItem({
                    ...newItem,
                    [e.currentTarget.name]: e.currentTarget.value
                })
                break; 
        }
    }

    const handleOnSuggestionClick = (suggestion : any) => {
        setNewItem({
            ...newItem,
            foodId: suggestion.food.foodId,
            image: suggestion.food.image
        });
        setSuggestionsOverlay(false);
    }

    const handleAddItem = async () => {
        console.log(newItem);

        // Fill in blanks
        newItem.id = uuidv4();
        newItem.deleted = false;
        newItem.datemodified = new Date().getTime();
        newItem.hasDueDate == newItem.hasDueDate ? newItem.hasDueDate : false;
        newItem.date == newItem.date ? newItem.date : 0;
        if(newItem.image == undefined || newItem.image.length == 0) {
            newItem.image = getImage(newItem.name);
        }

        await upsertItem(newItem);
        setNewItem({} as IItem);
        Router.replace("/");
    }

    return (
        <div className={styles.wrapper}>
            {suggestionsOverlay && (
                <>
                <div onClick={() => setSuggestionsOverlay(false)} className={styles.overlay}></div>
                <div className={styles.suggestions}>
                    {suggestions.length > 0 ? (
                        suggestions.map((suggestion: any) => (
                            <FoodPreview
                                className={styles.suggestion}
                                key={suggestion.food.foodId}
                                food={{
                                    name: suggestion.food.label,
                                    image: suggestion.food.image,
                                    place: suggestion.food.category
                                } as IItem}
                                onClick={() => handleOnSuggestionClick(suggestion)}
                            />
                        ))
                    ) : (
                        <p>No suggestions found.</p>
                    )}
                </div>
                </>
            )}
            <h1>Add a new item</h1>
            <Dropdown>
              <Dropdown.Button>{newItem.category ? categories.filter(category => category.id == newItem.category)[0].name : "Select Category"}</Dropdown.Button>
              <Dropdown.Menu
                disallowEmptySelection
                selectionMode='single'
                selectedKeys={[newItem.category]}
                onSelectionChange={(e : any) => setNewItem({ ...newItem, category: e.currentKey })}
              >
                {categories.map((category) => (
                  <Dropdown.Item key={category.id}>
                    {category.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <div className={styles.inputGroup}>
                <MaterialInput 
                    value={newItem.name} 
                    onChange={handleOnChange} 
                    name="name" 
                    label="Name" 
                    css={{ zIndex: 999 }}
                />
                <MaterialInput 
                    value={newItem.place} 
                    onChange={handleOnChange} 
                    name="place" 
                    label="Place" 
                />
                <MaterialInput 
                    onChange={handleOnChange} 
                    name="count" 
                    label="Amount" 
                    type="number" 
                />
                <MaterialCheckbox 
                    onChange={(newValue) => setNewItem({ ...newItem, hasDueDate: newValue })} 
                    value={newItem.hasDueDate}
                    name="hasDueDate" 
                    label="Has due date?" 
                    css={{ paddingBottom: "0" }}
                />
                {newItem.hasDueDate && (
                    <MaterialInput
                        onChange={handleOnChange}
                        name="date"
                        label="Date"
                        type="date"
                    />
                )}
                <MaterialCheckbox 
                    onChange={(newValue) => setNewItem({ ...newItem, isOpened: newValue })}
                    value={newItem.isOpened}
                    name="isOpened"
                    label="Is Opened"
                    css={{ paddingBottom: "0" }}
                />
                {newItem.isOpened && (
                    <MaterialInput
                        onChange={handleOnChange}
                        name="openedOn"
                        label="Opened On"
                        type="date"
                    />
                )}
            </div>

            <div
                className={styles.previews}    
            >
            <h2>Preview</h2>
                {newItem.foodId && <FoodPreview size="medium" food={newItem} />}

            </div>

            <div style={{
                display: "flex",
                flexDirection: "row",
                gap: "1rem",
                marginTop: "2rem"
            }}>
            <Link href="/">
                <Button auto ghost light><span className="material-icons">chevron_left</span></Button>
            </Link>
                <Button 
                    color="success" 
                    onClick={handleAddItem}
                    auto>
                        <span style={{ 
                            color: "black", 
                            padding: "0 1rem" 
                        }}>
                            Add
                        </span>
                </Button>
            </div>
        </div>
    )
}