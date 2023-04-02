import { useState, useEffect } from "react";
import { Button, Dropdown, User } from "@nextui-org/react";
import Link from "next/link";
import Router from "next/router";
import { v4 as uuidv4 } from "uuid";

import { initSettings, initCategories } from "@/functions/Settings";
import { upsertItem, checkInit, initSupabase } from "@/functions/Supabase";
import { getImage } from "@/functions/FoodDatabase";
import { getFoodNLP } from "@/functions/FoodDatabase";

import IItem from "@/interfaces/IItem";
import ISettings from "@/interfaces/ISettings";
import ICategory from "@/interfaces/ICategory";

import MaterialInput from "./MaterialInput";
import MaterialCheckbox from "./MaterialCheckbox";
import ItemPreview from "./ItemPreview";

import styles from "../styles/Add.module.css";
import "material-icons/iconfont/material-icons.css";

export default function ChangeItem({
        presetItem,
        presetSetItem,
        editMode=false    
    } : {
        presetItem: IItem,
        presetSetItem: (item: IItem) => void,
        editMode?: boolean
    }) {
        const [item, setItem] = useState<IItem>(presetItem);
        const [categories, setCategories] = useState<ICategory[]>([]);
        const [currentCategory, setCurrentCategory] = useState<ICategory>({} as ICategory);
        const [suggestions, setSuggestions] = useState<any>([]);
        const [suggestionsOverlay, setSuggestionsOverlay] = useState<boolean>(false);
        const [settings, setSettings] = useState<ISettings>({} as ISettings);

        const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            switch(e.currentTarget.type) {
                case "date":
                    setItem({
                        ...item,
                        [e.currentTarget.name]: new Date(e.currentTarget.value).getTime()
                    })
                    break;
                default:
                    setItem({
                        ...item,
                        [e.currentTarget.name]: e.currentTarget.value
                    })
                    break; 
            }
        }
    
        const handleOnSuggestionClick = (suggestion : any) => {
            setItem({
                ...item,
                foodId: suggestion.food.foodId,
                image: suggestion.food.image
            });
            setSuggestionsOverlay(false);
        }

        const handleAddItem = async () => {
            if(!editMode) {
                // Fill in blanks
                item.id = uuidv4();
                item.deleted = false;
                item.datemodified = new Date().getTime();
                item.hasDueDate == item.hasDueDate ? item.hasDueDate : false;
                item.date == item.date ? item.date : 0;
                if(item.image == undefined || item.image.length == 0) {
                    item.image = getImage(item.name);
                }
            }

        	console.log(item);
            await upsertItem(item);
            setItem({} as IItem);
            Router.replace("/");
        }

        // settings
        useEffect(() => {
            if(checkInit()) return;
            (async () => {console.log("Settings:", settings)
                if(!settings.supabaseUrl) {
                    console.log("Refreshing url");
                    await initSettings(setSettings);
                } else {
                    // success
                    if(!checkInit()) {
                        console.log("initializing supabase");
                        await initSupabase();
                        await initCategories(settings, setCategories);
                    } else { 
                        console.log("supabase already initialized"); 
                        await initCategories(settings, setCategories);
                    }
                }
            })();
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
                        sourceText: item.name,
                        source: "de",
                        target: "en-US"
                    })
                })
                const translation = (await result.json()).text;
                console.log("Translation:", translation);*/

                const nlp = await getFoodNLP(item.name, settings.edamamId, settings.edamamKey);
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

                setSuggestions(filtered);
                setSuggestionsOverlay(true);
            })();
        }, [item.name])

        // set initial item if edit mode
        useEffect(() => {
            if(editMode) setItem(presetItem);
        }, [presetItem])

        // Update parent item if edit mode
        useEffect(() => {
            if(editMode) {
                presetSetItem(item);
            }
        }, [item])

        // Set current category
        useEffect(() => {
            if(!item.category) { console.warn("Item has no category. Item:", item); return };
            const tmp = categories.find((cat) => cat.id == item.category);
            if(tmp) { setCurrentCategory(tmp) };
        }, [categories, item, presetItem, settings])

        const getCorrectDateString = (date: Date) => {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`;
        }

        return (
            <div className={styles.wrapper}>
                {suggestionsOverlay && (
                    <>
                    <div onClick={() => setSuggestionsOverlay(false)} className={styles.overlay}></div>
                    <div className={styles.suggestions}>
                        <User 
                            onClick={() => setSuggestionsOverlay(false)}
                            className={`${styles.addNewType} ${styles.suggestion}`} 
                            src={"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"}
                            name="Add new type"
                            description="Add a new type of food to the database"
                        />
                        {suggestions.length > 0 ? (
                            suggestions.map((suggestion: any) => (
                                <ItemPreview
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
                <h1>{editMode ? `Edit ${item.name}` :  `Add a new Item`}</h1>
                <Dropdown>
                  <Dropdown.Button>{item.category ? currentCategory.name : "Select Category"}</Dropdown.Button>
                  <Dropdown.Menu
                    disallowEmptySelection
                    selectionMode='single'
                    selectedKeys={[item.category]}
                    onSelectionChange={(e : any) => setItem({ ...item, category: e.currentKey })}
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
                        value={item.name} 
                        onChange={handleOnChange} 
                        name="name" 
                        label="Name" 
                        css={{ zIndex: 999 }}
                    />
                    <MaterialInput
                        value={item.place} 
                        onChange={handleOnChange} 
                        name="place" 
                        label="Place" 
                    />
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "1rem",
                    }}>
                        <MaterialInput 
                            onChange={handleOnChange}
                            value={item.unit} 
                            name="unit" 
                            label="Unit"
                            css={{ width: "150%"}}
                        />
                        <MaterialInput 
                            onChange={handleOnChange} 
                            value={item.count}
                            name="count" 
                            label="Amount" 
                            type="number" 
                        />
                    </div>
                    <MaterialCheckbox
                        onChange={(newValue) => setItem({ ...item, hasDueDate: newValue })} 
                        value={item.hasDueDate}
                        name="hasDueDate" 
                        label="Has due date?" 
                        css={{ paddingBottom: "0" }}
                    />
                    {item.hasDueDate && (
                        <MaterialInput
                            onChange={handleOnChange}
                            value={getCorrectDateString(new Date(item.date))}
                            name="date"
                            label="Date"
                            type="date"
                        />
                    )}
                    <MaterialCheckbox
                        onChange={(newValue) => setItem({ ...item, isOpened: newValue })}
                        value={item.isOpened}
                        name="isOpened"
                        label="Is Opened"
                        css={{ paddingBottom: "0" }}
                    />
                    {item.isOpened && (
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
                    {item.foodId && <ItemPreview size="medium" food={item} />}
    
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
                                {editMode ? "Save" : "Add"}
                            </span>
                    </Button>
                </div>
            </div>
        )
}