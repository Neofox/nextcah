import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth/actions";
import { leave } from "@/actions/game/actions";
import { Progress } from "@/components/ui/progress";

export default async function GamesLayout({ children }: { children: React.ReactNode }) {
    const supabase = createServerComponentClient<Database>({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect("/");
    }

    const { data: user } = await supabase
        .from("users")
        .select()
        .match({
            id: session.user.id,
        })
        .single();

    if (!user) {
        redirect("/auth/profile");
    }

    const { count } = await supabase
        .from("rounds_users")
        .select("*", { count: "exact", head: true })
        .match({ user_id: session.user.id });

    // user is in a game
    const isInGame = count !== null && count > 0;

    return (
        <>
            {isInGame ? (
                <nav className="border-b p-2">
                    <div className="flex h-10 items-center justify-between px-4">
                        <div className="mx-6">Hello {user.username}</div>
                        <div className="mx-6">
                            <Progress className="w-80" fill="primary" value={33} />
                        </div>
                        <form action={leave} className="flex items-center space-x-4">
                            <Button variant="secondary" type="submit">
                                Leave the game
                            </Button>
                        </form>
                    </div>
                </nav>
            ) : (
                <nav className="border-b p-2">
                    <div className="flex h-10 items-center px-4">
                        <div className="mx-6">Hello {user.username}</div>
                        <form action={logout} className="ml-auto flex items-center space-x-4">
                            <Button variant="secondary" type="submit">
                                SignOut
                            </Button>
                        </form>
                    </div>
                </nav>
            )}

            {children}
        </>
    );
}
