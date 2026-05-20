-- =====================================================
-- SECURITY FIX: Prevent role/approval/active self-modification
-- =====================================================
-- VULNERABILITY: Users can UPDATE their own profile row including
-- role, is_approved, is_active columns — enabling self-escalation to admin.
--
-- FIX: Add a trigger that prevents users from changing their own
-- role, is_approved, or is_active fields. Only admins (via admin client)
-- can modify these fields.
-- =====================================================

CREATE OR REPLACE FUNCTION prevent_self_privilege_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow if no auth context (service role / admin client)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- If the user is updating their own row, block privilege field changes
  IF NEW.id = auth.uid() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Cannot change own role';
    END IF;
    IF NEW.is_approved IS DISTINCT FROM OLD.is_approved THEN
      RAISE EXCEPTION 'Cannot change own approval status';
    END IF;
    IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
      RAISE EXCEPTION 'Cannot change own active status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_self_privilege_escalation ON public.profiles;

CREATE TRIGGER prevent_self_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_privilege_change();
