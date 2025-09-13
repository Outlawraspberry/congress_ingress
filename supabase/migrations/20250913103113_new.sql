drop policy "Enable read only for admins" on "public"."point_mapping";

create policy "Enable read only for admins"
on "public"."point_mapping"
as permissive
for select
to authenticated
using (true);



