"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { Icons } from "../Icons";
import { startRound } from "@/actions/game/actions";

export function NextRoundButton({ game, user, host }: { game: Game; user: string; host: string }) {
    if (host === user) {
        return (
            <form action={startRound}>
                <input type="hidden" name="game_id" value={game.id} />
                <ReadyButton />
            </form>
        );
    }
}

function ReadyButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="p-4 h-10 bg-green-400 hover:bg-green-500 w-full rounded-lg shadow text-xl font-medium uppercase "
        >
            {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Next round
        </Button>
    );
}
