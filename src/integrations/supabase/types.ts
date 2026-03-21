export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      coaching_sessions: {
        Row: {
          created_at: string
          hours: number
          id: string
          module: string
          scheduled_date: string | null
          status: string
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          hours?: number
          id?: string
          module: string
          scheduled_date?: string | null
          status?: string
          total_amount?: number
          user_id: string
        }
        Update: {
          created_at?: string
          hours?: number
          id?: string
          module?: string
          scheduled_date?: string | null
          status?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          id: string
          sent_at: string
          sent_by: string
          target: string
          title: string
        }
        Insert: {
          body: string
          id?: string
          sent_at?: string
          sent_by: string
          target?: string
          title: string
        }
        Update: {
          body?: string
          id?: string
          sent_at?: string
          sent_by?: string
          target?: string
          title?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          id: string
          product_id: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          product_id: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          product_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_published: boolean
          price: number
          redirect_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          price?: number
          redirect_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          price?: number
          redirect_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          lang: string
          last_name: string
          phone: string | null
          profile_photo: string | null
          sms_balance: number
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          email: string
          first_name?: string
          id?: string
          lang?: string
          last_name?: string
          phone?: string | null
          profile_photo?: string | null
          sms_balance?: number
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          lang?: string
          last_name?: string
          phone?: string | null
          profile_photo?: string | null
          sms_balance?: number
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shop_requests: {
        Row: {
          business_domain: string
          contact_info: string | null
          created_at: string
          id: string
          platform_support: string
          platform_type: string
          status: string
          user_id: string
        }
        Insert: {
          business_domain?: string
          contact_info?: string | null
          created_at?: string
          id?: string
          platform_support?: string
          platform_type?: string
          status?: string
          user_id: string
        }
        Update: {
          business_domain?: string
          contact_info?: string | null
          created_at?: string
          id?: string
          platform_support?: string
          platform_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_campaigns: {
        Row: {
          created_at: string
          delivery_report: string | null
          id: string
          message: string
          recipients: string[]
          scheduled_at: string | null
          sender_name: string
          sms_used: number
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_report?: string | null
          id?: string
          message: string
          recipients?: string[]
          scheduled_at?: string | null
          sender_name?: string
          sms_used?: number
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_report?: string | null
          id?: string
          message?: string
          recipients?: string[]
          scheduled_at?: string | null
          sender_name?: string
          sms_used?: number
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_packages: {
        Row: {
          created_at: string
          id: string
          sms_count: number
          status: string
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sms_count: number
          status?: string
          total_amount: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sms_count?: number
          status?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          author_photo: string | null
          content: string
          created_at: string
          id: string
          rating: number
        }
        Insert: {
          author_name: string
          author_photo?: string | null
          content: string
          created_at?: string
          id?: string
          rating?: number
        }
        Update: {
          author_name?: string
          author_photo?: string | null
          content?: string
          created_at?: string
          id?: string
          rating?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
