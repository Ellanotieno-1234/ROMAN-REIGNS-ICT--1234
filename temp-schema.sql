

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."analysis_results" (
    "id" integer NOT NULL,
    "total_students" integer NOT NULL,
    "attendance_days" integer NOT NULL,
    "chart_data" "bytea",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "chart" "text"
);


ALTER TABLE "public"."analysis_results" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."analysis_results_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."analysis_results_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."analysis_results_id_seq" OWNED BY "public"."analysis_results"."id";



CREATE TABLE IF NOT EXISTS "public"."app_users" (
    "id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "email" "text" NOT NULL,
    "password" "text",
    "role" "text" DEFAULT 'Student'::"text" NOT NULL,
    CONSTRAINT "app_users_role_check" CHECK (("role" = ANY (ARRAY['Student'::"text", 'Instructor'::"text", 'Admin'::"text"])))
);


ALTER TABLE "public"."app_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attendance_data" (
    "id" integer NOT NULL,
    "student_name" "text" NOT NULL,
    "attendance_days" integer NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."attendance_data" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."attendance_data_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."attendance_data_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."attendance_data_id_seq" OWNED BY "public"."attendance_data"."id";



CREATE TABLE IF NOT EXISTS "public"."security_settings" (
    "id" integer NOT NULL,
    "password_complexity" "jsonb" NOT NULL,
    "session_settings" "jsonb" NOT NULL,
    "ip_restrictions" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."security_settings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."security_settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."security_settings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."security_settings_id_seq" OWNED BY "public"."security_settings"."id";



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'admin'::"text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."analysis_results" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."analysis_results_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."attendance_data" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."attendance_data_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."security_settings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."security_settings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."analysis_results"
    ADD CONSTRAINT "analysis_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_users"
    ADD CONSTRAINT "app_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendance_data"
    ADD CONSTRAINT "attendance_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_settings"
    ADD CONSTRAINT "security_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "update_security_settings_updated_at" BEFORE UPDATE ON "public"."security_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."app_users"
    ADD CONSTRAINT "app_users_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin access to analysis_results" ON "public"."analysis_results" TO "authenticated" USING ((CURRENT_USER = 'admin'::"name")) WITH CHECK ((CURRENT_USER = 'admin'::"name"));



CREATE POLICY "Allow insert for authenticated users" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Public users can delete their own data" ON "public"."app_users" FOR DELETE USING (("auth"."uid"() = "id"));



CREATE POLICY "Public users can insert their own data" ON "public"."app_users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Public users can update their own data" ON "public"."app_users" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Public users can view their own data" ON "public"."app_users" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."analysis_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attendance_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."analysis_results" TO "anon";
GRANT ALL ON TABLE "public"."analysis_results" TO "authenticated";
GRANT ALL ON TABLE "public"."analysis_results" TO "service_role";



GRANT ALL ON SEQUENCE "public"."analysis_results_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."analysis_results_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."analysis_results_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."app_users" TO "anon";
GRANT ALL ON TABLE "public"."app_users" TO "authenticated";
GRANT ALL ON TABLE "public"."app_users" TO "service_role";



GRANT ALL ON TABLE "public"."attendance_data" TO "anon";
GRANT ALL ON TABLE "public"."attendance_data" TO "authenticated";
GRANT ALL ON TABLE "public"."attendance_data" TO "service_role";



GRANT ALL ON SEQUENCE "public"."attendance_data_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."attendance_data_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."attendance_data_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."security_settings" TO "anon";
GRANT ALL ON TABLE "public"."security_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."security_settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."security_settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."security_settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."security_settings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
