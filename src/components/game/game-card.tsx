"use client";

import { joinGame } from "@/actions/game/actions";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useState } from "react";

export default function GameCard({ game, game_users }: { game: Game; game_users: GameUser[] }) {
    console.log(game_users.length, game.player_count);

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
                <p className="mt-4">card in hand: {game.cards_per_round}</p>
                <p className="mt-4">score goal: {game.score_goal}</p>
                <p className="mt-4">created at : {new Date(Date.parse(game.created_at)).toLocaleString()}</p>
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
                    <Button
                        disabled={game_users.length >= game.player_count || (!!game.password && password.length === 0)}
                        className="w-52"
                    >
                        Join
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
