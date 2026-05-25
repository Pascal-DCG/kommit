export type ListingType = "angebot" | "anfrage";
export type UserRole = "user" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string;
          show_phone: boolean;
          telegram_chat_id: number | null;
          role: UserRole;
          avatar_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string;
          show_phone?: boolean;
          telegram_chat_id?: number | null;
          role?: UserRole;
          avatar_color: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          show_phone?: boolean;
          telegram_chat_id?: number | null;
          role?: UserRole;
          avatar_color?: string;
        };
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          type: ListingType;
          origin_label: string;
          origin_city: string;
          origin_lat: number;
          origin_lng: number;
          destination_label: string;
          destination_city: string;
          destination_lat: number;
          destination_lng: number;
          departure_at: string;
          seats: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: ListingType;
          origin_label: string;
          origin_city: string;
          origin_lat: number;
          origin_lng: number;
          destination_label: string;
          destination_city: string;
          destination_lat: number;
          destination_lng: number;
          departure_at: string;
          seats: number;
          notes?: string | null;
        };
        Update: {
          type?: ListingType;
          origin_label?: string;
          origin_city?: string;
          origin_lat?: number;
          origin_lng?: number;
          destination_label?: string;
          destination_city?: string;
          destination_lat?: number;
          destination_lng?: number;
          departure_at?: string;
          seats?: number;
          notes?: string | null;
        };
      };
      listings_archive: {
        Row: {
          id: string;
          user_id: string;
          type: ListingType;
          origin_label: string;
          origin_city: string;
          origin_lat: number;
          origin_lng: number;
          destination_label: string;
          destination_city: string;
          destination_lat: number;
          destination_lng: number;
          departure_at: string;
          seats: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: ListingType;
          origin_label: string;
          origin_city: string;
          origin_lat: number;
          origin_lng: number;
          destination_label: string;
          destination_city: string;
          destination_lat: number;
          destination_lng: number;
          departure_at: string;
          seats: number;
          notes?: string | null;
        };
        Update: {
          type?: ListingType;
          origin_label?: string;
          origin_city?: string;
          origin_lat?: number;
          origin_lng?: number;
          destination_label?: string;
          destination_city?: string;
          destination_lat?: number;
          destination_lng?: number;
          departure_at?: string;
          seats?: number;
          notes?: string | null;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh_key: string;
          auth_key: string;
          device_label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh_key: string;
          auth_key: string;
          device_label?: string | null;
        };
        Update: {
          endpoint?: string;
          p256dh_key?: string;
          auth_key?: string;
          device_label?: string | null;
        };
      };
    };
    Functions: {
      find_matches: {
        Args: { p_listing_id: string };
        Returns: {
          listing_id: string;
          user_id: string;
          origin_label: string;
          destination_label: string;
          departure_at: string;
          seats: number;
          distance_origin_km: number;
          distance_destination_km: number;
        }[];
      };
      haversine_km: {
        Args: {
          lat1: number;
          lng1: number;
          lat2: number;
          lng2: number;
        };
        Returns: number;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      listing_type: ListingType;
      user_role: UserRole;
    };
  };
}
