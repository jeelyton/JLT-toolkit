import { onMount } from "svelte";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { toast } from "svelte-sonner";

type UnlistenFn = () => void;

export function useDragDrop(onFileAdd: (path: string) => Promise<void>) {
  onMount(() => {
    let unlisten: UnlistenFn | undefined;
    
    (async function() {
      unlisten = await getCurrentWebview().onDragDropEvent((event) => {
        if (event.payload.type === 'over') {
          // Handle drag over if needed
        } else if (event.payload.type === 'drop') {
          const { paths } = event.payload;
          for (const path of paths) {
            if (/\.(pdf|jpe?g|png)$/i.test(path)) {
              onFileAdd(path);
            } else {
              toast.warning("只支持拖放 PDF 文件！");
            }
          }
        } else {
          console.log('File drop cancelled', event.payload.type);
        }
      });
    })();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  });
} 