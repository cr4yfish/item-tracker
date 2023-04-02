
export default interface IItem {
    sort(arg0: (a: any, b: any) => number): IItem[];
    id: string,
    created_at?: string,
    name: string,
    place: string,
    unit: string,
    count: number,
    hasDueDate: boolean,
    isOpened: boolean,
    deleted: boolean,
    date: number,
    openedOn: number,
    datemodified: number,
    category: string,
    foodId?: string,
    image?: string,
}