"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import GameCard from "./game-card";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ListGames({
    games,
    games_users,
    rounds,
}: {
    games: Game[];
    games_users: GameUser[];
    rounds: Round[];
}) {
    const supabase = createClientComponentClient<Database>();
    const router = useRouter();

    useEffect(() => {
        // TODO: dont refresh to page
        const channel = supabase
            .channel("game_list")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "games",
                },
                payload => {
                    router.refresh;
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "games_users",
                },
                payload => {
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
                rounds={rounds.filter(round => round.game_id === game.id) ?? []}
            />
        );
    });
}
