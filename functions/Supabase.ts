import { createClient, SupabaseClient } from '@supabase/supabase-js'


import IItem from '@/interfaces/IItem';
import ICategory from '@/interfaces/ICategory';
import IPerson from '@/interfaces/IPerson';

import { getSettings } from './Settings';

let url ="", key = "", supabase : SupabaseClient, init = false;


/**
 * Initializes supabase
 * @returns boolean if supabase is successfully initialized
 */
const initSupabase = async () => {
  return new Promise((resolve, reject) => {

    // just return if already initialized
    if(init) {
      resolve(true);
    }

    // get settings
    const settings = getSettings();

    if(!settings) return reject(false);

    console.log("initializing...", settings);
    url = settings.supabaseUrl;
    key = settings.supabaseKey;

    if(!url || !key) reject(false);

    supabase = createClient(url, key);
    init = true;
    resolve(true);
  })
}

/**
 * 
 * @returns boolean if supabase is initialized
 */
const checkInit = () => {
  if(!init) {
    console.log("Supabase isn't initialized!", url, key);
  }
  return init;
}

const getItems = async () => {
  if(!checkInit()) {
    throw new Error("Supabase isnt init");
  }
    const { data, error } = await supabase.from('items').select('*');
    if (error) {
      console.log(error);
      throw new Error("Can't reach supabase to get items");
    } else {
      return data as IItem[];
    }
  }

  const getCategories = async () => {
    if(!checkInit()) {
      throw new Error("Supabase isnt init");
    }
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.log(error);
      throw new Error("Cant reach supabase");
    } else {
      return data as ICategory[];
    }
  }

  const upsertCategory = async (newCategory : ICategory) => {
    if(!checkInit()) {
      throw new Error("Supabase isnt init");;
    }
    const { data, error } = await supabase.from('categories').upsert(newCategory);
    if (error) {
      console.log(error);
      throw new Error("Can't reach supabase");
    } else {
      console.log(data);
      return true;
    } 
  }  

  const deleteCategory = async (category : ICategory) => {
    if(!checkInit()) {
      throw new Error("Supabase isn't init");
    }

    const { data, error } = await supabase.from("categories").delete().eq("id", category.id);
    if(error) {
      console.error(error);
      throw new Error("Error in delete category");
    } else {
      return true;
    }
  }

  const getPersons = async () => {
    if(!checkInit()) {
      throw new Error("Supabase isnt init");;
    }
    const { data, error } = await supabase.from('persons').select('*');
    if (error) {
      console.log(error);
      throw new Error("Cant reach supabase");
    } else {
      return data as IPerson[];
    }
  }

  const upsertPerson = async (newPerson : IPerson) => {
    if(!checkInit()) {
      throw new Error("Supabase isnt init");;
    }
    const { data, error } = await supabase.from('persons').upsert(newPerson);
    if (error) {
      console.log(error);
      throw new Error("Can't reach supabase");
    } else {
      console.log(data);
      return true;
    } 
  }

  const deletePerson = async (person: IPerson) => {
    if(!checkInit()) {
      throw new Error("Supabase isn't init");
    }

    const { data, error } = await supabase.from("persons").delete().eq("id", person.id);
    if(error) {
      console.error(error);
      throw new Error("Error in delete person");
    } else {
      return true;
    }
  }

  const upsertItem = async (item: IItem) => {
    if(!checkInit()) {
      throw new Error("Supabase isnt init");;
    }
    const { data, error } = await supabase.from('items').upsert(item);
    if (error) {
      console.log(error);
      throw new Error("Cant reach supabase");
    } else {
      return true
    }
  }

  const deleteItem = async (item: IItem) => {
    if(!checkInit()) {
      throw new Error("Supabase isnt init");;
    }
    item.deleted = true;
    const res = await upsertItem(item);
    return true && res;
  }

  const getItemById = async (id: string) => {
    if(!checkInit()) {
      throw new Error("Supabase isnt init");;
    }
    const { data, error } = await supabase.from('items').select('*').eq('id', id);
    if (error) {
      console.log(error);
      throw new Error("Cant reach supabase");
    } else {
      return data[0] as IItem;
    }
  }

export { 
  supabase, 
  initSupabase,
  checkInit,

  getItems, 
  upsertItem, 
  deleteItem, 
  getItemById,

  getCategories, 
  upsertCategory,
  deleteCategory,

  getPersons, 
  deletePerson,
  upsertPerson,
};