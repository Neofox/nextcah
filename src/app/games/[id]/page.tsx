import { leaveGame } from "@/actions/game/actions";
import { Button } from "@/components/ui/button";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Game({ params }: { params: { id: number } }) {
    const supabase = createServerComponentClient<Database>({ cookies });

    let { data: game, error } = await supabase.from("games").select("*").eq("id", params.id).single();
    if (!game) {
        redirect("/games");
    }

    let { data: games_users } = await supabase.from("games_users").select().eq("game_id", game.id);

    const isUserInGame = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        return games_users?.find(game_user => game_user.user_id === session?.user.id);
    };
    const userInGame = await isUserInGame();

    if (!userInGame) {
        redirect("/games"); // TODO: add join button
    }

    return (
        <div>
            <h1>Game {game?.id}</h1>
            <div>Players: {games_users?.length ?? 0}</div>
            <div>Scores: </div>
            {games_users?.map(user => {
                return (
                    <div key={user.id}>
                        <div>
                            {user.user_id} : {user.score}
                        </div>
                    </div>
                );
            })}

            <form action={leaveGame}>
                <input type="hidden" name="game_id" value={game.id} />
                <Button>Leave the game</Button>
            </form>
        </div>
    );
}
