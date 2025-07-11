
<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/app-sidebar.svelte";
   
	let { children } = $props();
	import '../app.css';
	import { Toaster } from "$lib/components/ui/sonner/index.js";
	import { page } from '$app/state';
	import { useGlobalShortcut } from "$lib/hooks/useGlobalShortcut";
	import { authState } from "$lib/helpers/auth.svelte";
	import { goto } from "$app/navigation";


	const isLoginPage = $derived(page.url.pathname === '/login');

	$effect(() => {
		useGlobalShortcut(!isLoginPage);
	});

	// If not authenticated, redirect to login page
	$effect(() => {
		if (!authState.isAuthenticated && !isLoginPage) {
			goto('/login?from=' + page.url.pathname);
		}
	});

</script>

   
<Sidebar.Provider style="--sidebar-width: 12rem">
	{#if authState.isAuthenticated }
		<AppSidebar />
	{/if}
	<main class="p-5 container max-w-5xl mx-auto">
		{@render children?.()}
	</main>
</Sidebar.Provider>

<Toaster position="bottom-center" richColors expand={true} />
