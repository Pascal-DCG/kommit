import type { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Listing = Database["public"]["Tables"]["listings"]["Row"];
export type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"];
export type ListingUpdate = Database["public"]["Tables"]["listings"]["Update"];
export type PushSubscription = Database["public"]["Tables"]["push_subscriptions"]["Row"];

export type { ListingType, UserRole, Database } from "./database";
