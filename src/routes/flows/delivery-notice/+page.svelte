<script lang="ts">
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import {FileItem} from "$lib/components/FileItem.svelte";
    import FileQueue from "$lib/components/FileQueue.svelte";
    import { IS_DEV} from "$lib/apis/api";

    let outstockNosText = $state('');
    let rows = $state(3);

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
        for(const outstock_no of outstockNos) {
            const fileItem = new FileItem({outstock_no, __TITLE: `${outstock_no}`}, []);
            // The FileQueue component will handle the queue management
            window.dispatchEvent(new CustomEvent('addFile', {detail: fileItem}));
        }
        if( !IS_DEV ) {
            outstockNosText = ''
        }
    }
</script>

<h1 class="text-3xl font-semibold text-center mb-5">发货(出库)通知</h1>
<Textarea 
    class="w-full"
    placeholder="输入发货通知单号"
    rows={rows}
    autocapitalize="off"
    autocomplete="off"
    bind:value={outstockNosText}
    oninput={handleInput}
/>
<Button class="w-full mt-2" onclick={onSubmit}>确定</Button>

<div class="mt-5">
    <FileQueue workflowAPI={'/flows/delivery_notice'}/>
</div>

