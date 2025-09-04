drop policy "Enable read access for all users" on "public"."faction";

alter table "public"."actions" add column "puzzle" uuid not null;

CREATE UNIQUE INDEX actions_puzzle_key ON public.actions USING btree (puzzle);

alter table "public"."actions" add constraint "actions_puzzle_fkey" FOREIGN KEY (puzzle) REFERENCES puzzle(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."actions" validate constraint "actions_puzzle_fkey";

alter table "public"."actions" add constraint "actions_puzzle_key" UNIQUE using index "actions_puzzle_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.user (id, name)
  values (new.id, new.raw_user_meta_data->>'display_name');

  insert into public.user_game_data (user_id, faction_id)
  values (new.id, (new.raw_user_meta_data->>'faction_id')::uuid);

  insert into public.user_role (user_id, role)
  values (new.id, 'user');

  return new; 
end;
$function$
;

create policy "Enable read access for all users and anon users"
on "public"."faction"
as permissive
for select
to authenticated, service_role, anon
using (true);



