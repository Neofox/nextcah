"use client";

import { useFormStatus } from "react-dom";
import { Input } from "../ui/input";

export default function FormInput({ type, placeholder }: { type: string; placeholder: string }) {
    const { pending } = useFormStatus();

    return (
        <Input
            id={type}
            placeholder={placeholder}
            type={type}
            name={type}
            autoCapitalize="none"
            autoComplete={type}
            autoCorrect="off"
            disabled={pending}
        />
    );
}
