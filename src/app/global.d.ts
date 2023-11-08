import type { Database as DB } from "@/lib/database.types";

declare global {
    type Database = DB;
    type Game = DB["public"]["Tables"]["games"]["Row"];
}
