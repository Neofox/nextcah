import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const supabase = createMiddlewareClient<Database>({ req: request, res: response });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // if user is signed in and the current path is /auth/login redirect the user to /
    if (session && request.nextUrl.pathname === "/auth/login") {
        // redirect("/");
        // return NextResponse.redirect(new URL("/", request.url));
    }

    // if user is not signed in and the current path is not /auth/login redirect the user to /auth/login
    if (!session && request.nextUrl.pathname !== "/auth/login") {
        // redirect("/auth/login");
        // return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return response;
}
