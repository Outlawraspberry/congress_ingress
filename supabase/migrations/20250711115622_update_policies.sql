alter table "game"."user" alter column "name" set default ''::text;

CREATE UNIQUE INDEX user_name_key ON game."user" USING btree (name);

alter table "game"."user" add constraint "user_name_check" CHECK ((length(name) < 50)) not valid;

alter table "game"."user" validate constraint "user_name_check";

alter table "game"."user" add constraint "user_name_key" UNIQUE using index "user_name_key";

create policy "Enable read access for all users"
on "game"."fraction"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "game"."game"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "game"."point"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "game"."tick_point"
as permissive
for select
to public
using (true);


create policy "Enable delete for users based on user_id"
on "game"."tick_task"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = created_by));


create policy "Enable insert for users based on user_id"
on "game"."tick_task"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = created_by));


create policy "Enable update for users based on user_id"
on "game"."tick_task"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = created_by));


create policy "Enable insert for users based on user_id"
on "game"."user"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Enable users to view their own data only"
on "game"."user"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));




