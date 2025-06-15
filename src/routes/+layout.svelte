<script lang="ts">
	import '../app.css';
	import { Button } from "$lib/components/ui/button";
	import { Home, Settings, Users, FileText, LogOut } from "@lucide/svelte";
	import { Toaster } from "$lib/components/ui/sonner/index.js";
	
	let { children } = $props();

	const navItems = [
		{ href: '/', label: '通用', icon: Home },
		{ href: '/flows/outstock-detail', label: '长城出库单', icon: Users },
		{ href: '/flows/extract-customer-po', label: '客户采购单转 Excel' },
		{ href: '/flows/test-file-queue', label: '测试文件队列' },
		{ href: '/settings', label: '设置', icon: Settings },
	];
</script>

<div class="flex h-screen bg-background">
	<!-- Sidebar -->
	<aside class="w-48 border-r bg-card">
		<div class="flex h-16 items-center border-b px-6">
			<h1 class="text-lg font-semibold">吉利通工具箱</h1>
		</div>
		<nav class="space-y-1 p-1">
			{#each navItems as item}
				<Button
					variant="ghost"
					class="w-full justify-start gap-2"
					href={item.href}
				>
					{#if item.icon}
						<item.icon class="h-4 w-4" />
					{/if}
					{item.label}
				</Button>
			{/each}
			<div class="pt-4">
				<Button
					variant="ghost"
					class="w-full justify-start gap-2 text-destructive"
					href="/login"
				>
					<LogOut class="h-4 w-4" />
					Logout
				</Button>
			</div>
		</nav>
	</aside>

	<main class="flex-1 overflow-auto p-5 container max-w-5xl mx-auto">
		{@render children()}
	</main>
	<Toaster position="bottom-center" richColors expand={true} />
</div>
