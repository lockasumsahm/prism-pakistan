-- OPTIONAL AND UNAPPLIED. Requires a Supabase auth schema. Not connected to the current app.
BEGIN;
CREATE TYPE public.app_role AS ENUM ('citizen', 'first_responder', 'provincial_officer', 'admin');
CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 full_name text CHECK (char_length(full_name) <= 200),
 organization text CHECK (char_length(organization) <= 200),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.user_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 role public.app_role NOT NULL DEFAULT 'citizen', UNIQUE(user_id, role)
);
CREATE TABLE public.saved_places (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
 district_slug text NOT NULL CHECK (char_length(district_slug) BETWEEN 1 AND 100),
 lat double precision NOT NULL CHECK(lat BETWEEN 23.5 AND 37.5),
 lon double precision NOT NULL CHECK(lon BETWEEN 60.5 AND 78),
 alert_level_threshold text NOT NULL DEFAULT 'warning' CHECK(alert_level_threshold IN ('watch','warning','critical')),
 notify_email boolean NOT NULL DEFAULT false,
 notify_push boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.alert_history (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 district_slug text NOT NULL,
 level text NOT NULL CHECK(level IN ('watch','warning','critical')),
 headline text NOT NULL CHECK(char_length(headline) <= 500),
 factors jsonb NOT NULL,
 source_evidence jsonb NOT NULL,
 sent_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_profile_read ON public.profiles FOR SELECT TO authenticated USING ((SELECT auth.uid())=id);
CREATE POLICY own_profile_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid())=id);
CREATE POLICY own_profile_update ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid())=id) WITH CHECK ((SELECT auth.uid())=id);
CREATE POLICY own_roles_read ON public.user_roles FOR SELECT TO authenticated USING ((SELECT auth.uid())=user_id);
-- No client role writes: a caller cannot self-promote.
CREATE POLICY own_places_read ON public.saved_places FOR SELECT TO authenticated USING ((SELECT auth.uid())=user_id);
CREATE POLICY own_places_insert ON public.saved_places FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid())=user_id);
CREATE POLICY own_places_update ON public.saved_places FOR UPDATE TO authenticated USING ((SELECT auth.uid())=user_id) WITH CHECK ((SELECT auth.uid())=user_id);
CREATE POLICY own_places_delete ON public.saved_places FOR DELETE TO authenticated USING ((SELECT auth.uid())=user_id);
REVOKE ALL ON public.alert_history FROM anon, authenticated;
REVOKE INSERT,UPDATE,DELETE ON public.user_roles FROM anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT,INSERT,UPDATE ON public.profiles TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.saved_places TO authenticated;
CREATE FUNCTION public.update_profile_timestamp() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,public AS $$ BEGIN NEW.updated_at=now();RETURN NEW;END; $$;
CREATE TRIGGER set_profile_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_profile_timestamp();
COMMIT;
