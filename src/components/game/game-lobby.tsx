import WaitingRoom from "./waiting-room";
import GameBoard from "./game-board";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import TzarBoard from "./tzar-board";
import TzarBoardPublic from "./tzar-board-public";

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
        const currentRound = rounds.filter(round => round.id === game.current_round)[0];

        const { data: round_users } = await supabase
            .from("rounds_users")
            .select()
            .match({ round_id: game.current_round });

        if (!round_users) {
            return <div>error: No User not found in current round</div>;
        }

        const isRoundFinished = round_users.filter(ru => !ru.is_tzar).every(round_user => round_user.has_played); // TODO: add timer too
        const round_user = round_users.find(ru => ru.user_id === connectedUser)!;

        const { data: blackCard } = await supabase
            .from("cards")
            .select()
            .match({ id: currentRound.black_card })
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

        let playedCards: Card[] = [];
        const { data: round_users_cards } = await supabase
            .from("rounds_users_cards")
            .select()
            .in(
                "rounds_user_id",
                round_users.map(ru => ru.id)
            );

        if (round_users_cards !== null) {
            const { data } = await supabase
                .from("cards")
                .select()
                .in(
                    "id",
                    round_users_cards.map(ruc => ruc.card_id)
                );
            playedCards = data ?? [];
        }

        // TODO: make sure we don't make non necessary request when we go there
        if (isRoundFinished) {
            return (
                <TzarBoardPublic
                    game={game}
                    playedCards={playedCards}
                    users={users}
                    roundUsers={round_users}
                    round={currentRound}
                    blackCard={blackCard}
                    roundUsersCards={round_users_cards ?? []}
                    isTzar={round_user.is_tzar}
                    connectedUser={connectedUser}
                />
            );
        }

        if (round_user.is_tzar) {
            return <TzarBoard users={users} roundUsers={round_users} round={currentRound} blackCard={blackCard} />;
        }

        const { data: userPlayedCardIds } = await supabase
            .from("rounds_users_cards")
            .select()
            .match({ rounds_user_id: round_user.id });

        if (userPlayedCardIds !== null) {
            const { data } = await supabase
                .from("cards")
                .select()
                .in(
                    "id",
                    userPlayedCardIds.map(card => card.card_id)
                );
            playedCards = data ?? [];
        }

        return (
            <GameBoard
                round={currentRound}
                game={game}
                blackCard={blackCard}
                whiteCards={whiteCards}
                connectedUser={connectedUser}
                playedCards={playedCards}
                users={users}
                roundUsers={round_users}
            />
        );
    }
    return <WaitingRoom game={game} users={users} game_users={game_users} connectedUser={connectedUser} />;
}
