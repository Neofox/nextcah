import SkeletonGameCard from "@/components/game/skeleton-game-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Games() {
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
                {Array(9)
                    .fill("")
                    .map((_, i) => {
                        return <SkeletonGameCard key={i} />;
                    })}
            </div>
        </main>
    );
}
