import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getItem } from "../api/github";
import ModelViewer from "../components/ModelViewer";

export default function Item() {
    const { id } = useParams();

    const {
        data: item,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["item", id],
        queryFn: () => getItem(id!),
        enabled: !!id,
    });

    if (isLoading)
        return <h1>Loading...</h1>;

    if (error)
        return <h1>Page not found.</h1>;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 350px",
                gap: 20,
                padding: 20,
            }}
        >
            <div>
                <h1>{item.title}</h1>
                <p>{item.description}</p>
            </div>

            <div style={{ height: 500 }}>
            </div>
        </div>
    );
}