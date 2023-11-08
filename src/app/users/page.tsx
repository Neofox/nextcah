import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function users() {
    const supabase = createServerComponentClient({ cookies });

    let { data: games, error } = await supabase.from("games").select("name");

    return (
        <main>
            <h2>games</h2>
            {games?.map(game => (
                <p key={game.name}>{game.name}</p>
            ))}
        </main>
    );
}
