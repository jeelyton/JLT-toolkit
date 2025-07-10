<script lang="ts">
    import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { formSchema, type FormSchema } from "./schema";
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { loginUser } from "$lib/apis/api";
  import { setTokens } from "$lib/helpers/auth";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";

  let isLoading = $state(false)
 
  const form = superForm({
    username: "",
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
        toast.success('登录成功')
        goto('/')
    } catch (error) {
        console.error(error)
        toast.error('登录失败')
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
          <Form.Button class="w-full" disabled={isLoading}>
            {isLoading ? "登录中..." : "登录"}
          </Form.Button>
      </form>
</div>