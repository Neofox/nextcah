"use client";

import { joinGame } from "@/actions/game/actions";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Icons } from "../Icons";

export default function GameCard({ game, game_users }: { game: Game; game_users: GameUser[] }) {
    const [password, setPassword] = useState("");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Game {game.id}</CardTitle>
                <CardDescription>
                    {game_users.length}/{game.player_count} players
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="mt-4">card in hand: {game.cards_per_round}</div>
                    <div className="mt-4">score goal: {game.score_goal}</div>
                    <div className="mt-4">created at : {new Date(Date.parse(game.created_at)).toLocaleString()}</div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-center">
                <form action={joinGame}>
                    {game.password && (
                        <Input
                            placeholder="password needed"
                            type="password"
                            name="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    )}
                    <input type="hidden" name="game_id" value={game.id} />
                    <JoinButton
                        isDisabled={
                            game_users.length >= game.player_count || (!!game.password && password.length === 0)
                        }
                    />
                </form>
            </CardFooter>
        </Card>
    );
}

function JoinButton({ isDisabled }: { isDisabled: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button disabled={isDisabled || pending} aria-disabled={isDisabled || pending} className="w-52">
            {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Join
        </Button>
    );
}
