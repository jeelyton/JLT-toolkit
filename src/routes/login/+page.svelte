<script lang="ts">
    import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { formSchema, type FormSchema } from "./schema";
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { loginUser } from "$lib/apis/api";
  import { setTokens, authState } from "$lib/helpers/auth.svelte";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import { Alert, AlertTitle, AlertDescription } from "$lib/components/ui/alert/index.js";
  import { onMount } from 'svelte';
  import { page } from '$app/state';

  let isLoading = $state(false)
  let errorMessage = $state("")
 
  const form = superForm({
    username: localStorage.lastLoginUser || "",
    password: "",
  },{
    validators: zodClient(formSchema as any),
    onSubmit: async ({cancel}) => {
        const validationResult = formSchema.safeParse($formData)
        if (!validationResult.success) {
            return
        }

        cancel()
        
        await handleLogin()
    }
  });
 
  const { form: formData, enhance } = form;

  async function handleLogin() {
    try {
        isLoading = true
        const res = await loginUser($formData)
        setTokens(res)
        localStorage.lastLoginUser = $formData.username
        toast.success('登录成功')
        goto(page.url.searchParams.get('from') || '/')
    } catch (error: any) {
        errorMessage = error.message
    } finally {
        isLoading = false
    }
  }
</script>

<div class="max-w-md mx-auto">
    <form method="POST" use:enhance >
        <Form.Field {form} name="username">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>用户名</Form.Label>
              <Input {...props} bind:value={$formData.username} placeholder="输入用户名或工号" disabled={isLoading} />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="password">
            <Form.Control>
              {#snippet children({ props })}
                <Form.Label>密码</Form.Label>
                <Input type="password" {...props} bind:value={$formData.password} placeholder="输入金蝶密码" disabled={isLoading} />
              {/snippet}
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>
          <Form.Button class="w-full mt-2" disabled={isLoading}>
            {isLoading ? "登录中..." : "登录"}
          </Form.Button>

          {#if errorMessage}
          <Alert variant="destructive" class="mt-4">
            <AlertTitle>
              登录失败
            </AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
          {/if}
      </form>
</div>