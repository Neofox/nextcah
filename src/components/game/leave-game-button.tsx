"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { Icons } from "../Icons";
import { leave } from "@/actions/game/actions";

export function LeaveGameButton({ game, user }: { game: Game; user: string }) {
    return (
        <form action={leave}>
            <input type="hidden" name="game_id" value={game.id} />
            <input type="hidden" name="user_id" value={user} />
            <LeaveButton />
        </form>
    );
}

function LeaveButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="p-4 h-10 bg-green-400 hover:bg-green-500 w-full rounded-lg shadow text-xl font-medium uppercase "
        >
            {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Leave Game
        </Button>
    );
}
