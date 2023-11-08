import GameCard from "@/components/game/game-card";
import { Button } from "@/components/ui/button";

export default async function Games() {
    return (
        <main>
            <div className="flex justify-center items-center my-12">
                <Button>Create a game</Button>
            </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase my-12">
                    <span className="bg-background px-2 text-muted-foreground">Or join an existing game</span>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-5">
                {Array(9)
                    .fill("")
                    .map((_, i) => {
                        return <GameCard key={i} />;
                    })}
            </div>
        </main>
    );
}
