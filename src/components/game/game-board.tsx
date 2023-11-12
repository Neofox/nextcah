"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

export default function GameBoard({
    rounds,
    game,
    game_users,
    connectedUser,
}: {
    rounds: Round[];
    game: Game;
    game_users: GameUser[];
    connectedUser: string;
}) {
    const supabase = createClientComponentClient<Database>();
    const [cards, setCards] = useState<Card[]>([]);
    const [blackCard, setBlackCard] = useState<Card>();

    useEffect(() => {
        const me = game_users.find(game_user => game_user.user_id === connectedUser);
        if (!me) return;

        const getCards = async () => {
            const { data: game_user_cards } = await supabase
                .from("games_users_cards")
                .select("card_id")
                .match({ game_user_id: me.id });

            if (!game_user_cards) return;

            const { data: cards } = await supabase
                .from("cards")
                .select()
                .in(
                    "id",
                    game_user_cards?.map(game_user_card => game_user_card.card_id)
                );
            setCards(cards ?? []);
        };

        const getBlackCard = async () => {
            const { data: card } = await supabase
                .from("cards")
                .select()
                .match({ id: rounds.at(-1)?.black_card })
                .single();

            if (!card) return;

            setBlackCard(card);
        };

        getCards();
        getBlackCard();

        return () => {
            setCards([]);
            setBlackCard(undefined);
        };
    }, [supabase, game, connectedUser, game_users, rounds]);

    if (!rounds || rounds.length === 0) return <div>no rounds</div>;

    return (
        <main>
            <div>Game in progress... round {rounds.length}</div>
            <div>black card:</div>
            <div>
                {blackCard?.text} pick {blackCard?.pick}
            </div>
            <div>your cards:</div>
            {cards.map(card => (
                <div key={card.id}>{card.text}</div>
            ))}
        </main>
    );
}
