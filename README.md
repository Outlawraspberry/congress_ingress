# Congress Ingress

## Initial Setup

### Cron Jobs

To run the cron jobs correctly, you have to update the secrets
`run_game_tick_url` and `service_role_jwt`.

You can do this by using the UI. Go to integrations to the vault extension.
There you can change the secrets.

## Generate new database types

`supabase gen types typescript --local --schema game --schema public > types/database.types.ts`


## Running edge functions locally

When you're local supabase functions is not capable of fetching things from the outside, then use another network.

- `docker networks ls` search for the host network
`supabase start --network-id <host network id>`
`supabase functions serve --network-id <host network id>`
