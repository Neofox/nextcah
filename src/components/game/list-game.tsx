"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import GameCard from "./game-card";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ListGames({ games, games_users }: { games: Game[]; games_users: GameUser[] }) {
    const supabase = createClientComponentClient<Database>();
    const router = useRouter();

    useEffect(() => {
        const channel = supabase
            .channel("game_list")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "games",
                },
                () => {
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, router]);

    if (games.length === 0) {
        return <div>No games found.</div>;
    }

    return games.map(game => {
        return (
            <GameCard
                game_users={games_users.filter(game_user => game_user.game_id === game.id) ?? []}
                key={game.id}
                game={game}
            />
        );
    });
}
