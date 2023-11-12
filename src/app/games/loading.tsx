import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <main>
            <div className="flex justify-center items-center my-12">
                <Button disabled>Create game</Button>
            </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase my-12">
                    <span className="bg-background px-2 text-muted-foreground">Or join an existing game</span>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-5  m-5">
                {Array(1)
                    .fill("")
                    .map((_, i) => {
                        return <SkeletonGameCard key={i} />;
                    })}
            </div>
        </main>
    );
}

function SkeletonGameCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <Skeleton className="w-56 h-6" />
                </CardTitle>
                <CardDescription>
                    <Skeleton className="h-5 w-16 rounded-xl" />
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="mt-4">
                        <Skeleton className="h-6 w-36 rounded-xl" />
                    </div>
                    <div className="mt-4">
                        <Skeleton className="h-6 w-36 rounded-xl" />
                    </div>
                    <div className="mt-4">
                        <Skeleton className="h-6 w-36 rounded-xl" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-center">
                <Button className="w-52" disabled>
                    Join
                </Button>
            </CardFooter>
        </Card>
    );
}
