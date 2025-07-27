drop policy "Enable read access for all users" on "public"."point";

create policy "Enable read access for all users"
on "public"."point"
as permissive
for select
to public
using (true);



