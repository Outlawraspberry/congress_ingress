INSERT INTO
    public.game (id, state)
VALUES
    (1, 'paused'::"game-state");

INSERT INTO
    public.faction (name)
VALUES
    ('Faction A'),
    ('Faction B');

INSERT INTO
    public.point (max_health, name, type)
VALUES
  (255, 'Point A', 'claimable'::"point_type"),
  (255, 'Point B', 'claimable'::"point_type"),
  (255, 'Point D', 'mini_game'::"point_type"),
  (255, 'Point C', 'not_claimable'::"point_type");
