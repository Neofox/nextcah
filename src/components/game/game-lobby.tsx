import WaitingRoom from "./waiting-room";
import GameBoard from "./game-board";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function GameLobby({
    game,
    game_users,
    connectedUser,
    rounds,
    users,
}: {
    game: Game;
    game_users: GameUser[];
    connectedUser: string;
    rounds: Round[];
    users: User[];
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
            return <div>error: No black card in this round</div>;
        }

        // TODO: only send the cards of the current user for now.. if only need that, clean the whiteCard[]
        const { data: game_users_cards, error } = await supabase
            .from("games_users_cards")
            .select()
            .in(
                "game_user_id",
                game_users.filter(gu => gu.user_id === connectedUser).map(game_user => game_user.id)
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
        // TODO: can be cleaned if no other user cards are needed
        const whiteCards = game_users.map(game_user => {
            return {
                user_id: game_user.user_id,
                cards: userCards
                    ? userCards.filter(uCard => game_users_cards.find(guc => guc.card_id === uCard.id))
                    : [],
            };
        });

        const { data: round_user_id } = await supabase
            .from("rounds_users")
            .select()
            .match({ user_id: connectedUser })
            .single();

        let playedCards: Card[] = [];
        if (round_user_id !== null) {
            const { data: playedCardIds, error } = await supabase
                .from("rounds_users_cards")
                .select()
                .match({ rounds_user_id: round_user_id.id });

            if (playedCardIds !== null) {
                const { data } = await supabase
                    .from("cards")
                    .select()
                    .in(
                        "id",
                        playedCardIds.map(card => card.card_id)
                    );
                playedCards = data ?? [];
            }
        }

        return (
            <GameBoard
                rounds={rounds}
                game={game}
                blackCard={blackCard}
                whiteCards={whiteCards}
                connectedUser={connectedUser}
                playedCards={playedCards}
                users={users}
            />
        );
    }
    return <WaitingRoom game={game} users={users} game_users={game_users} connectedUser={connectedUser} />;
}
