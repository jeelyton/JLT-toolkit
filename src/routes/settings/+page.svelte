<script lang="ts">
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Switch } from "$lib/components/ui/switch";
    import { Label } from "$lib/components/ui/label";
    import { Select, SelectContent, SelectItem, SelectTrigger } from "$lib/components/ui/select";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";

    let darkMode = $state(false);
    let notifications = $state(true);
    let language = $state<string[]>(['en']);
    let apiKey = $state('');

    function handleSave() {
        // TODO: Implement settings save logic
        console.log('Saving settings:', { darkMode, notifications, language, apiKey });
    }
</script>

<div class="container py-6 space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">设置</h1>
    </div>

    <div class="grid gap-6">
        <!-- Appearance -->
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <div class="flex items-center justify-between">
                    <Label for="dark-mode">Dark Mode</Label>
                    <Switch id="dark-mode" bind:checked={darkMode} />
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
</div> 