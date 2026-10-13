// Supabase에서 생성한 DB 타입 (generate_typescript_types)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address1: string
          address2: string
          created_at: string
          id: number
          is_default: boolean
          label: string
          phone: string
          recipient: string
          user_id: string
          zipcode: string
        }
        Insert: {
          address1: string
          address2?: string
          created_at?: string
          id?: never
          is_default?: boolean
          label?: string
          phone: string
          recipient: string
          user_id: string
          zipcode: string
        }
        Update: {
          address1?: string
          address2?: string
          created_at?: string
          id?: never
          is_default?: boolean
          label?: string
          phone?: string
          recipient?: string
          user_id?: string
          zipcode?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          description: string
          id: number
          image: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          description?: string
          id?: never
          image?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          description?: string
          id?: never
          image?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: number
          order_id: string
          product_id: number | null
          product_image: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: never
          order_id: string
          product_id?: number | null
          product_image?: string
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          id?: never
          order_id?: string
          product_id?: number | null
          product_image?: string
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address1: string
          address2: string
          created_at: string
          id: string
          items_amount: number
          memo: string
          order_name: string
          order_no: string
          paid_at: string | null
          phone: string
          recipient: string
          shipping_fee: number
          status: string
          total_amount: number
          updated_at: string
          user_id: string
          zipcode: string
        }
        Insert: {
          address1: string
          address2?: string
          created_at?: string
          id?: string
          items_amount: number
          memo?: string
          order_name: string
          order_no: string
          paid_at?: string | null
          phone: string
          recipient: string
          shipping_fee: number
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
          zipcode: string
        }
        Update: {
          address1?: string
          address2?: string
          created_at?: string
          id?: string
          items_amount?: number
          memo?: string
          order_name?: string
          order_no?: string
          paid_at?: string | null
          phone?: string
          recipient?: string
          shipping_fee?: number
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
          zipcode?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string
          id: number
          method: string
          order_id: string
          payment_key: string
          raw: Json
          status: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          created_at?: string
          id?: never
          method?: string
          order_id: string
          payment_key: string
          raw?: Json
          status: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string
          id?: never
          method?: string
          order_id?: string
          payment_key?: string
          raw?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string
          category_id: number
          created_at: string
          description: string
          id: number
          image: string
          is_active: boolean
          is_featured: boolean
          name: string
          price: number
          slug: string
          source_url: string
          specs: Json
          stock: number
          summary: string
          updated_at: string
        }
        Insert: {
          brand?: string
          category_id: number
          created_at?: string
          description?: string
          id?: never
          image?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          price: number
          slug: string
          source_url?: string
          specs?: Json
          stock?: number
          summary?: string
          updated_at?: string
        }
        Update: {
          brand?: string
          category_id?: number
          created_at?: string
          description?: string
          id?: never
          image?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          slug?: string
          source_url?: string
          specs?: Json
          stock?: number
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
          role: string
        }
        Insert: {
          created_at?: string
          id: string
          name?: string
          phone?: string
          role?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
          role?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: number
          product_id: number
          rating: number
          user_id: string
        }
        Insert: {
          author_name?: string
          content: string
          created_at?: string
          id?: never
          product_id: number
          rating: number
          user_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: never
          product_id?: number
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_pending_order: { Args: { p_order_id: string }; Returns: undefined }
      create_order: {
        Args: {
          p_address1: string
          p_address2?: string
          p_items: Json
          p_memo?: string
          p_phone: string
          p_recipient: string
          p_zipcode: string
        }
        Returns: {
          id: string
          order_name: string
          order_no: string
          total_amount: number
        }[]
      }
      finalize_payment: {
        Args: {
          p_amount: number
          p_approved_at: string
          p_method: string
          p_order_no: string
          p_payment_key: string
          p_raw: Json
        }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      shipping_fee_for: { Args: { p_items_amount: number }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]
