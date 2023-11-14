"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useOptimistic, useState } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { playWhiteCard } from "@/actions/game/actions";

export default function GameBoard({
    rounds,
    game,
    connectedUser,
    blackCard,
    whiteCards,
    playedCards,
    users,
}: {
    rounds: Round[];
    game: Game;
    connectedUser: string;
    blackCard: Card;
    whiteCards: { user_id: string; cards: Card[] }[];
    playedCards: Card[];
    users: User[];
}) {
    const supabase = createClientComponentClient<Database>();
    const [selectedCard, setSelectedCard] = useState<Card[]>(playedCards);
    const cards = whiteCards.filter(uCard => uCard.user_id === connectedUser)[0].cards;
    const enoughCardSelected = selectedCard.length === blackCard.pick;
    const { toast } = useToast();

    const [optimisticPlayedCard, updateOptimisticPlayedCard] = useOptimistic<Card[], Card[]>(
        playedCards,
        (state, action) => {
            return [...state, ...action];
        }
    );

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
                    console.log("as played", payload.new.has_played);
                    console.log("is me", payload.new.user_id !== connectedUser); // TODO: not working
                    if (payload.new.has_played && payload.new.user_id !== connectedUser) {
                        toast({
                            title: `${users.find(user => user.id === payload.new.user_id)?.username} just played!`,
                            description: `X player left!`,
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, rounds, toast, connectedUser, users]);

    const handleSelectedCard = (card: Card) => {
        setSelectedCard(prev => {
            if (prev.includes(card)) return prev.filter(c => c !== card).map(c => c); // if card already here, remove
            if (!blackCard.pick || prev.length >= blackCard.pick) return prev; // if max pick is reached, do nothing

            return [...prev, card]; // add card
        });
    };

    if (!rounds || rounds.length === 0) return <div>no rounds</div>;
    if (blackCard.pick === null) return <div>error blackcard mal formated... {blackCard.id}</div>;

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
                            isSelected={selectedCard.map(c => c.id).includes(card.id)}
                        />
                    ))}
                </div>
                <div className="flex justify-center my-4">
                    {optimisticPlayedCard.length > 0 ? (
                        <Button disabled className="text-center text-2xl">
                            You played!
                        </Button>
                    ) : (
                        <form
                            action={async (formData: FormData) => {
                                updateOptimisticPlayedCard(selectedCard);
                                selectedCard.map(c => {
                                    formData.append("card_id", c.id.toString());
                                });
                                await playWhiteCard(formData);
                            }}
                        >
                            <input type="hidden" name="game_id" value={game.id} />
                            <Button className="text-center text-2xl" disabled={!enoughCardSelected}>
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
                    )}
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
