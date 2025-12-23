-- =====================================================
-- CYBERSECURITY BADGES SEED DATA
-- =====================================================
-- Run this after creating the main schema
-- This seeds 15 achievement badges across 4 tiers

-- BRONZE TIER - Entry Level Badges
INSERT INTO public.badges (name, description, badge_tier, requirement_type, requirement_criteria, points_reward) VALUES
('First Blood', 'Complete your first cybersecurity course', 'bronze', 'course_completion', '{"min_courses": 1}', 50),
('Script Kiddie', 'Pass your first 5 quests', 'bronze', 'quest_score', '{"min_quests": 5, "min_score": 70}', 75),
('Bug Spotter', 'Master your first skill to Intermediate level', 'bronze', 'skill_mastery', '{"min_skills": 1, "min_level": "intermediate"}', 100),
('Dedicated Learner', 'Maintain a 7-day learning streak', 'bronze', 'consecutive_days', '{"min_days": 7}', 100),
('Point Collector', 'Earn your first 500 points', 'bronze', 'total_points', '{"min_points": 500}', 50);

-- SILVER TIER - Intermediate Badges
INSERT INTO public.badges (name, description, badge_tier, requirement_type, requirement_criteria, points_reward) VALUES
('Exploit Developer', 'Master 3 skills to Advanced level', 'silver', 'skill_mastery', '{"min_skills": 3, "min_level": "advanced"}', 200),
('Penetration Tester', 'Complete 5 cybersecurity courses', 'silver', 'course_completion', '{"min_courses": 5}', 250),
('CTF Warrior', 'Score 95% or higher on 10 quests', 'silver', 'quest_score', '{"min_quests": 10, "min_score": 95}', 300),
('Persistent Hacker', 'Maintain a 30-day learning streak', 'silver', 'consecutive_days', '{"min_days": 30}', 300),
('Rising Star', 'Earn 2000 total points', 'silver', 'total_points', '{"min_points": 2000}', 150);

-- GOLD TIER - Advanced Badges
INSERT INTO public.badges (name, description, badge_tier, requirement_type, requirement_criteria, points_reward) VALUES
('Security Researcher', 'Master 5 skills to Expert level', 'gold', 'skill_mastery', '{"min_skills": 5, "min_level": "expert"}', 500),
('Bug Bounty Hunter', 'Complete all Web Application Security courses', 'gold', 'course_completion', '{"min_courses": 10, "category": "Web Application Security"}', 600),
('Hacking Legend', 'Reach Top 10 on the leaderboard', 'gold', 'total_points', '{"min_rank": 10}', 750),
('Century Club', 'Maintain a 100-day learning streak', 'gold', 'consecutive_days', '{"min_days": 100}', 1000);

-- PLATINUM TIER - Elite Badge
INSERT INTO public.badges (name, description, badge_tier, requirement_type, requirement_criteria, points_reward) VALUES
('Elite Hacker', 'Reach #1 on the leaderboard', 'platinum', 'total_points', '{"min_rank": 1}', 2000);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully seeded 15 cybersecurity badges!';
    RAISE NOTICE 'Tiers: Bronze (5), Silver (5), Gold (4), Platinum (1)';
    RAISE NOTICE 'Total points available from badges: 6025';
END $$;
