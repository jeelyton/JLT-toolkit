<script lang="ts">
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import {FileItem} from "$lib/components/FileItem.svelte";
    import FileQueue from "$lib/components/FileQueue.svelte";
    import { IS_DEV} from "$lib/apis/api";

    let outstockNosText = $state('');
    let rows = $state(3);
    let tab = $state(localStorage.getItem('delivery-notice:selected-tab') || '1');
    let tabApi = $derived(tab === '1' ? '/flows/delivery_notice' : '/flows/delivery_notice_merge');

    function formatText(text: string) {
        const cleanText = text.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        const chunks = cleanText.split(/(?=[A-Z]{2}-)/g);
        rows = chunks.length;
        return  chunks.join('\n');
    }

    function handleInput(event: Event) {
        const textarea = event.target as HTMLTextAreaElement;
        let caretPos = textarea.selectionStart;
        const isCaretAtEnd = caretPos === outstockNosText.length;
        outstockNosText = formatText(outstockNosText)
        if(isCaretAtEnd) {
            caretPos = outstockNosText.length;
        }
        // Restore caret position in the next tick
        setTimeout(() => {
            textarea.setSelectionRange(caretPos, caretPos);
        }, 0);
    }

    const outstockNos = $derived(outstockNosText.split('\n').filter(Boolean));

    function onSubmit() {
        localStorage.setItem('delivery-notice:selected-tab', tab);
        if(tab === '1') {
            for(const outstock_no of outstockNos) {
                const fileItem = new FileItem({outstock_no, __TITLE: `${outstock_no}`}, []);
                // The FileQueue component will handle the queue management
                window.dispatchEvent(new CustomEvent('addFile', {detail: fileItem}));
            }
        } else if(tab === '2') {
            let title = outstockNos.length > 3 ? outstockNos.slice(0, 2).join(',') + `, 等${(outstockNos.length)}个订单` : outstockNos.join(',');
            const fileItem = new FileItem({outstock_nos: outstockNos, __TITLE: title}, []);
            window.dispatchEvent(new CustomEvent('addFile', {detail: fileItem}));
        }
        if( !IS_DEV ) {
            outstockNosText = ''
        }
    }
</script>

<h1 class="text-3xl font-semibold text-center mb-5">发货(出库)通知</h1>
<div class="space-y-4">
    <Tabs.Root bind:value={tab}>
        <Tabs.List class="w-full">
            <Tabs.Trigger value="1">单订单</Tabs.Trigger>
            <Tabs.Trigger value="2">合并数据处理</Tabs.Trigger>
        </Tabs.List>
        </Tabs.Root>
        <Textarea 
          class="w-full"
          placeholder="输入发货通知单号"
          rows={rows}
          autocapitalize="off"
          autocomplete="off"
          bind:value={outstockNosText}
          oninput={handleInput}
        />
        <Button class="w-full" onclick={onSubmit}>确定</Button>
        
        <div class="mt-5">
            <FileQueue workflowAPI={tabApi}/>
        </div>
</div>


