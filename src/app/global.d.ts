import type { Database as DB } from "@/lib/database.types";

declare global {
    type Database = DB;
    type Game = DB["public"]["Tables"]["games"]["Row"];
    type Deck = DB["public"]["Tables"]["decks"]["Row"];
    type Card = DB["public"]["Tables"]["cards"]["Row"];
    type GameUser = DB["public"]["Tables"]["games_users"]["Row"];
}
