import { useQuery } from "@tanstack/react-query";
import { getCategory } from "../api/github";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import NotFound from "../components/NotFound";

export default function Machines() {
    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["machines"],
        queryFn: () => getCategory("machines"),
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
                                • <Link to={`/machine/${item.id}`}>{item.name}</Link>
                            </div>
                        ))}
                    </h2>
                </div>
            ))}
        </>
    )
}