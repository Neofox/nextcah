"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "../ui/use-toast";

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
    const [selectedCard, setSelectedCard] = useState<Card[]>([]);

    const { toast } = useToast();

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
    }, [supabase, game, connectedUser, game_users, rounds]);

    useEffect(() => {
        const channel = supabase
            .channel("card_played")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "rounds_users",
                    filter: `round_id=eq.${rounds.at(-1)?.id}`,
                },
                payload => {
                    console.log(payload);
                    toast({
                        description: "a player played",
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, rounds, toast]);

    const handleSelectedCard = (card: Card) => {
        console.log(card);
        setSelectedCard(prev => {
            if (prev.includes(card)) return prev.filter(c => c !== card);
            return [...prev, card];
        });
    };

    if (!rounds || rounds.length === 0) return <div>no rounds</div>;

    return (
        <main className="flex flex-col h-[80vh]">
            <div id="black_card" className="mx-auto">
                {blackCard && <BlackCard cardContent={blackCard} />}
            </div>
            <div id="game_data" className="flex-grow">
                <div>Game in progress... round {rounds.length}</div>
            </div>
            <div id="hand" className="relative">
                {cards.map((card, i) => (
                    <WhiteCard
                        selectedCard={handleSelectedCard}
                        className={`left-10`}
                        key={card.id}
                        cardContent={card}
                        isSelected={selectedCard.includes(card)}
                    />
                ))}
            </div>
        </main>
    );
}

function WhiteCard({
    cardContent,
    selectedCard,
    isSelected,
    className,
}: {
    cardContent: Card;
    selectedCard: Function;
    isSelected: boolean;
    className?: string;
}) {
    return (
        <Card
            onClick={() => selectedCard(cardContent)}
            className={cn(
                "w-48 h-52 inline-block -ml-20 hover:z-10 relative transition-all duration-500 hover:duration-100 hover:-translate-y-5 shadow-md hover:shadow-2xl",
                className,
                isSelected && "z-10 bg-blue-100 -translate-y-12 hover:-translate-y-12 "
            )}
        >
            <CardHeader>
                <CardTitle className="text-xl">{cardContent.text}</CardTitle>
            </CardHeader>
        </Card>
    );
}

function BlackCard({ cardContent, className }: { cardContent: Card; className?: string }) {
    return (
        <Card className={cn("w-48 h-52 min-h-fit shadow-md  text-white bg-black", className)}>
            <CardHeader>
                <CardTitle className="text-xl">{cardContent.text}</CardTitle>
            </CardHeader>
        </Card>
    );
}
