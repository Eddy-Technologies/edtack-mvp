export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      characters: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: number
          image_url: string | null
          is_active: boolean | null
          name: string
          personality_prompt: string | null
          slug: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          name: string
          personality_prompt?: string | null
          slug: string
          subject?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: number
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          personality_prompt?: string | null
          slug?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_feedback: {
        Row: {
          created_at: string | null
          feedback_type: string
          id: number
          message_id: number
          user_id: number
        }
        Insert: {
          created_at?: string | null
          feedback_type: string
          id?: number
          message_id: number
          user_id: number
        }
        Update: {
          created_at?: string | null
          feedback_type?: string
          id?: number
          message_id?: number
          user_id?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: number
          sender: string
          thread_id: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          sender: string
          thread_id: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          sender?: string
          thread_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_infos_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_infos_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_infos_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_user_infos_id_fkey"
            columns: ["user_infos_id"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
        ]
      }
      codes: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          from_user_info_id: string | null
          id: string
          is_internal: boolean | null
          metadata: Json | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          to_user_info_id: string | null
          transaction_type: string
          user_info_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          description?: string | null
          from_user_info_id?: string | null
          id?: string
          is_internal?: boolean | null
          metadata?: Json | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          to_user_info_id?: string | null
          transaction_type: string
          user_info_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          from_user_info_id?: string | null
          id?: string
          is_internal?: boolean | null
          metadata?: Json | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          to_user_info_id?: string | null
          transaction_type?: string
          user_info_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_from_user_info_id_fkey"
            columns: ["from_user_info_id"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_to_user_info_id_fkey"
            columns: ["to_user_info_id"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_user_info_id_fkey"
            columns: ["user_info_id"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_content: string
          chunk_end_pos: number | null
          chunk_index: number
          chunk_start_pos: number | null
          chunk_type: string | null
          created_at: string | null
          embedding: string | null
          id: number
          parent_document_id: number | null
        }
        Insert: {
          chunk_content: string
          chunk_end_pos?: number | null
          chunk_index: number
          chunk_start_pos?: number | null
          chunk_type?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          parent_document_id?: number | null
        }
        Update: {
          chunk_content?: string
          chunk_end_pos?: number | null
          chunk_index?: number
          chunk_start_pos?: number | null
          chunk_type?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          parent_document_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "education_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      education_documents: {
        Row: {
          cache_key: string | null
          chapter: string | null
          charts: Json | null
          content: string
          content_hash: string | null
          content_type: string | null
          created_at: string | null
          custom_metadata: Json | null
          difficulty: string | null
          docling_metadata: Json | null
          docling_type: string | null
          embedding: string | null
          equations: Json | null
          figures: Json | null
          id: number
          images: Json | null
          language: string | null
          level: string
          page_number: number | null
          source_file: string
          subject_id: string | null
          syllabus_id: string | null
          tables: Json | null
          updated_at: string | null
        }
        Insert: {
          cache_key?: string | null
          chapter?: string | null
          charts?: Json | null
          content: string
          content_hash?: string | null
          content_type?: string | null
          created_at?: string | null
          custom_metadata?: Json | null
          difficulty?: string | null
          docling_metadata?: Json | null
          docling_type?: string | null
          embedding?: string | null
          equations?: Json | null
          figures?: Json | null
          id?: number
          images?: Json | null
          language?: string | null
          level: string
          page_number?: number | null
          source_file: string
          subject_id?: string | null
          syllabus_id?: string | null
          tables?: Json | null
          updated_at?: string | null
        }
        Update: {
          cache_key?: string | null
          chapter?: string | null
          charts?: Json | null
          content?: string
          content_hash?: string | null
          content_type?: string | null
          created_at?: string | null
          custom_metadata?: Json | null
          difficulty?: string | null
          docling_metadata?: Json | null
          docling_type?: string | null
          embedding?: string | null
          equations?: Json | null
          figures?: Json | null
          id?: number
          images?: Json | null
          language?: string | null
          level?: string
          page_number?: number | null
          source_file?: string
          subject_id?: string | null
          syllabus_id?: string | null
          tables?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_documents_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "education_documents_syllabus_id_fkey"
            columns: ["syllabus_id"]
            isOneToOne: false
            referencedRelation: "syllabus"
            referencedColumns: ["name"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          invited_at: string | null
          invited_by: string | null
          is_creator: boolean | null
          joined_at: string | null
          status: string
          user_info_id: string
        }
        Insert: {
          group_id: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_creator?: boolean | null
          joined_at?: string | null
          status: string
          user_info_id: string
        }
        Update: {
          group_id?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_creator?: boolean | null
          joined_at?: string | null
          status?: string
          user_info_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_info_id_fkey"
            columns: ["user_info_id"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          group_type: string | null
          id: string
          is_active: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          group_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          group_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
        ]
      }
      level_types: {
        Row: {
          description: string | null
          level_type: string
        }
        Insert: {
          description?: string | null
          level_type: string
        }
        Update: {
          description?: string | null
          level_type?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_archived: boolean | null
          is_pinned: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_pinned?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          external_status: string | null
          fulfillment_provider: string | null
          fulfillment_webhook_data: Json | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          shipped_at: string | null
          status_code: string
          total_price_cents: number
          tracking_number: string | null
          unit_price_cents: number
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          external_status?: string | null
          fulfillment_provider?: string | null
          fulfillment_webhook_data?: Json | null
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          shipped_at?: string | null
          status_code: string
          total_price_cents: number
          tracking_number?: string | null
          unit_price_cents: number
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          external_status?: string | null
          fulfillment_provider?: string | null
          fulfillment_webhook_data?: Json | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          shipped_at?: string | null
          status_code?: string
          total_price_cents?: number
          tracking_number?: string | null
          unit_price_cents?: number
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
          confirmed_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          notes: string | null
          order_number: string
          paid_at: string | null
          payment_method: string | null
          pending_at: string | null
          status_code: string
          stripe_balance_transaction_id: string | null
          total_amount_cents: number
          updated_at: string | null
          user_info_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          order_number: string
          paid_at?: string | null
          payment_method?: string | null
          pending_at?: string | null
          status_code: string
          stripe_balance_transaction_id?: string | null
          total_amount_cents: number
          updated_at?: string | null
          user_info_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_method?: string | null
          pending_at?: string | null
          status_code?: string
          stripe_balance_transaction_id?: string | null
          total_amount_cents?: number
          updated_at?: string | null
          user_info_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_info_id_fkey"
            columns: ["user_info_id"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          discount_amount_cents: number | null
          discount_end_date: string | null
          discount_percentage: number | null
          discount_start_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          metadata: Json | null
          name: string
          price_cents: number
          product_type: string
          sku: string | null
          stock_count: number
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_amount_cents?: number | null
          discount_end_date?: string | null
          discount_percentage?: number | null
          discount_start_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          price_cents: number
          product_type: string
          sku?: string | null
          stock_count?: number
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_amount_cents?: number | null
          discount_end_date?: string | null
          discount_percentage?: number | null
          discount_start_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          price_cents?: number
          product_type?: string
          sku?: string | null
          stock_count?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      question_correct_answers: {
        Row: {
          answer_boolean: boolean | null
          answer_draw_file: string | null
          answer_text: string | null
          id: string
          image_url: string | null
          option_id: string | null
          order_index: number
          question_id: string
        }
        Insert: {
          answer_boolean?: boolean | null
          answer_draw_file?: string | null
          answer_text?: string | null
          id: string
          image_url?: string | null
          option_id?: string | null
          order_index: number
          question_id: string
        }
        Update: {
          answer_boolean?: boolean | null
          answer_draw_file?: string | null
          answer_text?: string | null
          id?: string
          image_url?: string | null
          option_id?: string | null
          order_index?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_correct_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_correct_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          id: string
          image_url: string | null
          option_text: string | null
          question_id: string
        }
        Insert: {
          id: string
          image_url?: string | null
          option_text?: string | null
          question_id: string
        }
        Update: {
          id?: string
          image_url?: string | null
          option_text?: string | null
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string | null
          explanation: string | null
          explanation_image_url: string | null
          id: string
          parent_question_id: string | null
          part_label: string | null
          question: string
          question_image_url: string | null
          source_name: string
          source_timestamp: string | null
          subquestion_order: number | null
          syllabus_id: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          explanation?: string | null
          explanation_image_url?: string | null
          id: string
          parent_question_id?: string | null
          part_label?: string | null
          question: string
          question_image_url?: string | null
          source_name: string
          source_timestamp?: string | null
          subquestion_order?: number | null
          syllabus_id: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          explanation?: string | null
          explanation_image_url?: string | null
          id?: string
          parent_question_id?: string | null
          part_label?: string | null
          question?: string
          question_image_url?: string | null
          source_name?: string
          source_timestamp?: string | null
          subquestion_order?: number | null
          syllabus_id?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_parent_question_id_fkey"
            columns: ["parent_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_syllabus_id_fkey"
            columns: ["syllabus_id"]
            isOneToOne: false
            referencedRelation: "syllabus"
            referencedColumns: ["name"]
          },
        ]
      }
      roles: {
        Row: {
          id: number
          role_name: string
        }
        Insert: {
          id?: number
          role_name: string
        }
        Update: {
          id?: number
          role_name?: string
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          created_at: string | null
          data: Json | null
          event_type: string
          id: string
          processed: boolean | null
          stripe_event_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          event_type: string
          id?: string
          processed?: boolean | null
          stripe_event_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          event_type?: string
          id?: string
          processed?: boolean | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          country_code: string | null
          description: string | null
          display_name: string
          name: string
          subject_name: string
        }
        Insert: {
          country_code?: string | null
          description?: string | null
          display_name: string
          name: string
          subject_name: string
        }
        Update: {
          country_code?: string | null
          description?: string | null
          display_name?: string
          name?: string
          subject_name?: string
        }
        Relationships: []
      }
      syllabus: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          embedding: string | null
          file_hash: string | null
          level: number
          name: string
          parent_id: string | null
          subject_id: string
          syllabus_metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          embedding?: string | null
          file_hash?: string | null
          level: number
          name: string
          parent_id?: string | null
          subject_id: string
          syllabus_metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          embedding?: string | null
          file_hash?: string | null
          level?: number
          name?: string
          parent_id?: string | null
          subject_id?: string
          syllabus_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "syllabus_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "syllabus"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "syllabus_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["name"]
          },
        ]
      }
      token_history: {
        Row: {
          created_at: string | null
          id: number
          input_tokens: number | null
          model: string | null
          module_name: string
          output_tokens: number | null
          provider: string | null
          query: string | null
          query_at: string
          response_time_ms: number | null
          thread_id: string
          token_count: number
          user_infos_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          input_tokens?: number | null
          model?: string | null
          module_name: string
          output_tokens?: number | null
          provider?: string | null
          query?: string | null
          query_at?: string
          response_time_ms?: number | null
          thread_id: string
          token_count: number
          user_infos_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          input_tokens?: number | null
          model?: string | null
          module_name?: string
          output_tokens?: number | null
          provider?: string | null
          query?: string | null
          query_at?: string
          response_time_ms?: number | null
          thread_id?: string
          token_count?: number
          user_infos_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_history_user_infos_id_fkey"
            columns: ["user_infos_id"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          credit: number
          reserved_credit: number | null
          updated_at: string | null
          user_info_id: string
        }
        Insert: {
          credit?: number
          reserved_credit?: number | null
          updated_at?: string | null
          user_info_id: string
        }
        Update: {
          credit?: number
          reserved_credit?: number | null
          updated_at?: string | null
          user_info_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_credits_user_info_id_fkey"
            columns: ["user_info_id"]
            isOneToOne: true
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_infos: {
        Row: {
          address: string | null
          contact_number: string | null
          country_code: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          first_name: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          level_type: string | null
          onboarding_completed: boolean | null
          payment_customer_id: string | null
          postal_code: string | null
          profile_picture_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          contact_number?: string | null
          country_code?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          first_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          level_type?: string | null
          onboarding_completed?: boolean | null
          payment_customer_id?: string | null
          postal_code?: string | null
          profile_picture_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          contact_number?: string | null
          country_code?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          first_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          level_type?: string | null
          onboarding_completed?: boolean | null
          payment_customer_id?: string | null
          postal_code?: string | null
          profile_picture_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_infos_level_type_fkey"
            columns: ["level_type"]
            isOneToOne: false
            referencedRelation: "level_types"
            referencedColumns: ["level_type"]
          },
        ]
      }
      user_question_answers: {
        Row: {
          answer_boolean: boolean | null
          answer_draw_file: string | null
          answer_text: string | null
          id: string
          option_id: string
          option_image: string | null
          option_text: string | null
          order_index: number
          user_question_attempts_id: string
        }
        Insert: {
          answer_boolean?: boolean | null
          answer_draw_file?: string | null
          answer_text?: string | null
          id?: string
          option_id: string
          option_image?: string | null
          option_text?: string | null
          order_index: number
          user_question_attempts_id: string
        }
        Update: {
          answer_boolean?: boolean | null
          answer_draw_file?: string | null
          answer_text?: string | null
          id?: string
          option_id?: string
          option_image?: string | null
          option_text?: string | null
          order_index?: number
          user_question_attempts_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_question_answers_user_question_attempts_id_fkey"
            columns: ["user_question_attempts_id"]
            isOneToOne: false
            referencedRelation: "user_question_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_question_attempts: {
        Row: {
          attempt_number: number | null
          duration_seconds: number
          id: string
          is_correct: boolean | null
          question_id: string
          score: number | null
          submitted_at: string
          user_info_id: string
        }
        Insert: {
          attempt_number?: number | null
          duration_seconds: number
          id?: string
          is_correct?: boolean | null
          question_id: string
          score?: number | null
          submitted_at: string
          user_info_id: string
        }
        Update: {
          attempt_number?: number | null
          duration_seconds?: number
          id?: string
          is_correct?: boolean | null
          question_id?: string
          score?: number | null
          submitted_at?: string
          user_info_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_question_attempts_user_info_id_fkey"
            columns: ["user_info_id"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role_id: number
          role_name: string
          user_info_id: string
        }
        Insert: {
          id?: string
          role_id: number
          role_name: string
          user_info_id: string
        }
        Update: {
          id?: string
          role_id?: number
          role_name?: string
          user_info_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_info_id_fkey"
            columns: ["user_info_id"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tasks: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          assignee_user_info_id: string
          auto_approve: boolean | null
          category: string | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string | null
          creator_user_info_id: string
          credit: number
          description: string | null
          due_date: string | null
          id: string
          is_recurring: boolean | null
          name: string
          parent_task_id: string | null
          priority: string | null
          recurrence_end_date: string | null
          recurrence_frequency: string | null
          recurrence_interval: number | null
          status: string
          subtitle: string | null
          updated_at: string | null
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          assignee_user_info_id: string
          auto_approve?: boolean | null
          category?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          creator_user_info_id: string
          credit?: number
          description?: string | null
          due_date?: string | null
          id?: string
          is_recurring?: boolean | null
          name: string
          parent_task_id?: string | null
          priority?: string | null
          recurrence_end_date?: string | null
          recurrence_frequency?: string | null
          recurrence_interval?: number | null
          status: string
          subtitle?: string | null
          updated_at?: string | null
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          assignee_user_info_id?: string
          auto_approve?: boolean | null
          category?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          creator_user_info_id?: string
          credit?: number
          description?: string | null
          due_date?: string | null
          id?: string
          is_recurring?: boolean | null
          name?: string
          parent_task_id?: string | null
          priority?: string | null
          recurrence_end_date?: string | null
          recurrence_frequency?: string | null
          recurrence_interval?: number | null
          status?: string
          subtitle?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_assignee_user_info_id_fkey"
            columns: ["assignee_user_info_id"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_creator_user_info_id_fkey"
            columns: ["creator_user_info_id"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "user_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          updated_at: string | null
          user_info_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          updated_at?: string | null
          user_info_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          updated_at?: string | null
          user_info_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_info_id_fkey"
            columns: ["user_info_id"]
            isOneToOne: false
            referencedRelation: "user_infos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      search_notes: {
        Args: {
          p_archived?: boolean
          p_category?: string
          p_search_term?: string
          p_tags?: string[]
          p_user_id: string
        }
        Returns: {
          id: string
          title: string
          content: string
          category: string
          tags: string[]
          is_pinned: boolean
          is_archived: boolean
          created_at: string
          updated_at: string
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_user_info_with_relations: {
        Args: {
          p_email: string
          p_first_name: string
          p_is_active: boolean
          p_last_name: string
          p_level_type?: string
          p_onboarding_completed: boolean
          p_payment_customer_id: string
          p_role_name: string
          p_user_id: string
          p_user_info_id: string
        }
        Returns: Json
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

