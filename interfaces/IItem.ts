
export default interface IItem {
    id: string,
    created_at?: string,
    name: string,
    place: string,
    count: number,
    hasDueDate: boolean,
    deleted: boolean,
    date: number,
    datemodified: number,
    category: string,
    foodId?: string,
    image?: string,
}