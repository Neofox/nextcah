import WaitingRoom from "./waiting-room";
import GameBoard from "./game-board";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function GameLobby({
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
    const supabase = createServerComponentClient<Database>({ cookies });
    const isGameInProgress = rounds !== null && rounds.length > 0;

    if (isGameInProgress) {
        const { data: blackCard } = await supabase
            .from("cards")
            .select()
            .match({ id: rounds.at(-1)?.black_card })
            .single();

        if (!blackCard) {
            return <div>error: No black card</div>;
        }

        const { data: game_users_cards, error } = await supabase
            .from("games_users_cards")
            .select()
            .in(
                "game_user_id",
                game_users.map(game_user => game_user.id)
            );

        if (error) {
            console.error(error);
            return <div>error: user have no cards</div>;
        }

        // get cards of all users in one query
        const { data: userCards } = await supabase
            .from("cards")
            .select()
            .in(
                "id",
                game_users_cards.map(guc => guc.card_id)
            );

        // filter whiteCard of user per user_id
        const whiteCards = game_users.map(game_user => {
            return {
                user_id: game_user.user_id,
                cards: userCards
                    ? userCards.filter(uCard => game_users_cards.find(guc => guc.card_id === uCard.id))
                    : [],
            };
        });

        return (
            <GameBoard
                rounds={rounds}
                game={game}
                blackCard={blackCard}
                whiteCards={whiteCards}
                connectedUser={connectedUser}
            />
        );
    }
    return <WaitingRoom game={game} game_users={game_users} connectedUser={connectedUser} />;
}
