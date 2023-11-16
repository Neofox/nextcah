"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function TzarBoard({
    round,
    blackCard,
    roundUsers,
    users,
}: {
    round: Round;
    blackCard: Card;
    users: User[];
    roundUsers: RoundUser[];
}) {
    const supabase = createClientComponentClient<Database>();
    const [URoundUsers, setRoundUsers] = useState<RoundUser[]>(roundUsers);
    const router = useRouter();

    useEffect(() => {
        const channel = supabase
            .channel("card_played")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "rounds_users",
                    filter: `round_id=eq.${round.id}`,
                },
                payload => {
                    const updatedUserRound = URoundUsers.map(ru =>
                        ru.id === payload.new.id ? (payload.new as RoundUser) : ru
                    );
                    setRoundUsers(updatedUserRound);
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, round.id, URoundUsers]);

    useEffect(() => {
        if (URoundUsers.filter(ru => !ru.is_tzar).every(ru => ru.has_played)) {
            router.refresh(); // update the view to be able to select the cards
        }
    }, [URoundUsers, router]);

    if (blackCard.pick === null) return <div>error blackcard mal formated... {blackCard.id}</div>;

    return (
        <main className="flex flex-col h-[90vh]">
            <div id="game_data" className="flex-grow flex-wrap justify-center items-center flex">
                {URoundUsers.filter(ru => ru.has_played).map(ru => (
                    <div key={ru.id} className="m-2 flex">
                        {Array(blackCard.pick)
                            .fill(0)
                            .map((_, i) => {
                                const user = users.find(user => ru.user_id === user.id)!;
                                return <WhiteCard user={user} key={`${ru.id}-${i}`} />;
                            })}
                    </div>
                ))}
            </div>
            <div id="hand" className="flex justify-center">
                <div id="black_card" className="mx-auto">
                    {<BlackCard cardContent={blackCard} />}
                </div>
            </div>
        </main>
    );
}

function WhiteCard({ user }: { user: User }) {
    return (
        <Card className="w-48 h-52 transition-all duration-500 hover:duration-100 hover:-translate-y-5 shadow-md hover:shadow-2xl">
            <CardContent className="flex justify-center items-center h-full">{user.username} card</CardContent>
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
