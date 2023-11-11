"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const CreateGameFormSchema = z.object({
    player_count: z.coerce.number().positive(),
    score_goal: z.coerce.number().positive(),
    cards_per_round: z.coerce.number().positive(),
    protected: z.string().optional(),
    decks: z.array(z.coerce.number()).min(1),
});

export async function createGame(formData: FormData) {
    const supabase = createServerActionClient<Database>({ cookies });
    const parsed = CreateGameFormSchema.safeParse({
        player_count: formData.get("player_count"),
        score_goal: formData.get("score_goal"),
        cards_per_round: formData.get("cards_per_round"),
        protected: formData.get("protected"),
        decks: formData.getAll("decks"),
    });

    if (!parsed.success) {
        console.error(parsed.error);
        return { error: parsed.error.message }; //TODO: add error message to the form
    }

    // create the game
    const { data, error } = await supabase
        .from("games")
        .insert({
            player_count: parsed.data.player_count,
            score_goal: parsed.data.score_goal,
            cards_per_round: parsed.data.cards_per_round,
            password: parsed.data.protected ?? null,
        })
        .select()
        .single();

    if (error) {
        console.error(error);
        return { error: error.message };
    }

    // add the decks to the game
    parsed.data.decks.forEach(async deck => {
        await supabase.from("games_decks").insert({
            game_id: data?.id!,
            deck_id: deck,
        });
    });

    // add the user to the game
    const {
        data: { session },
    } = await supabase.auth.getSession();

    await supabase.from("games_users").insert({
        game_id: data?.id!,
        user_id: session?.user.id!,
    });

    redirect(`/games/${data?.id}`);
}

export async function leaveGame(formData: FormData) {
    const gameId = formData.get("game_id");

    if (!gameId) {
        return { error: "No game ID provided" };
    }

    const supabase = createServerActionClient<Database>({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    await supabase.from("games_users").delete().match({
        user_id: session?.user.id!,
    });

    redirect("/games");
}

export async function joinGame(formData: FormData) {
    const gameId = formData.get("game_id");
    const password = formData.get("password");

    if (!gameId) {
        return { error: "No game ID provided" };
    }

    const supabase = createServerActionClient<Database>({ cookies });

    const { count } = await supabase
        .from("games_users")
        .select("*", { count: "exact", head: true })
        .eq("game_id", gameId);

    const { data: game } = await supabase.from("games").select().match({ id: gameId }).single();

    if (!count || !game) {
        return { error: "Game not found" };
    }
    if (count >= game.player_count) {
        return { error: "Game is full" };
    }

    if (!!game.password && game.password !== password) {
        return { error: "Password incorrect" };
    }

    const {
        data: { session },
    } = await supabase.auth.getSession();

    await supabase.from("games_users").insert({
        game_id: parseInt(gameId.toString()),
        user_id: session?.user.id!,
    });

    redirect(`/games/${gameId}`);
}
