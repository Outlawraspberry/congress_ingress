drop policy "Enable read access for authenticated users" on "public"."point";

alter table "public"."user_game_data" alter column "faction_id" set not null;

create policy "Insert by service role"
on "public"."actions"
as permissive
for insert
to service_role
with check (true);


create policy "allow service role to read all"
on "public"."actions"
as permissive
for select
to service_role
using (true);


create policy "Enable read access for all users"
on "public"."point"
as permissive
for select
to authenticated, service_role
using (true);


create policy "Enable users to view their own data only"
on "public"."user_game_data"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable users to view their own data only"
on "public"."user_role"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



