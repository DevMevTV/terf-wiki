import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { getItem } from "../api/github";

import NotFound from "../components/NotFound";
import Loading from "../components/Loading";

export default function Item() {
    const { id } = useParams();

    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["item", id],
        queryFn: () => getItem(id!),
        enabled: !!id,
    });

    if (isLoading)
        return ( <Loading/> );

    if (error || !data)
        return ( <NotFound/> );

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.35,
                ease: "easeOut",
            }}
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 350px",
                gap: 20,
            }}
        >
            <div>
                <h1>{data.name}</h1>
                <p>{data.description}</p>
            </div>

            <div style={{ height: 500 }}>
            </div>
        </motion.div>
    );
}