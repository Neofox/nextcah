"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import WaitingRoom from "./waiting-room";

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
    }, [supabase, router]);

    if (isGameInProgress) {
        return <div>Game in progress... round {rounds.length}</div>;
    }
    return <WaitingRoom game={game} game_users={game_users} connectedUser={connectedUser} />;
}
