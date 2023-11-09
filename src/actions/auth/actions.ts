"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const LoginFormSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function login(formData: FormData) {
    const supabase = createServerActionClient<Database>({ cookies });
    const parsed = LoginFormSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parsed.success) {
        console.error(parsed.error);
        return { error: parsed.error }; //TODO: add error message to the form
    }

    try {
        await supabase.auth.signInWithPassword({
            email: parsed.data.email,
            password: parsed.data.password,
        });
    } catch (error) {
        console.error(error);
        return { error: error }; //TODO: add error message to the form
    }

    redirect(`/games`);
}

export async function logout() {
    const supabase = createServerActionClient<Database>({ cookies });
    await supabase.auth.signOut();

    redirect(`/`);
}
