import type { Database as DB } from "@/lib/database.types";

declare global {
    type Database = DB;
    type User = DB["public"]["Tables"]["users"]["Row"];
    type Game = DB["public"]["Tables"]["games"]["Row"];
    type Deck = DB["public"]["Tables"]["decks"]["Row"];
    type Card = DB["public"]["Tables"]["cards"]["Row"];
    type Round = DB["public"]["Tables"]["rounds"]["Row"];
    type RoundUser = DB["public"]["Tables"]["rounds_users"]["Row"];
    type RoundUserCard = DB["public"]["Tables"]["rounds_users_cards"]["Row"];
    type GameUser = DB["public"]["Tables"]["games_users"]["Row"];
}
