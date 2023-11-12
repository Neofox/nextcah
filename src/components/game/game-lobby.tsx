"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import WaitingRoom from "./waiting-room";
import GameBoard from "./game-board";

export default function GameLobby({
    game,
    game_users,
    connectedUser,
    rounds,
}: {
    game: Game;
    game_users: GameUser[];
    connectedUser: string;
    rounds: Round[];
}) {
    const supabase = createClientComponentClient();
    const router = useRouter();

    const isGameInProgress = rounds && rounds.length > 0;

    useEffect(() => {
        const channel = supabase
            .channel("game_start")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "rounds",
                    filter: `game_id=eq.${game.id}`,
                },
                payload => {
                    console.log(payload);
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, router, game]);

    if (isGameInProgress) {
        return <GameBoard rounds={rounds} game={game} game_users={game_users} connectedUser={connectedUser} />;
    }
    return <WaitingRoom game={game} game_users={game_users} connectedUser={connectedUser} />;
}
