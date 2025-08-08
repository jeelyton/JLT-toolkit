<script lang="ts">
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { authState } from "$lib/helpers/auth.svelte";
    import { Button } from "$lib/components/ui/button";
    import { fetchWithToken } from "$lib/apis/api";
    import { toast } from "svelte-sonner";
    let userPhone = $state(authState.userInfo?.phone || '');
    let password = $state('');

    async function saveXkyCredential() {
        if( !userPhone || !password ) {
            return toast.warning('请输入携客云账号和密码');
        }
        try {
            const res = await fetchWithToken('/users/credential/XKY', {
                method: 'POST',
                body: JSON.stringify({
                    login_id: userPhone,
                    password
                })
            });

            toast.success('保存成功');
        } catch (error) {
            toast.error((error as Error).message);
        }
    }
</script>
<Card>
    <CardHeader>
        <CardTitle>携客云账号</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
        <div class="flex gap-2">
            <Label>账号信息</Label>
            <Input type="text"
                    placeholder="携客云手机号"
                    class="w-40 h-8 rounded-sm px-2"
                    bind:value={userPhone}
            />
            <Input type="password"
                    placeholder="携客云密码"
                    class="w-40 h-8 rounded-sm px-2"
                    bind:value={password}
            />
            <Button class="h-8 rounded-sm px-2" onclick={saveXkyCredential}>保存</Button>
        </div>
    </CardContent>
</Card>