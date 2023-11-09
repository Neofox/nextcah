import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth/actions";

export default async function GamesLayout({ children }: { children: React.ReactNode }) {
    const supabase = createServerComponentClient<Database>({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const { data } = await supabase.from("users").select().single();

    if (!session) {
        redirect("/");
    }
    // console.log(session);
    return (
        <>
            <nav className="border-b">
                <div className="flex h-16 items-center px-4">
                    <div className="mx-6">Hello {data?.username ?? "username_not_defined"}</div>
                    <form action={logout} className="ml-auto flex items-center space-x-4">
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
