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
      [_ in never]: never
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
  public: {
    Tables: {
      app_users: {
        Row: {
          created_at: string | null;
          encrypted_password: string;
          id: string;
          updated_at: string | null;
          username: string;
        };
        Insert: {
          created_at?: string | null;
          encrypted_password: string;
          id?: string;
          updated_at?: string | null;
          username: string;
        };
        Update: {
          created_at?: string | null;
          encrypted_password?: string;
          id?: string;
          updated_at?: string | null;
          username?: string;
        };
        Relationships: [];
      };
      class_group_constraints: {
        Row: {
          group_id: string;
          teacher_user_info_id: string;
        };
        Insert: {
          group_id: string;
          teacher_user_info_id: string;
        };
        Update: {
          group_id?: string;
          teacher_user_info_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'class_group_constraints_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'class_group_constraints_teacher_user_info_id_fkey';
            columns: ['teacher_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'all_users';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'class_group_constraints_teacher_user_info_id_fkey';
            columns: ['teacher_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'leaderboard';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'class_group_constraints_teacher_user_info_id_fkey';
            columns: ['teacher_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'user_infos';
            referencedColumns: ['id'];
          },
        ];
      };
      credit_transactions: {
        Row: {
          amount: number;
          created_at: string | null;
          description: string | null;
          from_user_info_id: string | null;
          id: string;
          metadata: Json | null;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          to_user_info_id: string | null;
          transaction_type: string;
          user_info_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          description?: string | null;
          from_user_info_id?: string | null;
          id?: string;
          metadata?: Json | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          to_user_info_id?: string | null;
          transaction_type: string;
          user_info_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          description?: string | null;
          from_user_info_id?: string | null;
          id?: string;
          metadata?: Json | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          to_user_info_id?: string | null;
          transaction_type?: string;
          user_info_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'credit_transactions_from_user_info_id_fkey';
            columns: ['from_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'all_users';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'credit_transactions_from_user_info_id_fkey';
            columns: ['from_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'leaderboard';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'credit_transactions_from_user_info_id_fkey';
            columns: ['from_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'user_infos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'credit_transactions_to_user_info_id_fkey';
            columns: ['to_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'all_users';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'credit_transactions_to_user_info_id_fkey';
            columns: ['to_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'leaderboard';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'credit_transactions_to_user_info_id_fkey';
            columns: ['to_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'user_infos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'credit_transactions_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'all_users';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'credit_transactions_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'leaderboard';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'credit_transactions_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'user_infos';
            referencedColumns: ['id'];
          },
        ];
      };
      document_chunks: {
        Row: {
          chunk_content: string;
          chunk_end_pos: number | null;
          chunk_index: number;
          chunk_start_pos: number | null;
          chunk_type: string | null;
          created_at: string | null;
          embedding: string | null;
          id: number;
          parent_document_id: number;
        };
        Insert: {
          chunk_content: string;
          chunk_end_pos?: number | null;
          chunk_index: number;
          chunk_start_pos?: number | null;
          chunk_type?: string | null;
          created_at?: string | null;
          embedding?: string | null;
          id?: number;
          parent_document_id: number;
        };
        Update: {
          chunk_content?: string;
          chunk_end_pos?: number | null;
          chunk_index?: number;
          chunk_start_pos?: number | null;
          chunk_type?: string | null;
          created_at?: string | null;
          embedding?: string | null;
          id?: number;
          parent_document_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'document_chunks_parent_document_id_fkey';
            columns: ['parent_document_id'];
            isOneToOne: false;
            referencedRelation: 'education_documents';
            referencedColumns: ['id'];
          },
        ];
      };
      education_documents: {
        Row: {
          cache_key: string | null;
          chapter: string | null;
          charts: Json | null;
          content: string;
          content_hash: string | null;
          content_type: string | null;
          created_at: string | null;
          custom_metadata: Json | null;
          difficulty: string | null;
          docling_metadata: Json | null;
          docling_type: string | null;
          embedding: string | null;
          equations: Json | null;
          figures: Json | null;
          id: number;
          images: Json | null;
          language: string | null;
          level: string;
          page_number: number | null;
          source_file: string;
          subject_id: string;
          syllabus_id: string | null;
          tables: Json | null;
          updated_at: string | null;
        };
        Insert: {
          cache_key?: string | null;
          chapter?: string | null;
          charts?: Json | null;
          content: string;
          content_hash?: string | null;
          content_type?: string | null;
          created_at?: string | null;
          custom_metadata?: Json | null;
          difficulty?: string | null;
          docling_metadata?: Json | null;
          docling_type?: string | null;
          embedding?: string | null;
          equations?: Json | null;
          figures?: Json | null;
          id?: number;
          images?: Json | null;
          language?: string | null;
          level: string;
          page_number?: number | null;
          source_file: string;
          subject_id: string;
          syllabus_id?: string | null;
          tables?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          cache_key?: string | null;
          chapter?: string | null;
          charts?: Json | null;
          content?: string;
          content_hash?: string | null;
          content_type?: string | null;
          created_at?: string | null;
          custom_metadata?: Json | null;
          difficulty?: string | null;
          docling_metadata?: Json | null;
          docling_type?: string | null;
          embedding?: string | null;
          equations?: Json | null;
          figures?: Json | null;
          id?: number;
          images?: Json | null;
          language?: string | null;
          level?: string;
          page_number?: number | null;
          source_file?: string;
          subject_id?: string;
          syllabus_id?: string | null;
          tables?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      family_group_constraints: {
        Row: {
          group_id: string;
          parent_user_info_id: string;
        };
        Insert: {
          group_id: string;
          parent_user_info_id: string;
        };
        Update: {
          group_id?: string;
          parent_user_info_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'family_group_constraints_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'family_group_constraints_parent_user_info_id_fkey';
            columns: ['parent_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'all_users';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'family_group_constraints_parent_user_info_id_fkey';
            columns: ['parent_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'leaderboard';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'family_group_constraints_parent_user_info_id_fkey';
            columns: ['parent_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'user_infos';
            referencedColumns: ['id'];
          },
        ];
      };
      group_memberships: {
        Row: {
          group_id: string;
          user_info_id: string;
        };
        Insert: {
          group_id: string;
          user_info_id: string;
        };
        Update: {
          group_id?: string;
          user_info_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'group_memberships_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'group_memberships_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'all_users';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'group_memberships_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'leaderboard';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'group_memberships_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'user_infos';
            referencedColumns: ['id'];
          },
        ];
      };
      groups: {
        Row: {
          group_name: string;
          group_type: string;
          id: string;
        };
        Insert: {
          group_name: string;
          group_type: string;
          id?: string;
        };
        Update: {
          group_name?: string;
          group_type?: string;
          id?: string;
        };
        Relationships: [];
      };
      level_types: {
        Row: {
          description: string | null;
          level_type: string;
        };
        Insert: {
          description?: string | null;
          level_type: string;
        };
        Update: {
          description?: string | null;
          level_type?: string;
        };
        Relationships: [];
      };
      parent_child: {
        Row: {
          child_user_info_id: string;
          id: string;
          parent_user_info_id: string;
        };
        Insert: {
          child_user_info_id: string;
          id?: string;
          parent_user_info_id: string;
        };
        Update: {
          child_user_info_id?: string;
          id?: string;
          parent_user_info_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'parent_child_child_user_info_id_fkey';
            columns: ['child_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'all_users';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'parent_child_child_user_info_id_fkey';
            columns: ['child_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'leaderboard';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'parent_child_child_user_info_id_fkey';
            columns: ['child_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'user_infos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'parent_child_parent_user_info_id_fkey';
            columns: ['parent_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'all_users';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'parent_child_parent_user_info_id_fkey';
            columns: ['parent_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'leaderboard';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'parent_child_parent_user_info_id_fkey';
            columns: ['parent_user_info_id'];
            isOneToOne: false;
            referencedRelation: 'user_infos';
            referencedColumns: ['id'];
          },
        ];
      };
      question_correct_answers: {
        Row: {
          answer_boolean: boolean | null;
          answer_draw_file: string | null;
          answer_text: string | null;
          id: string;
          image_url: string | null;
          option_id: string | null;
          order_index: number;
          question_id: string;
        };
        Insert: {
          answer_boolean?: boolean | null;
          answer_draw_file?: string | null;
          answer_text?: string | null;
          id: string;
          image_url?: string | null;
          option_id?: string | null;
          order_index: number;
          question_id: string;
        };
        Update: {
          answer_boolean?: boolean | null;
          answer_draw_file?: string | null;
          answer_text?: string | null;
          id?: string;
          image_url?: string | null;
          option_id?: string | null;
          order_index?: number;
          question_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_correct_answers_option_id_fkey';
            columns: ['option_id'];
            isOneToOne: false;
            referencedRelation: 'question_options';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_correct_answers_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
        ];
      };
      question_options: {
        Row: {
          id: string;
          image_url: string | null;
          option_text: string | null;
          question_id: string;
        };
        Insert: {
          id: string;
          image_url?: string | null;
          option_text?: string | null;
          question_id: string;
        };
        Update: {
          id?: string;
          image_url?: string | null;
          option_text?: string | null;
          question_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_options_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
        ];
      };
      questions: {
        Row: {
          created_at: string | null;
          explanation: string | null;
          explanation_image_url: string | null;
          id: string;
          parent_question_id: string | null;
          part_label: string | null;
          question: string;
          question_image_url: string | null;
          source_name: string;
          source_timestamp: string | null;
          subquestion_order: number | null;
          syllabus_id: string;
          title: string;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          explanation?: string | null;
          explanation_image_url?: string | null;
          id: string;
          parent_question_id?: string | null;
          part_label?: string | null;
          question: string;
          question_image_url?: string | null;
          source_name: string;
          source_timestamp?: string | null;
          subquestion_order?: number | null;
          syllabus_id: string;
          title: string;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          explanation?: string | null;
          explanation_image_url?: string | null;
          id?: string;
          parent_question_id?: string | null;
          part_label?: string | null;
          question?: string;
          question_image_url?: string | null;
          source_name?: string;
          source_timestamp?: string | null;
          subquestion_order?: number | null;
          syllabus_id?: string;
          title?: string;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'questions_parent_question_id_fkey';
            columns: ['parent_question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'questions_syllabus_id_fkey';
            columns: ['syllabus_id'];
            isOneToOne: false;
            referencedRelation: 'syllabus';
            referencedColumns: ['name'];
          },
        ];
      };
      roles: {
        Row: {
          id: number;
          role_name: string;
        };
        Insert: {
          id?: number;
          role_name: string;
        };
        Update: {
          id?: number;
          role_name?: string;
        };
        Relationships: [];
      };
      stripe_webhook_events: {
        Row: {
          created_at: string | null;
          data: Json | null;
          event_type: string;
          id: string;
          processed: boolean | null;
          stripe_event_id: string;
        };
        Insert: {
          created_at?: string | null;
          data?: Json | null;
          event_type: string;
          id?: string;
          processed?: boolean | null;
          stripe_event_id: string;
        };
        Update: {
          created_at?: string | null;
          data?: Json | null;
          event_type?: string;
          id?: string;
          processed?: boolean | null;
          stripe_event_id?: string;
        };
        Relationships: [];
      };
      subjects: {
        Row: {
          country_code: string | null;
          description: string | null;
          display_name: string;
          name: string;
          subject_name: string;
        };
        Insert: {
          country_code?: string | null;
          description?: string | null;
          display_name: string;
          name: string;
          subject_name: string;
        };
        Update: {
          country_code?: string | null;
          description?: string | null;
          display_name?: string;
          name?: string;
          subject_name?: string;
        };
        Relationships: [];
      };
      syllabus: {
        Row: {
          description: string | null;
          display_name: string;
          level: number;
          name: string;
          parent_id: string | null;
          subject_id: string;
        };
        Insert: {
          description?: string | null;
          display_name: string;
          level: number;
          name: string;
          parent_id?: string | null;
          subject_id: string;
        };
        Update: {
          description?: string | null;
          display_name?: string;
          level?: number;
          name?: string;
          parent_id?: string | null;
          subject_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'syllabus_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'syllabus';
            referencedColumns: ['name'];
          },
          {
            foreignKeyName: 'syllabus_subject_id_fkey';
            columns: ['subject_id'];
            isOneToOne: false;
            referencedRelation: 'subjects';
            referencedColumns: ['name'];
          },
        ];
      };
      user_emails: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          is_primary: boolean | null;
          user_info_id: string;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          is_primary?: boolean | null;
          user_info_id: string;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          is_primary?: boolean | null;
          user_info_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_emails_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'all_users';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'user_emails_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'leaderboard';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'user_emails_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'user_infos';
            referencedColumns: ['id'];
          },
        ];
      };
      user_infos: {
        Row: {
          address: string | null;
          app_user_id: string | null;
          country_code: string | null;
          created_at: string | null;
          date_of_birth: string | null;
          first_name: string | null;
          gender: string | null;
          id: string;
          is_active: boolean | null;
          last_name: string | null;
          level_type: string | null;
          onboarding_completed: boolean | null;
          payment_customer_id: string | null;
          postal_code: string | null;
          profile_picture_url: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          address?: string | null;
          app_user_id?: string | null;
          country_code?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          first_name?: string | null;
          gender?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_name?: string | null;
          level_type?: string | null;
          onboarding_completed?: boolean | null;
          payment_customer_id?: string | null;
          postal_code?: string | null;
          profile_picture_url?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          address?: string | null;
          app_user_id?: string | null;
          country_code?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          first_name?: string | null;
          gender?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_name?: string | null;
          level_type?: string | null;
          onboarding_completed?: boolean | null;
          payment_customer_id?: string | null;
          postal_code?: string | null;
          profile_picture_url?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_infos_app_user_id_fkey';
            columns: ['app_user_id'];
            isOneToOne: true;
            referencedRelation: 'app_users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_infos_level_type_fkey';
            columns: ['level_type'];
            isOneToOne: false;
            referencedRelation: 'level_types';
            referencedColumns: ['level_type'];
          },
        ];
      };
      user_phones: {
        Row: {
          created_at: string | null;
          id: string;
          is_primary: boolean | null;
          phone_number: string;
          user_info_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_primary?: boolean | null;
          phone_number: string;
          user_info_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_primary?: boolean | null;
          phone_number?: string;
          user_info_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_phones_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'all_users';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'user_phones_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'leaderboard';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'user_phones_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'user_infos';
            referencedColumns: ['id'];
          },
        ];
      };
      user_question_answers: {
        Row: {
          answer_boolean: boolean | null;
          answer_draw_file: string | null;
          answer_text: string | null;
          id: string;
          option_id: string;
          option_image: string | null;
          option_text: string | null;
          order_index: number;
          user_question_attempts_id: string;
        };
        Insert: {
          answer_boolean?: boolean | null;
          answer_draw_file?: string | null;
          answer_text?: string | null;
          id?: string;
          option_id: string;
          option_image?: string | null;
          option_text?: string | null;
          order_index: number;
          user_question_attempts_id: string;
        };
        Update: {
          answer_boolean?: boolean | null;
          answer_draw_file?: string | null;
          answer_text?: string | null;
          id?: string;
          option_id?: string;
          option_image?: string | null;
          option_text?: string | null;
          order_index?: number;
          user_question_attempts_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_question_answers_option_id_fkey';
            columns: ['option_id'];
            isOneToOne: false;
            referencedRelation: 'question_options';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_question_answers_user_question_attempts_id_fkey';
            columns: ['user_question_attempts_id'];
            isOneToOne: false;
            referencedRelation: 'user_question_attempts';
            referencedColumns: ['id'];
          },
        ];
      };
      user_question_attempts: {
        Row: {
          attempt_number: number | null;
          duration_seconds: number;
          id: string;
          is_correct: boolean | null;
          question_id: string;
          score: number | null;
          submitted_at: string;
          user_info_id: string;
        };
        Insert: {
          attempt_number?: number | null;
          duration_seconds: number;
          id?: string;
          is_correct?: boolean | null;
          question_id: string;
          score?: number | null;
          submitted_at: string;
          user_info_id: string;
        };
        Update: {
          attempt_number?: number | null;
          duration_seconds?: number;
          id?: string;
          is_correct?: boolean | null;
          question_id?: string;
          score?: number | null;
          submitted_at?: string;
          user_info_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_question_attempts_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_question_attempts_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'all_users';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'user_question_attempts_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'leaderboard';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'user_question_attempts_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'user_infos';
            referencedColumns: ['id'];
          },
        ];
      };
      user_roles: {
        Row: {
          id: string;
          role_id: number;
          user_info_id: string;
        };
        Insert: {
          id?: string;
          role_id: number;
          user_info_id: string;
        };
        Update: {
          id?: string;
          role_id?: number;
          user_info_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_roles_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_roles_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'all_users';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'user_roles_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'leaderboard';
            referencedColumns: ['user_info_id'];
          },
          {
            foreignKeyName: 'user_roles_user_info_id_fkey';
            columns: ['user_info_id'];
            isOneToOne: false;
            referencedRelation: 'user_infos';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      all_users: {
        Row: {
          auth_source: string | null;
          created_at: string | null;
          email: string | null;
          first_name: string | null;
          gender: string | null;
          last_name: string | null;
          level_type: string | null;
          payment_customer_id: string | null;
          prefixed_auth_id: string | null;
          updated_at: string | null;
          user_info_id: string | null;
          username: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_infos_level_type_fkey';
            columns: ['level_type'];
            isOneToOne: false;
            referencedRelation: 'level_types';
            referencedColumns: ['level_type'];
          },
        ];
      };
      leaderboard: {
        Row: {
          avg_time_per_question: number | null;
          first_name: string | null;
          last_name: string | null;
          level_type: string | null;
          rank: number | null;
          total_questions_attempted: number | null;
          total_score: number | null;
          total_time_spent: number | null;
          user_info_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_infos_level_type_fkey';
            columns: ['level_type'];
            isOneToOne: false;
            referencedRelation: 'level_types';
            referencedColumns: ['level_type'];
          },
        ];
      };
    };
    Functions: {
      binary_quantize: {
        Args: { '': string } | { '': unknown };
        Returns: unknown;
      };
      halfvec_avg: {
        Args: { '': number[] };
        Returns: unknown;
      };
      halfvec_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      halfvec_send: {
        Args: { '': unknown };
        Returns: string;
      };
      halfvec_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      hnsw_bit_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnsw_halfvec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnsw_sparsevec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnswhandler: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflat_bit_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflat_halfvec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflathandler: {
        Args: { '': unknown };
        Returns: unknown;
      };
      l2_norm: {
        Args: { '': unknown } | { '': unknown };
        Returns: number;
      };
      l2_normalize: {
        Args: { '': string } | { '': unknown } | { '': unknown };
        Returns: unknown;
      };
      sparsevec_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      sparsevec_send: {
        Args: { '': unknown };
        Returns: string;
      };
      sparsevec_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      vector_avg: {
        Args: { '': number[] };
        Returns: string;
      };
      vector_dims: {
        Args: { '': string } | { '': unknown };
        Returns: number;
      };
      vector_norm: {
        Args: { '': string };
        Returns: number;
      };
      vector_out: {
        Args: { '': string };
        Returns: unknown;
      };
      vector_send: {
        Args: { '': string };
        Returns: string;
      };
      vector_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
    Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
      ? R
      : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
    DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
      DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
        ? R
        : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I;
  }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U;
  }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema['Enums']
  | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema['CompositeTypes']
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
