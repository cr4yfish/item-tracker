import { v4 as uuidv4 } from 'uuid';

export default interface ICategory {
    id: string,
    created_at?: string,
    name: string,
}