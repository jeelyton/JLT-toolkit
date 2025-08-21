<script lang="ts">
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import {FileItem} from "$lib/components/FileItem.svelte";
    import FileQueue from "$lib/components/FileQueue.svelte";
    import { IS_DEV} from "$lib/apis/api";
    import { page } from '$app/state';

    const pageId = page.url.pathname
    let tabApi = '/flows/accounts-receivable';

    let billNosText = $state(IS_DEV ? localStorage.getItem(`${pageId}:input-value`) || '' : '');
    let rows = $state(3);
    let tab = $state(localStorage.getItem(`${pageId}:selected-tab`) || '1');

    function formatText(text: string) {
        // remove time from chat history
        // remove non-alphanumeric characters
        const cleanText = text.toUpperCase().replace(/\d{2}:\d{2}:\d{2}/g, '')// .replace(/[^A-Z0-9-]/g, '');
        const chunks = cleanText.split(/(?=[A-Z]{2}-)/g);
        rows = chunks.length;
        return  chunks.join('\n');
    }

    function handleInput(event: Event) {
        const textarea = event.target as HTMLTextAreaElement;
        let caretPos = textarea.selectionStart;
        const isCaretAtEnd = caretPos === billNosText.length;
        billNosText = formatText(billNosText)
        if(isCaretAtEnd) {
            caretPos = billNosText.length;
        }
        // Restore caret position in the next tick
        setTimeout(() => {
            textarea.setSelectionRange(caretPos, caretPos);
        }, 0);
    }

    const billNos = $derived(billNosText.split('\n').filter(Boolean));

    function onSubmit() {
        localStorage.setItem(`${pageId}:selected-tab`, tab);
        if(tab === '1') {
            for(const bill_no of billNos) {
                const fileItem = new FileItem({bill_no, __TITLE: `${bill_no}`}, []);
                // The FileQueue component will handle the queue management
                window.dispatchEvent(new CustomEvent('addFile', {detail: fileItem}));
            }
        // } else if(tab === '2') {
        //     let title = outstockNos.length > 3 ? outstockNos.slice(0, 2).join(',') + `, 等${(outstockNos.length)}个订单` : outstockNos.join(',');
        //     const fileItem = new FileItem({outstock_nos: outstockNos, __TITLE: title}, []);
        //     window.dispatchEvent(new CustomEvent('addFile', {detail: fileItem}));
        }
        if(IS_DEV) {
            localStorage.setItem(`${pageId}:input-value`, billNosText);
        } else {
            billNosText = ''
        }
    }
</script>

<h1 class="text-3xl font-semibold text-center mb-5">应收对账单生成</h1>
<div class="space-y-4">
    <Textarea 
        class="w-full font-mono"
        placeholder="输入应收单号"
        rows={rows}
        autocapitalize="off"
        autocomplete="off"
        bind:value={billNosText}
        oninput={handleInput}
    />
    <Button class="w-full" onclick={onSubmit}>确定</Button>
    
    <div class="mt-5">
        <FileQueue workflowAPI={tabApi}/>
    </div>
</div>


