import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <h2>Categories</h2>

            <nav>
                <Link to="/items">Items</Link>
                <Link to="/blocks">Blocks</Link>
                <Link to="/machines">Machines</Link>
            </nav>
        </aside>
    )
}