import { onMount } from "svelte";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { joinWithComma } from "$lib/helper";

type ShortcutConfig = {
  shortcut: string;
  callback: () => void;
};
const shortcustConfigs : ShortcutConfig[] = [
  {
    shortcut: 'Alt+,',
    callback: joinWithComma
  }
]

async function cleanup() {
  await unregisterAll()
  console.log('Unregistered all shortcuts')
}

export function useGlobalShortcut(enabled: boolean = true) {

  onMount(() => {
    if (enabled) {
      (async() => {
        await cleanup()
        for(const config of shortcustConfigs) {
            await register(config.shortcut, config.callback);
            console.log(`Registered shortcut: "${config.shortcut}" => ${config.callback.name}`);
        }
      })()
    }

    return () => {
      cleanup()
    }
  });
} 