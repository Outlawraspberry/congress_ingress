<script lang="ts">
	import { supabase } from "$lib/supabase/db.svelte";
	import { game } from "$lib/supabase/game/game.svelte";
	import { Button } from "flowbite-svelte";

    async function onClick() {
        if (game.game?.state === "paused"){
        const {data, error} = await supabase.functions.invoke("run-game-tick");
        if (error) {
            throw error;
        }}
    }
</script>

<Button onclick={onClick} disabled={game.game?.state === "playing"}>Run Tick</Button>