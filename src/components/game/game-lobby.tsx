import GameBoard from "./game-board";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import TzarBoard from "./tzar-board";
import TzarBoardPublic from "./tzar-board-public";
import WinnerBoard from "./winner-board";

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
    const currentRound = rounds.filter(round => round.id === game.current_round)[0];
    const host = game_users[0].user_id; // game users ordered by created_at

    const { data: blackCard } = await supabase.from("cards").select().match({ id: currentRound.black_card }).single();
    const { data: round_users } = await supabase.from("rounds_users").select().match({ round_id: game.current_round });

    if (!blackCard) {
        return <div>error: No black card in this round</div>;
    }

    if (!round_users) {
        return <div>error: No User not found in current round</div>;
    }

    const isGameFinished = game_users.some(gu => gu.score >= game.score_goal);
    const isRoundFinished = round_users.filter(ru => !ru.is_tzar).every(round_user => round_user.has_played); // TODO: add timer too
    const isRoundWinner = round_users.some(ru => ru.is_winner);
    const round_user = round_users.find(ru => ru.user_id === connectedUser)!;

    const { data: game_users_cards, error } = await supabase
        .from("games_users_cards")
        .select()
        .match({ game_user_id: game_users.find(gu => gu.user_id === connectedUser)?.id });

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

    const whiteCards = userCards
        ? userCards.filter(uCard => game_users_cards.find(guc => guc.card_id === uCard.id))
        : [];

    let playedCards: Card[] = [];
    const { data: round_users_cards } = await supabase
        .from("rounds_users_cards")
        .select()
        .in(
            "rounds_user_id",
            round_users.map(ru => ru.id)
        );

    if (round_users_cards !== null && round_users_cards.length !== 0) {
        const { data } = await supabase
            .from("cards")
            .select()
            .in(
                "id",
                round_users_cards.map(ruc => ruc.card_id)
            );
        playedCards = round_users_cards.map(ruc => data?.find(c => c.id === ruc.card_id)!); // make sure order of play is conserved
    }

    if (isRoundWinner || isGameFinished) {
        return (
            <WinnerBoard
                isGameFinished={isGameFinished}
                game={game}
                roundUsers={round_users}
                users={users}
                gameUsers={game_users}
                connectedUser={connectedUser}
                host={host}
            />
        );
    }

    // TODO: make sure we don't make non necessary request when we go there
    if (isRoundFinished) {
        return (
            <TzarBoardPublic
                game={game}
                playedCards={playedCards}
                roundUsers={round_users}
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
            playedCards={playedCards}
            roundUsers={round_users}
        />
    );
}
