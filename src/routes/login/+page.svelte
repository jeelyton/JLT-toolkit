<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Label } from "$lib/components/ui/label";
    import { Alert, AlertDescription } from "$lib/components/ui/alert";
    import { AlertCircle } from "@lucide/svelte";

    let email = $state('');
    let password = $state('');
    let error = $state('');
    let isLoading = $state(false);

    async function handleSubmit() {
        try {
            isLoading = true;
            // TODO: Implement actual login logic here
            console.log('Login attempt with:', { email, password });
            error = '';
        } catch (e) {
            error = 'Login failed. Please try again.';
        } finally {
            isLoading = false;
        }
    }
</script>

<Card class="max-w-md mx-auto">
    <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
    </CardHeader>
    <form onsubmit={handleSubmit}>
        <CardContent class="space-y-4">
            <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    bind:value={email}
                    required
                    disabled={isLoading}
                />
            </div>
            <div class="space-y-2">
                <Label for="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    bind:value={password}
                    required
                    disabled={isLoading}
                />
            </div>
            {#if error}
                <Alert variant="destructive">
                    <AlertCircle class="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            {/if}
        </CardContent>
        <CardFooter>
            <Button type="submit" class="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
        </CardFooter>
    </form>
</Card>