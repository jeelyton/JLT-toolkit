<script lang="ts">
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Switch } from "$lib/components/ui/switch";
    import { Label } from "$lib/components/ui/label";
    import { Select, SelectContent, SelectItem, SelectTrigger } from "$lib/components/ui/select";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { onMount } from "svelte";
    import { downloadDir } from "@tauri-apps/api/path";
    import { getVersion } from '@tauri-apps/api/app'

    let outputDir = $state('');
    let version = $state('');

    onMount(async () => {
        outputDir = await downloadDir()
        version = await getVersion()
    })
</script>

<h1 class="text-3xl font-semibold text-center mb-5">设置</h1>
<div class="space-y-6">

    <div class="text-center text-sm text-gray-500">
        当前版本：v{version}
    </div>

    <!-- Appearance -->
    <Card>
        <CardHeader>
            <CardTitle>通用</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
                <Label for="output-dir">默认输出目录</Label>
                <Input class="w-64" type="text" bind:value={outputDir} />
            </div>
        </CardContent>
    </Card>

    <!-- Notifications -->
    <Card>
        <CardHeader>
            <CardTitle>快捷键</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
                <Label for="notifications">剪切板转为 IN 表达式</Label>
                <Input type="text"
                        placeholder="Alt + ,"
                        class="w-32"
                    />
            </div>
        </CardContent>
    </Card>
</div> 