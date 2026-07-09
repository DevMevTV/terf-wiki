import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NotFound() {
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
            }}
        >
            <h1>Page not found.</h1>
            <p>
                Go back <Link to="/">Home</Link>
            </p>
        </motion.div>
    )
}