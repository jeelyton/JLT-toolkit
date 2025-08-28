<script lang="ts">
    import * as Select from "$lib/components/ui/select";
    import { Label } from "$lib/components/ui/label";
    import { authState } from "$lib/helpers/auth.svelte";
    let becomeUser = $state(localStorage.becomeUser || '');
    const channelList = {
        '': '默认',
        '0809080': '周雪玲',
    }

    function changeBecomeUser(value: string) {
        becomeUser = value;
        localStorage.becomeUser = value;
        authState.becomeUser = value;
    }
</script>
<div class="flex items-center justify-between opacity-40 hover:opacity-100">
    <Label>切换身份</Label>
    <Select.Root type="single" value={becomeUser} onValueChange={changeBecomeUser}>
        <Select.Trigger size="sm" class="w-[180px]">
            {channelList[becomeUser as keyof typeof channelList]}
        </Select.Trigger>
        <Select.Content>
            {#each Object.keys(channelList) as key}
                <Select.Item value={key}>{channelList[key as keyof typeof channelList]}</Select.Item>
            {/each}
        </Select.Content>
    </Select.Root>
</div>