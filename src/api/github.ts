import type { Model } from "../components/ModelViewer";

const BASE = import.meta.env.DEV
  ? "http://localhost:5173/terf-wiki/data"
  : "https://DevMevTV.github.io/terf-wiki/data";

export interface Item {
    name: string;
    description: string;
    model: string;
}

export interface Machine {
    name: string;
    description: string;
    model: Model;
}

export interface Category {
    name: string;
    id: string;
}

export async function getItem(id: string): Promise<Item> {
    const response = await fetch(`${BASE}/items/${id}.json`);

    if (!response.ok)
        throw new Error("Not Found");

    return response.json();
}

export async function getMachine(id: string): Promise<Machine> {
    const response = await fetch(`${BASE}/machines/${id}.json`);

    if (!response.ok)
        throw new Error("Not Found");

    return response.json();
}

export async function getCategory(category: string): Promise<Category[]> {
    const response = await fetch(`${BASE}/${category}.json`);
    return response.json();
}