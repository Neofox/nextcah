"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { Icons } from "../Icons";
import { useOptimistic } from "react";
import { ready } from "@/actions/game/actions";

type ButtonType = "ready" | "start" | "notready";

export function ReadyStartGameButton({
    game_users,
    user,
    host,
}: {
    game_users: GameUser[];
    user: string;
    host: string;
}) {
    const gameId = game_users.find(game_user => game_user.user_id === user)?.game_id;

    const isReady = game_users.some(game_user => game_user.user_id === user && game_user.is_ready);
    const allReady = game_users.every(game_user => game_user.is_ready);

    const [optimisticReady, updateOptimisticReady] = useOptimistic<boolean, boolean>(isReady, (state, action) => {
        return action;
    });

    if (allReady && host === user) {
        return (
            <form
                action={async (formData: FormData) => {
                    console.log(optimisticReady);
                }}
            >
                <input type="hidden" name="game_id" value={gameId} />
                <ReadyButton buttonType="start" />
            </form>
        );
    }

    if (!optimisticReady) {
        return (
            <form
                action={async (formData: FormData) => {
                    updateOptimisticReady(!isReady);
                    await ready();
                }}
            >
                <input type="hidden" name="game_id" value={gameId} />
                <ReadyButton buttonType="ready" />
            </form>
        );
    }

    if (optimisticReady) {
        return (
            <form
                action={async (formData: FormData) => {
                    updateOptimisticReady(!isReady);
                    await ready();
                }}
            >
                <input type="hidden" name="game_id" value={gameId} />
                <ReadyButton buttonType="notready" />
            </form>
        );
    }
}

function ReadyButton({ buttonType }: { buttonType: ButtonType }) {
    const { pending } = useFormStatus();

    if (buttonType === "start") {
        return (
            <Button
                type="submit"
                disabled={pending}
                className="p-4 h-10 bg-green-400 hover:bg-green-500 w-full rounded-lg shadow text-xl font-medium uppercase "
            >
                {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Start !
            </Button>
        );
    }

    if (buttonType === "notready") {
        return (
            <Button
                type="submit"
                disabled={pending}
                className="p-4 h-10 bg-red-400 hover:bg-red-500 w-full rounded-lg shadow text-xl font-medium uppercase "
            >
                {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Click to become not ready
            </Button>
        );
    }

    return (
        <Button
            type="submit"
            disabled={pending}
            className="p-4 h-10 bg-green-400 hover:bg-green-500 w-full rounded-lg shadow text-xl font-medium uppercase "
        >
            {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Click to become ready
        </Button>
    );
}
