"use server";

import { pickWhiteCards, selectBlackCard, selectTzar } from "@/lib/game/utils";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const CreateFormSchema = z.object({
    player_count: z.coerce.number().positive(),
    score_goal: z.coerce.number().positive(),
    cards_per_round: z.coerce.number().positive(),
    time_per_round: z.coerce.number().positive(),
    protected: z.string().optional(),
    decks: z.array(z.coerce.number()).min(1),
});

export async function create(formData: FormData) {
    const supabase = createServerActionClient<Database>({ cookies });
    const parsed = CreateFormSchema.safeParse({
        player_count: formData.get("player_count"),
        score_goal: formData.get("score_goal"),
        cards_per_round: formData.get("cards_per_round"),
        time_per_round: formData.get("time_per_round"),
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
            time_per_round: parsed.data.time_per_round,
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

export async function leave(formData: FormData) {
    const gameId = formData.get("game_id");
    const userId = formData.get("user_id");

    if (!gameId) {
        return { error: "No game ID provided" };
    }

    if (!userId) {
        return { error: "No user ID provided" };
    }

    const supabase = createServerActionClient<Database>({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // select the host of the game
    const { data: game_user, error } = await supabase.from("games_users").select().order("created_at");

    if (!game_user || game_user?.length === 0) {
        return { error: "No user to remove" };
    }
    const host = game_user[0];

    if (session?.user.id !== userId && session?.user.id !== host.user_id) {
        return { error: "You are not the host of this game" };
    }

    await supabase.from("games_users").delete().match({
        user_id: userId,
    });

    redirect("/games");
}

export async function join(formData: FormData) {
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

export async function ready() {
    const supabase = createServerActionClient<Database>({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const { data: game_user } = await supabase.from("games_users").select("*").match({ user_id: session?.user.id! });

    if (!game_user || game_user.length === 0) {
        return { error: "No user to ready" };
    }

    await supabase
        .from("games_users")
        .update({ is_ready: !game_user[0].is_ready })
        .match({ user_id: session?.user.id! });

    revalidatePath(`/games/${game_user[0].game_id}`);
}

export async function startRound(formData: FormData) {
    const supabase = createServerActionClient<Database>({ cookies });

    const gameId = formData.get("game_id");
    if (!gameId) {
        return { error: "No game ID provided" };
    }

    const { data: game } = await supabase.from("games").select().match({ id: gameId }).single();
    const { data: games_decks } = await supabase.from("games_decks").select().match({ game_id: gameId });
    const { data: game_users } = await supabase.from("games_users").select().match({ game_id: gameId });

    if (!game || !games_decks || !game_users) {
        console.error(game, games_decks, game_users);

        return { error: "Game not found" };
    }

    const deckIds = games_decks.map(deck => deck.deck_id) ?? [];
    const { data: cards, error: cardError } = await supabase.from("cards").select().in("deck_id", deckIds);

    if (cardError) {
        console.error(cardError);
        return { error: cardError.message };
    }

    // clean hands of played card
    const { data: old_round_users } = await supabase.from("rounds_users").select().match({ id: game.current_round });

    old_round_users?.map(async round_user => {
        const { data: round_users_cards } = await supabase
            .from("rounds_users_cards")
            .select()
            .match({ round_users_id: round_user.id });
        const gameUser = game_users.find(gu => gu.user_id === round_user.user_id);

        if (!gameUser || !round_users_cards) {
            return;
        }

        const { error: deleteError } = await supabase
            .from("games_users_cards")
            .delete()
            .eq("game_user_id", gameUser.id)
            .in(
                "card_id",
                round_users_cards.map(ruc => ruc.card_id)
            );

        if (deleteError) {
            console.error(deleteError);
            return { error: deleteError.message };
        }
    });

    // distribute white card to player
    game_users.map(async game_user => {
        const { count } = await supabase
            .from("games_users_cards")
            .select("*", { count: "exact", head: true })
            .match({ game_user_id: game_user.id });
        const nbrOfWhiteCardToDraw = count ? game.cards_per_round - count : game.cards_per_round;
        const white_cards = pickWhiteCards(cards, nbrOfWhiteCardToDraw);

        const { error } = await supabase.from("games_users_cards").insert(
            white_cards.map(white_card => {
                return {
                    game_user_id: game_user.id,
                    card_id: white_card.id,
                };
            })
        );

        if (error) {
            console.error(error);
            return { error: error.message };
        }
    });

    // select the first black card
    const black_card = selectBlackCard(cards);

    // create round
    const { data: round, error: roundError } = await supabase
        .from("rounds")
        .insert({
            game_id: parseInt(gameId.toString()),
            black_card: black_card.id,
        })
        .select()
        .single();

    if (roundError) {
        console.error(roundError);
        return { error: roundError.message };
    }

    // add players in the round
    const { data: round_users, error: roundUserError } = await supabase
        .from("rounds_users")
        .insert(
            game_users?.map(game_user => {
                return {
                    round_id: round.id,
                    user_id: game_user.user_id,
                };
            })
        )
        .select();

    if (roundUserError) {
        console.error(roundUserError);
        return { error: roundUserError.message };
    }

    // select a tzar
    let tzar = selectTzar(round_users);
    if (old_round_users && old_round_users.length > 0) {
        tzar = selectTzar(old_round_users);
    }

    await supabase.from("rounds_users").update({ is_tzar: true }).match({ user_id: tzar.user_id, round_id: round.id });

    // define round as current round
    const { error } = await supabase.from("games").update({ current_round: round.id }).match({ id: gameId });

    if (error) {
        console.error(error);
        return { error: error.message };
    }
    revalidatePath(`/games/${game.id}`);
}

export async function playWhiteCard(formData: FormData) {
    const supabase = createServerActionClient<Database>({ cookies });

    const gameId = formData.get("game_id");
    const cardId = formData.getAll("card_id");

    if (!gameId) {
        return { error: "No game ID provided" };
    }

    if (cardId.length === 0) {
        return { error: "No card ID provided" };
    }

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const { data: game, error: gameError } = await supabase.from("games").select().match({ id: gameId }).single();

    if (gameError) {
        console.error(gameError);
        return { error: gameError.message };
    }
    const { data: rounds_user, error: roundsUserError } = await supabase
        .from("rounds_users")
        .select()
        .match({ user_id: session?.user.id, round_id: game.current_round })
        .single();

    if (roundsUserError) {
        console.error(roundsUserError);
        return { error: roundsUserError.message };
    }

    if (rounds_user.is_tzar) {
        console.error("Tzar cannot play card");
        return { error: "Tzar cannot play card" };
    }

    const { error: cardError } = await supabase.from("rounds_users_cards").insert(
        cardId.map(card => {
            return {
                rounds_user_id: rounds_user.id,
                card_id: parseInt(card.toString()),
            };
        })
    );

    if (cardError) {
        console.error(cardError);
        return { error: cardError.message };
    }

    const { error } = await supabase
        .from("rounds_users")
        .update({ has_played: true })
        .match({ user_id: session?.user.id, round_id: game.current_round });

    if (error) {
        console.error(error);
        return { error: error.message };
    }

    revalidatePath(`/games/${game.id}`);
}

export async function chooseWinningCard(formData: FormData) {
    const supabase = createServerActionClient<Database>({ cookies });

    const gameId = formData.get("game_id");
    const cardId = formData.get("card_id");

    if (!gameId) {
        return { error: "No game ID provided" };
    }

    if (!cardId) {
        return { error: "No card ID provided" };
    }

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const { data: game, error: gameError } = await supabase.from("games").select().match({ id: gameId }).single();

    if (gameError) {
        console.error(gameError);
        return { error: gameError.message };
    }

    const { data: rounds_users, error: roundsUserError } = await supabase
        .from("rounds_users")
        .select()
        .match({ round_id: game.current_round });

    if (roundsUserError) {
        console.error(roundsUserError);
        return { error: roundsUserError.message };
    }

    // get the cards played by the user this round
    const { data: rounds_users_cards, error: roundsUsersCardsError } = await supabase
        .from("rounds_users_cards")
        .select()
        .in(
            "rounds_user_id",
            rounds_users.map(ru => ru.id)
        );

    if (roundsUsersCardsError) {
        console.error(roundsUsersCardsError);
        return { error: roundsUsersCardsError.message };
    }

    // make sure only tzar can choose a winning card
    const me = rounds_users.find(user => user.user_id === session?.user.id);
    if (!me) {
        console.error("User not found");
        return { error: "User not found" };
    }

    if (!me.is_tzar) {
        console.error("Not a tzar");
        return { error: "Not a tzar" };
    }

    const { error } = await supabase
        .from("rounds_users")
        .update({ is_winner: true })
        .match({
            round_id: game.current_round,
            id: rounds_users_cards.find(ruc => ruc.card_id === parseInt(cardId.toString()))?.rounds_user_id,
        });

    if (error) {
        console.error(error);
        return { error: error.message };
    }

    revalidatePath(`/games/${game.id}`);
}
