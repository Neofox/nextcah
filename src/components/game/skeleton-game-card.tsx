import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonGameCard() {
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
