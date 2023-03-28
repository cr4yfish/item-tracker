
export default interface IItem {
    sort(arg0: (a: any, b: any) => number): IItem[];
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