import { leaveGame } from "@/actions/game/actions";
import WaitingRoom from "@/components/game/waiting-room";
import { Button } from "@/components/ui/button";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Game({ params }: { params: { id: number } }) {
    const supabase = createServerComponentClient<Database>({ cookies });

    const {
        data: { session },
    } = await supabase.auth.getSession();
    const { data: game, error } = await supabase.from("games").select("*").eq("id", params.id).single();

    if (!game) {
        redirect("/games");
    }

    const { data: game_users } = await supabase.from("games_users").select().eq("game_id", game.id).order("created_at");

    const isUserInGame = game_users?.find(game_user => game_user.user_id === session?.user.id);

    if (!isUserInGame || !game_users) {
        redirect("/games");
    }

    return <WaitingRoom game={game} game_users={game_users} connectedUser={session?.user.id!} />;
}
