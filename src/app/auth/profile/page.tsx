import { Metadata } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { SigninForm } from "@/components/auth/signin-form-server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Login",
    description: "Login page",
};

export default async function ProfilePage() {
    const supabase = createServerComponentClient<Database>({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect("/");
    }

    const { data: user } = await supabase
        .from("users")
        .select("username")
        .match({
            id: session.user.id,
        })
        .single();

    if (user) {
        redirect("/game");
    }

    return (
        <>
            <div className="container relative h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
                <Link
                    href="/auth/register"
                    className={cn(buttonVariants({ variant: "ghost" }), "absolute right-4 top-4 md:right-8 md:top-8")}
                >
                    Register
                </Link>
                <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                    <div className="absolute inset-0 bg-zinc-900" />
                    <div className="relative z-20 flex items-center text-lg font-medium">NeoCAH</div>
                </div>
                <div className="lg:p-8 h-screen flex">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        <div className="flex flex-col space-y-2 mb-16 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">Profile creation</h1>
                            <p className="text-sm text-muted-foreground">Enter your username below</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
