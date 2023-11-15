"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

type PresenceState = {
    isTzar: boolean;
    cards: Card[];
};

export default function TzarBoardPublic({
    round,
    blackCard,
    roundUsers,
    users,
    playedCards,
    roundUsersCards,
    isTzar,
    connectedUser,
}: {
    round: Round;
    blackCard: Card;
    users: User[];
    roundUsers: RoundUser[];
    playedCards: Card[];
    roundUsersCards: RoundUserCard[];
    isTzar: boolean;
    connectedUser: string;
}) {
    const [viewedCards, setViewedCards] = useState<Card[]>([]);
    const supabase = createClientComponentClient<Database>();
    const channel = supabase.channel("cards_viewed", {
        config: {
            presence: { key: connectedUser },
        },
    });

    const handleSelectedCard = (card: Card) => {
        setViewedCards(prev => {
            if (prev.map(c => c.id).includes(card.id)) return prev; // card already viewed

            return [...prev, card]; // add card
        });
    };

    useEffect(() => {
        channel
            .on("presence", { event: "sync" }, () => {
                const presenceState = channel.presenceState<PresenceState>();
                const tzarId = roundUsers.find(ru => ru.is_tzar);
                if (tzarId && presenceState[tzarId.user_id]) {
                    const viewedCardsByTzar = presenceState[tzarId.user_id].at(0)?.cards ?? [];
                    if (viewedCardsByTzar !== viewedCards) {
                        setViewedCards(() => viewedCardsByTzar);
                    }
                }
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [channel, setViewedCards, viewedCards, roundUsers]);

    useEffect(() => {
        channel.track({ isTzar: isTzar, cards: viewedCards });

        return () => {
            channel.untrack();
        };
    }, [viewedCards, channel, isTzar]);

    if (blackCard.pick === null) return <div>error blackcard mal formated... {blackCard.id}</div>;

    return (
        <main className="flex flex-col h-[90vh]">
            <div id="game_data" className="flex-grow flex-wrap justify-center items-center flex">
                {roundUsers
                    .filter(ru => ru.has_played)
                    .map(ru => {
                        const cards = playedCards.filter(card =>
                            roundUsersCards
                                .filter(ruc => ruc.rounds_user_id === ru.id)
                                .map(ruc => ruc.card_id)
                                .includes(card.id)
                        );
                        return (
                            <div key={ru.id} className="m-2 flex">
                                {cards.map((card, i) => {
                                    return (
                                        <WhiteCard
                                            selectedCard={isTzar ? handleSelectedCard : () => {}}
                                            isViewed={viewedCards.map(c => c.id).includes(card.id)}
                                            key={`${ru.id}-${i}`}
                                            cardContent={card}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
            </div>
            <div id="hand" className="flex justify-center">
                <div id="black_card" className="mx-auto">
                    {<BlackCard cardContent={blackCard} />}
                </div>
            </div>
        </main>
    );
}

function WhiteCard({
    cardContent,
    selectedCard,
    isViewed,
    className,
}: {
    cardContent: Card;
    selectedCard: Function;
    isViewed: boolean;
    className?: string;
}) {
    return (
        <div style={{ perspective: "1000px" }}>
            <Card
                id="card_content"
                onClick={() => selectedCard(cardContent)}
                className={cn(
                    " w-48 h-52 relative transition-all duration-500 shadow-md hover:shadow-2xl",
                    className,
                    "relative" // 3d effect
                )}
                style={
                    isViewed
                        ? { transformStyle: "preserve-3d", transform: "rotateY(180deg)" }
                        : { transformStyle: "preserve-3d" }
                }
            >
                <CardHeader
                    id="card_back"
                    className="absolute  h-full w-full"
                    style={{
                        backfaceVisibility: "hidden",
                        transformStyle: "preserve-3d",
                        transform: "rotateY( 180deg )",
                    }}
                >
                    <CardTitle className="text-xl select-none">{cardContent.text}</CardTitle>
                </CardHeader>
                <CardHeader
                    id="card_front"
                    className="absolute  h-full w-full"
                    style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
                >
                    <CardTitle className="text-xl select-none"></CardTitle>
                </CardHeader>
            </Card>
        </div>
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
