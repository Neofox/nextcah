"use client";

import { useFormStatus } from "react-dom";
import { Icons } from "../Icons";
import { Button } from "@/components/ui/button";

export default function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending} aria-disabled={pending}>
            {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Login
        </Button>
    );
}
