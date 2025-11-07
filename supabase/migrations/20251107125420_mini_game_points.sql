ALTER TYPE public.point_type ADD VALUE IF NOT EXISTS 'mini_game';

ALTER TABLE public.user_game_data ADD COLUMN action_points integer NOT NULL DEFAULT 0;
