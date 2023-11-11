import { CreateGame } from "@/components/game/create-game";
import ListGames from "@/components/game/list-game";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Games() {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: games } = await supabase.from("games").select();
    const { data: decks } = await supabase.from("decks").select();
    const { data: game_users } = await supabase.from("games_users").select();

    const isUserInGame = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const { data } = await supabase.from("games_users").select().eq("user_id", session?.user.id!).single();
        return data;
    };

    const game = await isUserInGame();
    if (game) {
        redirect(`/games/${game.game_id}`);
    }

    return (
        <main>
            <div className="flex justify-center items-center my-12">
                <CreateGame decks={decks ?? []} />
            </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase my-12">
                    <span className="bg-background px-2 text-muted-foreground">Or join an existing game</span>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-5 m-5">
                <ListGames games={games ?? []} games_users={game_users ?? []} />
            </div>
        </main>
    );
}
