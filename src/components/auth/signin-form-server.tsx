import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import SubmitButton from "./submit-button";
import FormInput from "./form-input";
import { Icons } from "../Icons";
import { login } from "@/actions/auth/actions";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SigninForm({ className, ...props }: UserAuthFormProps) {
    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form action={login}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Email
                        </Label>
                        <FormInput type="email" placeholder="name@example.com" />
                    </div>{" "}
                    <div className="grid gap-1">
                        <Label className="sr-only" htmlFor="email">
                            Password
                        </Label>
                        <FormInput type="password" placeholder="********" />
                    </div>
                    <SubmitButton />
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
            <Button variant="outline" type="button">
                <Icons.gitHub className="mr-2 h-4 w-4" /> Github
            </Button>
        </div>
    );
}
