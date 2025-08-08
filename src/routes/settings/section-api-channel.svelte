<script lang="ts">
    import * as Select from "$lib/components/ui/select";
    import { Label } from "$lib/components/ui/label";
    import { FLOW_API_URL } from "$lib/apis/api";
    let apiChannel = $state(localStorage.apiChannel || '');
    const channelList = {
        '': '默认',
        dev: '开发环境',
        prod: '生产环境'
    }
    const channelUrl = {
        '': '',
        dev: 'http://192.168.18.229:8601',
        prod: 'https://flow.17ch.cn'
    }

    function changeApiChannel(value: string) {
        apiChannel = value;
        localStorage.apiChannel = value;
        localStorage.apiUrl = channelUrl[value as keyof typeof channelUrl];
        location.reload();
    }
</script>
<div class="flex items-center justify-between opacity-40 hover:opacity-100">
    <Label>API 环境</Label>
    <Select.Root type="single" value={apiChannel} onValueChange={changeApiChannel}>
        <Select.Trigger size="sm" class="w-[180px]">
            {channelList[apiChannel as keyof typeof channelList]}
        </Select.Trigger>
        <Select.Content>
            {#each Object.keys(channelList) as key}
                <Select.Item value={key}>{channelList[key as keyof typeof channelList]}</Select.Item>
            {/each}
        </Select.Content>
    </Select.Root>
</div>