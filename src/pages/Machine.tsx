import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getMachine } from "../api/github";
import Loading from "../components/Loading";
import NotFound from "../components/NotFound";
import { motion } from "framer-motion";
import ModelViewer from "../components/ModelViewer";
import { useState } from "react";

export default function Machine() {
    
    const { id } = useParams();
    const [isMaximized, setIsMaximized] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["machine", id],
        queryFn: () => getMachine(id!),
        enabled: !!id,
    });

    if (isLoading) return ( <Loading/> );
    if (error || !data) return ( <NotFound/> );

    const isButtonVisible = isMaximized || isHovered;

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

            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={
                isMaximized
                    ? {
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        zIndex: 999,
                        backgroundColor: "#111",
                        padding: "20px",
                        boxSizing: "border-box"
                    }
                    : {
                        height: 500,
                        position: "relative"
                    }
            }>
                <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 1000,
                        padding: "8px 12px",
                        cursor: "pointer",
                        opacity: isButtonVisible ? 1 : 0,
                        background: "rgba(255, 255, 255, 0.8)",
                        color: "#000",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: "bold"
                    }}
                >
                    {isMaximized ? "✕" : "⛶"}
                </button>

                <ModelViewer model={data.model} isMaximized={isMaximized}/>
            </div>
        </motion.div>
    );
}