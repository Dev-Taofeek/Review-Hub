-- =====================================================
-- ReviewHub Platform - Full Reset & Setup
-- Run this once in Supabase SQL Editor
-- =====================================================

-- -----------------------------------------------
-- 1. DROP EVERYTHING
-- -----------------------------------------------

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_review_change ON reviews;
DROP TRIGGER IF EXISTS on_vote_change ON review_votes;
DROP TRIGGER IF EXISTS on_review_count_change ON reviews;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_rating() CASCADE;
DROP FUNCTION IF EXISTS public.update_helpful_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_review_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.generate_slug(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_moderator_or_admin() CASCADE;

-- Drop tables (in dependency order)
DROP TABLE IF EXISTS moderation_logs CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS review_votes CASCADE;
DROP TABLE IF EXISTS review_images CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop types
DROP TYPE IF EXISTS moderation_action CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS report_reason CASCADE;
DROP TYPE IF EXISTS review_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- -----------------------------------------------
-- 2. EXTENSIONS
-- -----------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -----------------------------------------------
-- 3. ENUMS
-- -----------------------------------------------

CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE review_status AS ENUM ('pending', 'published', 'flagged', 'rejected');
CREATE TYPE report_reason AS ENUM ('spam', 'abuse', 'hate_speech', 'fake_review', 'misleading_content', 'offensive_language', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE moderation_action AS ENUM ('approved', 'rejected', 'flagged', 'deleted', 'restored');

-- -----------------------------------------------
-- 4. TABLES
-- -----------------------------------------------

CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE,
  full_name    TEXT,
  avatar_url   TEXT,
  bio          TEXT,
  role         user_role NOT NULL DEFAULT 'user',
  is_banned    BOOLEAN NOT NULL DEFAULT FALSE,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  description    TEXT NOT NULL,
  brand          TEXT NOT NULL,
  category_id    UUID REFERENCES categories(id) ON DELETE SET NULL,
  price          NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_reviews  INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT products_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  public_id   TEXT NOT NULL,
  alt_text    TEXT,
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id           UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating               SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title                TEXT NOT NULL,
  body                 TEXT NOT NULL,
  pros                 TEXT[],
  cons                 TEXT[],
  status               review_status NOT NULL DEFAULT 'pending',
  spam_score           SMALLINT NOT NULL DEFAULT 0,
  helpful_count        INTEGER NOT NULL DEFAULT 0,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id),
  CONSTRAINT reviews_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT reviews_body_not_empty CHECK (length(trim(body)) > 0)
);

CREATE TABLE review_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id  UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  public_id  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE review_votes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id  UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (review_id, user_id)
);

CREATE TABLE reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason      report_reason NOT NULL,
  message     TEXT,
  status      report_status NOT NULL DEFAULT 'pending',
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (review_id, reporter_id),
  CONSTRAINT reports_message_length CHECK (message IS NULL OR length(message) <= 1000)
);

CREATE TABLE moderation_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id       UUID REFERENCES reviews(id) ON DELETE SET NULL,
  moderator_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action          moderation_action NOT NULL,
  reason          TEXT,
  previous_status review_status,
  new_status      review_status,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------
-- 5. INDEXES
-- -----------------------------------------------

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_rating ON products(average_rating DESC);
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_fts ON products USING gin(to_tsvector('english', name || ' ' || description || ' ' || brand));
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX idx_reviews_product_status ON reviews(product_id, status);
CREATE INDEX idx_reviews_spam_score ON reviews(spam_score DESC);
CREATE INDEX idx_review_images_review ON review_images(review_id);
CREATE INDEX idx_review_votes_review ON review_votes(review_id);
CREATE INDEX idx_review_votes_user ON review_votes(user_id);
CREATE INDEX idx_reports_review ON reports(review_id);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_moderation_logs_review ON moderation_logs(review_id);
CREATE INDEX idx_moderation_logs_moderator ON moderation_logs(moderator_id);
CREATE INDEX idx_moderation_logs_created ON moderation_logs(created_at DESC);

-- -----------------------------------------------
-- 6. FUNCTIONS & TRIGGERS
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC(3,2);
  total      INTEGER;
BEGIN
  SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0), COUNT(*)
  INTO avg_rating, total
  FROM reviews
  WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND status = 'published';

  UPDATE products
  SET average_rating = avg_rating, total_reviews = total, updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

CREATE OR REPLACE FUNCTION public.update_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reviews
  SET helpful_count = (
    SELECT COUNT(*) FROM review_votes
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) AND is_helpful = TRUE
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_helpful_count();

CREATE OR REPLACE FUNCTION public.update_user_review_count()
RETURNS TRIGGER AS $$
DECLARE uid UUID;
BEGIN
  uid := COALESCE(NEW.user_id, OLD.user_id);
  UPDATE profiles
  SET review_count = (SELECT COUNT(*) FROM reviews WHERE user_id = uid AND status != 'rejected')
  WHERE id = uid;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_review_count_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_user_review_count();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.generate_slug(input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(trim(input), '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- -----------------------------------------------
-- 7. ROW LEVEL SECURITY
-- -----------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'));
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Profiles
CREATE POLICY "profiles_public_read"    ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_self_update"    ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
CREATE POLICY "profiles_admin_update"   ON profiles FOR UPDATE USING (public.is_admin());

-- Categories
CREATE POLICY "categories_public_read"  ON categories FOR SELECT USING (TRUE);
CREATE POLICY "categories_admin_write"  ON categories FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Products
CREATE POLICY "products_public_read"    ON products FOR SELECT
  USING (is_active = TRUE OR public.is_moderator_or_admin());
CREATE POLICY "products_authenticated_insert" ON products FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());
CREATE POLICY "products_admin_update"   ON products FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "products_admin_delete"   ON products FOR DELETE
  USING (public.is_admin());

-- Product images
CREATE POLICY "product_images_public_read" ON product_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM products WHERE id = product_images.product_id AND (is_active = TRUE OR public.is_moderator_or_admin())));
CREATE POLICY "product_images_admin_write" ON product_images FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Reviews
CREATE POLICY "reviews_read"            ON reviews FOR SELECT
  USING (status = 'published' OR user_id = auth.uid() OR public.is_moderator_or_admin());
CREATE POLICY "reviews_insert"          ON reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_banned = TRUE));
CREATE POLICY "reviews_self_update"     ON reviews FOR UPDATE
  USING (user_id = auth.uid() AND status != 'rejected')
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews_moderator_update" ON reviews FOR UPDATE USING (public.is_moderator_or_admin());
CREATE POLICY "reviews_delete"          ON reviews FOR DELETE
  USING (user_id = auth.uid() OR public.is_moderator_or_admin());

-- Review images
CREATE POLICY "review_images_read"      ON review_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM reviews WHERE id = review_images.review_id
    AND (status = 'published' OR user_id = auth.uid() OR public.is_moderator_or_admin())));
CREATE POLICY "review_images_insert"    ON review_images FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM reviews WHERE id = review_images.review_id AND user_id = auth.uid()));
CREATE POLICY "review_images_delete"    ON review_images FOR DELETE
  USING (EXISTS (SELECT 1 FROM reviews WHERE id = review_images.review_id
    AND (user_id = auth.uid() OR public.is_moderator_or_admin())));

-- Review votes
CREATE POLICY "review_votes_read"       ON review_votes FOR SELECT USING (TRUE);
CREATE POLICY "review_votes_insert"     ON review_votes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM reviews WHERE id = review_votes.review_id AND user_id = auth.uid()));
CREATE POLICY "review_votes_update"     ON review_votes FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "review_votes_delete"     ON review_votes FOR DELETE USING (user_id = auth.uid());

-- Reports
CREATE POLICY "reports_read"            ON reports FOR SELECT
  USING (reporter_id = auth.uid() OR public.is_moderator_or_admin());
CREATE POLICY "reports_insert"          ON reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND reporter_id = auth.uid()
    AND NOT EXISTS (SELECT 1 FROM reviews WHERE id = reports.review_id AND user_id = auth.uid()));
CREATE POLICY "reports_moderator_update" ON reports FOR UPDATE USING (public.is_moderator_or_admin());

-- Moderation logs
CREATE POLICY "moderation_logs_read"    ON moderation_logs FOR SELECT USING (public.is_moderator_or_admin());
CREATE POLICY "moderation_logs_insert"  ON moderation_logs FOR INSERT
  WITH CHECK (public.is_moderator_or_admin() AND moderator_id = auth.uid());
