import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function users({ params: { id } }: { params: { id: number } }) {
    const supabase = createServerComponentClient({ cookies });

    let { data: users, error } = await supabase.from("users").select("name");

    return (
        <main>
            <h2>users</h2>
        </main>
    );
}
