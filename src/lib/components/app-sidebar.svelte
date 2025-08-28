<script lang="ts">
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { openUrl } from '@tauri-apps/plugin-opener';

	import {IS_DEV} from "$lib/apis/api";
	import { Home, Settings, FileSpreadsheet, LogOut, Truck as BillSTOAIcon, ChevronUp, Sheet, TextSearch, FileText as PdfIcon, BugOff, ListChecks as BillArIcon } from "@lucide/svelte";
    import { authState, removeTokens } from "$lib/helpers/auth.svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";


	async function handleLogout() {
		removeTokens();
		await goto('/login');
	}
   

	const navItems = [
		{ href: '/', label: '首页', icon: Home },
		{ href: '/flows/delivery-notice', label: '发货(出库)通知', icon: BillSTOAIcon },
        { href: '/flows/bill-ar', label: '应收对账单生成', icon: BillArIcon },
		{ href: '/flows/extract-customer-po', label: '客户采购单转 Excel', icon: FileSpreadsheet },
        { href: 'https://pdf.i.17ch.cn', label: 'PDF 助手', icon: PdfIcon },
        { href: '/flows/fill-columns', label: 'Excel 关联数据查询', icon: Sheet },
        { href: '/flows/query-doc-type', label: '单号查类型', icon: TextSearch },
	].concat(IS_DEV ? { href: '/flows/test-file-queue', label: '测试文件队列', icon: BugOff } : []);

    function isActive(href: string) {
        return page.url.pathname === href;
    }
   
</script>
   
<Sidebar.Root collapsible="icon">
    <Sidebar.Header class="relative">
        <Sidebar.Menu>
            <Sidebar.MenuItem>
                <Sidebar.MenuButton>
                    <span>吉利通助手</span>
                </Sidebar.MenuButton>
            </Sidebar.MenuItem>
        </Sidebar.Menu>
        <Sidebar.Trigger class="absolute -right-10" />
    </Sidebar.Header>
    <Sidebar.Separator />
    <Sidebar.Content>
        <Sidebar.Group>
        <Sidebar.GroupContent>
            <Sidebar.Menu>
            {#each navItems as item (item.label)}
                <Sidebar.MenuItem>
                <Sidebar.MenuButton isActive={isActive(item.href)} class="cursor-pointer" >
                    {#snippet child({ props })}
                    {#if !item.href.startsWith('http')}
                        <a href={item.href} {...props}>
                            {#if item.icon}
                                <item.icon />
                            {/if}
                            <span>{item.label}</span>
                        </a>
                    {:else}
                        <button onclick={() => openUrl(item.href)} {...props}>
                                {#if item.icon}
                                <item.icon />
                            {/if}
                            <span>{item.label}</span>
                        </button>
                    {/if}
                    {/snippet}
                </Sidebar.MenuButton>
                </Sidebar.MenuItem>
            {/each}
            </Sidebar.Menu>
        </Sidebar.GroupContent>
        </Sidebar.Group>
    </Sidebar.Content>
    <Sidebar.Footer><Sidebar.Menu>
        <Sidebar.MenuItem>
            <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                {#snippet child({ props })}
                <Sidebar.MenuButton
                    {...props}
                    class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    {authState.userInfo?.name}{authState.becomeUser ? `(${authState.becomeUser})` : ''}
                    <ChevronUp class="ml-auto" />
                </Sidebar.MenuButton>
                {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
                side="top"
                class="w-(--bits-dropdown-menu-anchor-width)"
            >
                <DropdownMenu.Item onclick={() => goto('/settings')}>
                    <Settings />
                    <span>设置</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item onclick={handleLogout}>
                    <LogOut />
                    <span>退出</span>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
            </DropdownMenu.Root>
        </Sidebar.MenuItem>
        </Sidebar.Menu>
    </Sidebar.Footer>
</Sidebar.Root>
