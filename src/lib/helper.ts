import  * as clipboard from "@tauri-apps/plugin-clipboard-manager";

export async function joinWithComma() {
    let text = await clipboard.readText()
    text = text.split(/[\n\t]+/g).map((line) => `${line.trim()}`).join(',')
    clipboard.writeText(text)
  }