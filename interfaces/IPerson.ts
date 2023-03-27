import { v4 as uuidv4 } from 'uuid';

export default interface IPerson {
    id: typeof uuidv4,
    created_at?: string,
    name: string,
}