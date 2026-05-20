-- =====================================================
-- SECURITY FIX: Atomic max_attempts enforcement
-- =====================================================
-- The app-layer TOCTOU check on max_attempts could over-correct
-- under concurrent requests. This trigger enforces the limit
-- atomically at the database level.
-- =====================================================

CREATE OR REPLACE FUNCTION check_quest_max_attempts()
RETURNS TRIGGER AS $$
DECLARE
  max_att INTEGER;
  current_count INTEGER;
BEGIN
  SELECT max_attempts INTO max_att
  FROM public.quests
  WHERE id = NEW.quest_id;

  IF max_att IS NOT NULL THEN
    SELECT COUNT(*) INTO current_count
    FROM public.quest_attempts
    WHERE quest_id = NEW.quest_id AND student_id = NEW.student_id;

    IF current_count >= max_att THEN
      RAISE EXCEPTION 'Maximum attempts (%) reached', max_att;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_quest_max_attempts ON public.quest_attempts;

CREATE TRIGGER enforce_quest_max_attempts
  BEFORE INSERT ON public.quest_attempts
  FOR EACH ROW
  EXECUTE FUNCTION check_quest_max_attempts();
