"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useFormStatus } from "react-dom";
import { Icons } from "../Icons";
import { chooseWinningCard } from "@/actions/game/actions";

type PresenceState = {
    isTzar: boolean;
    cards: Card[];
    selectedCard: Card;
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
    game,
}: {
    round: Round;
    blackCard: Card;
    users: User[];
    roundUsers: RoundUser[];
    playedCards: Card[];
    roundUsersCards: RoundUserCard[];
    isTzar: boolean;
    connectedUser: string;
    game: Game;
}) {
    const [viewedCards, setViewedCards] = useState<Card[]>([]);
    const [selectedCard, setSelectedCard] = useState<Card>();
    const supabase = createClientComponentClient<Database>();
    const channel = supabase.channel("cards_viewed", {
        config: {
            presence: { key: connectedUser },
        },
    });

    const handleViewCard = (card: Card) => {
        setViewedCards(prev => {
            if (prev.map(c => c.id).includes(card.id)) return prev; // card already viewed

            return [...prev, card]; // add card
        });
    };
    const handleSelectCard = (card: Card) => {
        setSelectedCard(card);
    };

    useEffect(() => {
        channel
            .on("presence", { event: "sync" }, () => {
                const presenceState = channel.presenceState<PresenceState>();
                const tzarId = roundUsers.find(ru => ru.is_tzar);
                if (tzarId && presenceState[tzarId.user_id]) {
                    const viewedCardsByTzar = presenceState[tzarId.user_id].at(0)?.cards ?? [];
                    const selectedCardByTzar = presenceState[tzarId.user_id].at(0)?.selectedCard ?? null;
                    if (viewedCardsByTzar !== viewedCards) {
                        setViewedCards(() => viewedCardsByTzar);
                    }
                    if (selectedCardByTzar) {
                        setSelectedCard(selectedCardByTzar);
                    }
                }
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [channel, setViewedCards, viewedCards, roundUsers]);

    useEffect(() => {
        channel.track({ isTzar: isTzar, cards: viewedCards, selectedCard: selectedCard });

        return () => {
            channel.untrack();
        };
    }, [viewedCards, channel, isTzar, selectedCard]);

    if (blackCard.pick === null) return <div>error blackcard mal formated... {blackCard.id}</div>;

    return (
        <main className="flex flex-col h-[90vh]">
            {isTzar && (
                <div className="flex justify-center my-4">
                    <form
                        action={async (formData: FormData) => {
                            if (!!selectedCard) {
                                formData.append("card_id", selectedCard.id.toString());
                                await chooseWinningCard(formData);
                            }
                        }}
                    >
                        <input type="hidden" name="game_id" value={game.id} />
                        <ChooseButton isCardSelected={!!selectedCard} />
                    </form>
                </div>
            )}
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
                                            viewCard={isTzar ? handleViewCard : () => {}}
                                            selectCard={isTzar ? handleSelectCard : () => {}}
                                            isSelected={selectedCard?.id === card.id}
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

function ChooseButton({ isCardSelected }: { isCardSelected: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button className="text-center text-2xl" disabled={pending || !isCardSelected}>
            {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            <span className="ml-1">Choose!</span>
        </Button>
    );
}

function WhiteCard({
    cardContent,
    selectCard,
    viewCard,
    isViewed,
    isSelected,
    className,
}: {
    cardContent: Card;
    selectCard: Function;
    viewCard: Function;
    isViewed: boolean;
    isSelected: boolean;
    className?: string;
}) {
    return (
        <div style={{ perspective: "1000px" }}>
            <Card
                id="card_content"
                onClick={() => (isViewed ? selectCard(cardContent) : viewCard(cardContent))}
                className={cn(
                    " w-48 h-52 relative transition-all duration-500 shadow-md hover:shadow-2xl",
                    className,
                    "relative", // 3d effect
                    isSelected && "z-10 bg-green-100 -translate-y-12 hover:-translate-y-12 "
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
