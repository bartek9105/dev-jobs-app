export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        ComputedFields: never;
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      cities: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        ComputedFields: never;
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          logo_path: string | null;
          name: string;
          slug: string;
          updated_at: string;
          website: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          logo_path?: string | null;
          name: string;
          slug: string;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          logo_path?: string | null;
          name?: string;
          slug?: string;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      company_members: {
        Row: {
          company_id: string;
          created_at: string;
          role: Database["public"]["Enums"]["company_role"];
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          company_id: string;
          created_at?: string;
          role?: Database["public"]["Enums"]["company_role"];
          user_id: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          role?: Database["public"]["Enums"]["company_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      offer_locations: {
        Row: {
          city_id: string;
          offer_id: string;
        };
        ComputedFields: never;
        Insert: {
          city_id: string;
          offer_id: string;
        };
        Update: {
          city_id?: string;
          offer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "offer_locations_city_id_fkey";
            columns: ["city_id"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offer_locations_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "offers";
            referencedColumns: ["id"];
          },
        ];
      };
      offer_salaries: {
        Row: {
          currency: string;
          employment_type: Database["public"]["Enums"]["employment_type"];
          max_amount: number;
          min_amount: number;
          offer_id: string;
          period: Database["public"]["Enums"]["salary_period"];
        };
        ComputedFields: never;
        Insert: {
          currency?: string;
          employment_type: Database["public"]["Enums"]["employment_type"];
          max_amount: number;
          min_amount: number;
          offer_id: string;
          period?: Database["public"]["Enums"]["salary_period"];
        };
        Update: {
          currency?: string;
          employment_type?: Database["public"]["Enums"]["employment_type"];
          max_amount?: number;
          min_amount?: number;
          offer_id?: string;
          period?: Database["public"]["Enums"]["salary_period"];
        };
        Relationships: [
          {
            foreignKeyName: "offer_salaries_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "offers";
            referencedColumns: ["id"];
          },
        ];
      };
      offer_skills: {
        Row: {
          level: number;
          offer_id: string;
          required: boolean;
          skill_id: string;
        };
        ComputedFields: never;
        Insert: {
          level: number;
          offer_id: string;
          required?: boolean;
          skill_id: string;
        };
        Update: {
          level?: number;
          offer_id?: string;
          required?: boolean;
          skill_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "offer_skills_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "offers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offer_skills_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
        ];
      };
      offers: {
        Row: {
          apply_url: string;
          category_id: string;
          company_id: string;
          created_at: string;
          description: string;
          expires_at: string | null;
          id: string;
          published_at: string | null;
          seniority: Database["public"]["Enums"]["seniority"];
          slug: string;
          status: Database["public"]["Enums"]["offer_status"];
          title: string;
          updated_at: string;
          workplace: Database["public"]["Enums"]["workplace"];
        };
        ComputedFields: never;
        Insert: {
          apply_url: string;
          category_id: string;
          company_id: string;
          created_at?: string;
          description?: string;
          expires_at?: string | null;
          id?: string;
          published_at?: string | null;
          seniority: Database["public"]["Enums"]["seniority"];
          slug: string;
          status?: Database["public"]["Enums"]["offer_status"];
          title: string;
          updated_at?: string;
          workplace: Database["public"]["Enums"]["workplace"];
        };
        Update: {
          apply_url?: string;
          category_id?: string;
          company_id?: string;
          created_at?: string;
          description?: string;
          expires_at?: string | null;
          id?: string;
          published_at?: string | null;
          seniority?: Database["public"]["Enums"]["seniority"];
          slug?: string;
          status?: Database["public"]["Enums"]["offer_status"];
          title?: string;
          updated_at?: string;
          workplace?: Database["public"]["Enums"]["workplace"];
        };
        Relationships: [
          {
            foreignKeyName: "offers_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      skills: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        ComputedFields: never;
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      company_role: "owner" | "recruiter";
      employment_type: "b2b" | "permanent" | "mandate";
      offer_status: "draft" | "published" | "closed";
      salary_period: "month" | "hour";
      seniority: "intern" | "junior" | "mid" | "senior" | "lead";
      workplace: "remote" | "hybrid" | "office";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      company_role: ["owner", "recruiter"],
      employment_type: ["b2b", "permanent", "mandate"],
      offer_status: ["draft", "published", "closed"],
      salary_period: ["month", "hour"],
      seniority: ["intern", "junior", "mid", "senior", "lead"],
      workplace: ["remote", "hybrid", "office"],
    },
  },
} as const;
