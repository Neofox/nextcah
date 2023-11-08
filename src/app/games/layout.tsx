import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { logout } from "@/actions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function GamesLayout({ children }: { children: React.ReactNode }) {
    const supabase = createServerComponentClient({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const { data } = await supabase.from("users").select().single();

    if (!session) {
        redirect("/");
    }
    console.log(session);
    return (
        <>
            <nav>
                <div className="flex justify-between content-between">
                    <div>Hello {data.username}</div>
                    <form action={logout}>
                        <Button variant="secondary" type="submit">
                            SignOut
                        </Button>
                    </form>
                </div>
            </nav>
            {children}
        </>
    );
}
