"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeckSelector } from "./deck-selector";

import { create } from "@/actions/game/actions";
import { useFormStatus } from "react-dom";
import { Icons } from "../Icons";

export function CreateGame({ decks }: { decks: Deck[] }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Create game</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create a game</DialogTitle>
                    <DialogDescription>
                        Choose the options of the game. When done share the link to the game to your friends!
                    </DialogDescription>
                </DialogHeader>
                <form action={create}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="player_count" className="text-left col-span-2">
                                Number of player max
                            </Label>
                            <Input
                                name="player_count"
                                id="player_count"
                                defaultValue={4}
                                type="number"
                                className="col-span-2"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="score_goal" className="text-left col-span-2">
                                Score goal
                            </Label>
                            <Input
                                id="score_goal"
                                name="score_goal"
                                defaultValue={10}
                                type="number"
                                className="col-span-2"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cards_per_round" className="text-left col-span-2">
                                Cards in hand
                            </Label>
                            <Input
                                id="cards_per_round"
                                name="cards_per_round"
                                defaultValue={10}
                                type="number"
                                className="col-span-2"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cards_per_round" className="text-left col-span-2">
                                Time per round
                            </Label>
                            <Input
                                id="time_per_round"
                                name="time_per_round"
                                defaultValue={60}
                                type="number"
                                className="col-span-2"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="protected" className="text-left col-span-2">
                                Password?
                            </Label>
                            <Input id="protected" name="protected" type="password" className="col-span-2" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="decks" className="text-left col-span-2">
                                Decks of cards
                            </Label>
                            <DeckSelector decks={decks} className="text-left col-span-2" />
                        </div>
                    </div>
                    <DialogFooter>
                        <CreateButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CreateButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending} aria-disabled={pending}>
            {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Create
        </Button>
    );
}
