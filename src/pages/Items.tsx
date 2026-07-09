import { useQuery } from "@tanstack/react-query";
import { getCategory } from "../api/github";
import { Link } from "react-router-dom";
import NotFound from "../components/NotFound";
import Loading from "../components/Loading";

export default function Items() {
    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["items"],
        queryFn: () => getCategory("items"),
        enabled: true,
    });
    
    if (isLoading)
        return ( <Loading/> );
    
    if (error || !data)
        return ( <NotFound/> );

    return (
        <>
            {Object.entries(
                data.reduce<Record<string, typeof data>>((groups, item) => {
                    const letter = item.name[0].toUpperCase();
                    
                    if (!groups[letter]) {
                        groups[letter] = [];
                    }

                    groups[letter].push(item);

                    return groups;
                }, {} as Record<string, typeof data>)
            ).map(([letter, group]) => (
                <div key={letter}>
                    <h2>{letter}
                        {group.map(item => (
                            <div key={item.id}>
                                • <Link to={`/item/${item.id}`}>{item.name}</Link>
                            </div>
                        ))}
                    </h2>
                </div>
            ))}
        </>
    )
}