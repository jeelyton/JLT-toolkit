<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { basename } from "@tauri-apps/api/path";
  import FileQueue from "$lib/components/FileQueue.svelte";
  import {FileItem} from "$lib/components/FileItem.svelte";
  import {N8N_API_URL, uploadFile} from '$lib/apis/api'
  import { toast } from "svelte-sonner";
  import Calendar from "$lib/components/ui/calendar/calendar.svelte";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import {ChevronDownIcon} from "@lucide/svelte";
  import { CalendarDate, today } from "@internationalized/date";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  const id = $props.id();
 
  const timezone = "Asia/Shanghai";
  
  const STORAGE_KEY = 'report-ignoreCustomers';

  let open = $state(false);
  // Default to 1st of previous month
  let calendarValue = $state(today(timezone).subtract({ months: 1 }).set({ day: 1 }));
  let ignoreCustomers = $state(
    typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) ?? '') : ''
  );

  $effect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, ignoreCustomers);
    }
  });
  // Always ensure the day is set to 1st of the month
  $effect(() => {
    if (calendarValue && calendarValue.day !== 1) {
      calendarValue = calendarValue.set({ day: 1 });
    }
  });
  
  function handleValueChange(value: CalendarDate | undefined) {
    if (value) {
      calendarValue = value.set({ day: 1 });
    } else {
      calendarValue = value;
    }
    open = false;
  }

  // Format date as yyyy-MM-dd
  const formattedDate = $derived(
    calendarValue 
      ? calendarValue.toString()
      : ''
  );
  
  // Convert today's date to CalendarDate for maxValue
  const maxValue = $derived(today(timezone));

  function onSubmit() {
    const fileItem = new FileItem({
      startDate: formattedDate,
      ignore_cust_groups: ignoreCustomers.split('\n'),
      __TITLE: formattedDate}, []);
    window.dispatchEvent(new CustomEvent('addFile', {detail: fileItem}));
  }

</script>
  
<h1 class="text-3xl font-semibold text-center mb-5">销售月报生成</h1>
<div class="space-y-4">
<div class="flex gap-3">
  <Label for="{id}-date" class="w-20 text-right">选择月份</Label>
  <Popover.Root bind:open>
    <Popover.Trigger id="{id}-date">
      {#snippet child({ props }: { props: Record<string, any> })}
        <Button
          {...props}
          variant="outline"
          class="w-48 justify-between font-normal"
        >
          {formattedDate || "选择月份"}
          <ChevronDownIcon />
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-auto overflow-hidden p-0" align="start">
      <Calendar
        type="single"
        bind:value={calendarValue}
        captionLayout="dropdown"
        locale="zh-CN"
        onValueChange={handleValueChange}
        maxValue={maxValue}
      />
    </Popover.Content>
  </Popover.Root>
</div>
<div class="flex gap-3">
  <Label class="px-1 w-20">忽略客户</Label>
  <Textarea class="w-full" bind:value={ignoreCustomers} rows={5} placeholder="请输入忽略客户集团名称，每行一个"></Textarea>
</div>

<Button class="w-full border-primary text-primary" variant="outline" onclick={onSubmit}>生成月报</Button>
</div>

<div class="mt-5">
  <FileQueue workflowAPI={`${N8N_API_URL}/sales-monthly`} maxConcurrent={5}/>
</div>
  