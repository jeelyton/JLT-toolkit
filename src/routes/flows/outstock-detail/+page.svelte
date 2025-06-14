<script lang="ts">
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";
    import Button from "$lib/components/ui/button/button.svelte";

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
        const caretPos = textarea.selectionStart;
        outstockNosText = formatText(outstockNosText)
        
        // Restore caret position in the next tick
        setTimeout(() => {
            textarea.setSelectionRange(caretPos, caretPos);
        }, 0);
    }

    const outstockNos = $derived(outstockNosText.split('\n').filter(Boolean));
</script>

<h1 class="text-3xl font-semibold text-center mb-5">长城出库单</h1>
<Textarea 
    class="w-full p-2 border rounded"
    placeholder="输入出库单号"
    rows={rows}
    autocapitalize="off"
    autocomplete="off"
    bind:value={outstockNosText}
    oninput={handleInput}
/>
<Button class="w-full mt-2">查询</Button>

