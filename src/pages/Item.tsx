import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getItem } from "../api/github";

import { motion } from "framer-motion";

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

    if (isLoading || !item)
        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.35,
                    ease: "easeOut",
                }}
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <h1>Loading...</h1>
            </motion.div>
        );

    if (error)
        return (
            <motion.div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <h1>Page not found.</h1>
                <p>
                    Go back <Link to="/">Home</Link>
                </p>
            </motion.div>
        );

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