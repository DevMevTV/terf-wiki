import { motion } from "framer-motion";

export default function Loading() {
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
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <h1>Loading...</h1>
            </motion.div>
        );
}