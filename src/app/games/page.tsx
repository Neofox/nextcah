import { Button } from "@/components/ui/button";

export default async function Games() {
    return (
        <main>
            <h3>List of games</h3>
            <Button>Create a game</Button>
            {Array(9)
                .fill("")
                .map((_, i) => {
                    return <div key={i}>hello</div>;
                })}
        </main>
    );
}
