ALTER TABLE "public"."point" ADD COLUMN "visible" boolean not null DEFAULT false;

UPDATE "point"
SET visible=true
WHERE visible=false;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_points_overview()
 RETURNS TABLE(point_id uuid, point_name text, current_health smallint, max_health smallint, current_faction_id uuid, current_faction_name text, current_claim_duration interval, total_claims_count bigint)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$SELECT
        p.id as point_id,
        p.name as point_name,
        p.health as current_health,
        p.max_health,
        p.acquired_by as current_faction_id,
        f.name as current_faction_name,
        CASE
            WHEN p.acquired_by IS NOT NULL THEN
                NOW() - (
                    SELECT MAX(pta.created_at)
                    FROM point_tick_archive pta
                    WHERE pta.point_id = p.id
                    AND pta.acquired_by = p.acquired_by
                )
            ELSE NULL
        END as current_claim_duration,
        (
            SELECT COUNT(DISTINCT pta.acquired_by)
            FROM point_tick_archive pta
            WHERE pta.point_id = p.id
            AND pta.acquired_by IS NOT NULL
        ) as total_claims_count
    FROM point p
    LEFT JOIN faction f ON p.acquired_by = f.id
    WHERE p.type = 'claimable' AND p.visible = true
    ORDER BY p.name;$function$
;
