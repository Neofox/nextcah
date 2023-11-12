"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import PlayerInfo from "./player-info";
import { PlusSquare } from "lucide-react";
import { ReadyStartGameButton } from "./ready-start-button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WaitingRoom({
    game,
    game_users,
    connectedUser,
}: {
    game: Game;
    game_users: GameUser[];
    connectedUser: string;
}) {
    const host = game_users[0].user_id; // game users ordered by created_at
    const supabase = createClientComponentClient<Database>();
    const router = useRouter();

    useEffect(() => {
        const channel = supabase
            .channel("ready_state")

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

    return (
        <div className=" flex-1 p-4 flex justify-center items-center">
            <div className="bg-white w-full md:max-w-4xl rounded-lg shadow-lg">
                <div className="h-12 flex justify-between items-center border-b border-gray-200 m-4">
                    <div className="text-xl font-bold text-gray-700">&quot;{game.id}&quot; Lobby</div>
                    <div className="text-sm font-base text-gray-500">
                        Waiting for more players... ({game_users.length} over {game.player_count})
                    </div>
                </div>
                <div className="px-6">
                    {game_users.map(async game_user => {
                        const { data: user } = await supabase
                            .from("users")
                            .select()
                            .match({
                                id: game_user.user_id,
                            })
                            .single();
                        return (
                            <PlayerInfo
                                game={game}
                                key={game_user.id}
                                user={user!}
                                game_user={game_user}
                                me={connectedUser}
                                host={host}
                            />
                        );
                    })}

                    <div className="flex bg-gray-200 justify-center items-center h-16 p-4 my-6  rounded-lg  shadow-inner">
                        <div className="flex items-center border border-gray-400 p-2 border-dashed rounded cursor-pointer">
                            <div>
                                <PlusSquare color="grey" />
                            </div>
                            <div className="ml-1 text-gray-500 font-medium">Invite a friend</div>
                        </div>
                    </div>
                </div>
                <div className="p-6 ">
                    <ReadyStartGameButton game_users={game_users} user={connectedUser} host={host} />
                </div>
            </div>
        </div>
    );
}
