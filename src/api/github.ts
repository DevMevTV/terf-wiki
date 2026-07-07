const BASE = "https://DevMevTV.github.io/terf-wiki/data";

export interface WikiPage {
    title: string;
    description: string;
    model: string;
}

export async function getItem(id: string): Promise<WikiPage> {
    const response = await fetch(`${BASE}/items/${id}.json`);

    if (!response.ok) {
        throw new Error("Not Found");
    }

    return response.json();
}