"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { playWhiteCard } from "@/actions/game/actions";

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
    const enoughCardSelected = selectedCard.length === blackCard?.pick;
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
        setSelectedCard(prev => {
            if (prev.includes(card)) return prev.filter(c => c !== card).map(c => c); // if card already here, remove
            if (prev.length >= blackCard?.pick) return prev; // if max pick is reached, do nothing

            return [...prev, card]; // add card
        });
    };

    if (!rounds || rounds.length === 0) return <div>no rounds</div>;
    if (!blackCard) return <div>no black card</div>;
    if (!cards || cards.length === 0) return <div>no cards</div>;
    if (blackCard?.pick === null) return <div>error blackcard mal formated... {blackCard.id}</div>;

    return (
        <main className="flex flex-col h-[90vh]">
            <div id="black_card" className="mx-auto">
                {blackCard && <BlackCard cardContent={blackCard} />}
            </div>
            <div id="game_data" className="flex-grow justify-center items-center flex"></div>
            <div id="hand" className="relative">
                <div>
                    {cards.map((card, i) => (
                        <WhiteCard
                            selectedCard={handleSelectedCard}
                            className={`left-10`}
                            key={card.id}
                            cardContent={card}
                            selectedPosition={selectedCard.findIndex(c => c.id === card.id)}
                            isSelected={selectedCard.includes(card)}
                        />
                    ))}
                </div>
                <div className="flex justify-center my-4">
                    <form
                        action={async (formData: FormData) => {
                            selectedCard.map(c => {
                                formData.append("card_id", c.id.toString());
                            });
                            await playWhiteCard(formData);
                        }}
                    >
                        <input type="hidden" name="game_id" value={game.id} />
                        <Button className={cn(`text-center text-2xl`, "")} disabled={!enoughCardSelected}>
                            {!enoughCardSelected ? (
                                <>
                                    <span className="text-blue-500">
                                        {selectedCard.length}/{blackCard?.pick}
                                    </span>
                                    <span className="ml-1">card{blackCard?.pick > 1 && "s"} selected.</span>
                                </>
                            ) : (
                                <span className="ml-1">play card{blackCard?.pick > 1 && "s"}</span>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    );
}

function WhiteCard({
    cardContent,
    selectedCard,
    isSelected,
    selectedPosition,
    className,
}: {
    cardContent: Card;
    selectedCard: Function;
    isSelected: boolean;
    selectedPosition: number;
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
                <CardTitle className="text-xl select-none">{cardContent.text}</CardTitle>
                {isSelected && (
                    <div className="opacity-20 text-6xl absolute top-1/4 left-20">{selectedPosition + 1}</div>
                )}
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
