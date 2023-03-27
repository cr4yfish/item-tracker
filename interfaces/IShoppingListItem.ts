import { v4 as uuidv4 } from 'uuid';

export default interface IShoppingListItem {
    id: typeof uuidv4,
    created_at?: string,
    name: string,
    category: typeof uuidv4,
    count: number,
    supportedBy: typeof uuidv4[],
    createdBy: typeof uuidv4,
    deleted: boolean
}