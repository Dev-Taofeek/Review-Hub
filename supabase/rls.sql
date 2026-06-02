-- =====================================================
-- ReviewHub Platform - Row Level Security Policies
-- =====================================================

-- Drop existing policies to make this script idempotent
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Helper Functions
-- =====================================================

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =====================================================
-- PROFILES Policies
-- =====================================================

CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "profiles_self_update"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Prevent users from changing their own role
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_admin_update"
  ON profiles FOR UPDATE
  USING (public.is_admin());

-- =====================================================
-- CATEGORIES Policies
-- =====================================================

CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (TRUE);

CREATE POLICY "categories_admin_write"
  ON categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- PRODUCTS Policies
-- =====================================================

CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (is_active = TRUE OR public.is_moderator_or_admin());

CREATE POLICY "products_admin_write"
  ON products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_update"
  ON products FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "products_admin_delete"
  ON products FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- PRODUCT IMAGES Policies
-- =====================================================

CREATE POLICY "product_images_public_read"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_images.product_id
        AND (is_active = TRUE OR public.is_moderator_or_admin())
    )
  );

CREATE POLICY "product_images_admin_write"
  ON product_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================
-- REVIEWS Policies
-- =====================================================

CREATE POLICY "reviews_public_read_published"
  ON reviews FOR SELECT
  USING (
    status = 'published'
    OR user_id = auth.uid()
    OR public.is_moderator_or_admin()
  );

CREATE POLICY "reviews_authenticated_insert"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_banned = TRUE
    )
  );

CREATE POLICY "reviews_self_update"
  ON reviews FOR UPDATE
  USING (
    user_id = auth.uid()
    AND status NOT IN ('rejected')
  )
  WITH CHECK (
    user_id = auth.uid()
    -- Users can only update content fields, not status
  );

CREATE POLICY "reviews_moderator_update"
  ON reviews FOR UPDATE
  USING (public.is_moderator_or_admin());

CREATE POLICY "reviews_self_delete"
  ON reviews FOR DELETE
  USING (user_id = auth.uid() OR public.is_moderator_or_admin());

-- =====================================================
-- REVIEW IMAGES Policies
-- =====================================================

CREATE POLICY "review_images_read"
  ON review_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reviews
      WHERE id = review_images.review_id
        AND (status = 'published' OR user_id = auth.uid() OR public.is_moderator_or_admin())
    )
  );

CREATE POLICY "review_images_owner_write"
  ON review_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews
      WHERE id = review_images.review_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "review_images_owner_delete"
  ON review_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM reviews
      WHERE id = review_images.review_id
        AND (user_id = auth.uid() OR public.is_moderator_or_admin())
    )
  );

-- =====================================================
-- REVIEW VOTES Policies
-- =====================================================

CREATE POLICY "review_votes_public_read"
  ON review_votes FOR SELECT
  USING (TRUE);

CREATE POLICY "review_votes_authenticated_insert"
  ON review_votes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM reviews WHERE id = review_votes.review_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "review_votes_self_update"
  ON review_votes FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "review_votes_self_delete"
  ON review_votes FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- REPORTS Policies
-- =====================================================

CREATE POLICY "reports_reporter_read"
  ON reports FOR SELECT
  USING (
    reporter_id = auth.uid()
    OR public.is_moderator_or_admin()
  );

CREATE POLICY "reports_authenticated_insert"
  ON reports FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND reporter_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM reviews WHERE id = reports.review_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "reports_moderator_update"
  ON reports FOR UPDATE
  USING (public.is_moderator_or_admin());

-- =====================================================
-- MODERATION LOGS Policies
-- =====================================================

CREATE POLICY "moderation_logs_moderator_read"
  ON moderation_logs FOR SELECT
  USING (public.is_moderator_or_admin());

CREATE POLICY "moderation_logs_moderator_insert"
  ON moderation_logs FOR INSERT
  WITH CHECK (
    public.is_moderator_or_admin()
    AND moderator_id = auth.uid()
  );
