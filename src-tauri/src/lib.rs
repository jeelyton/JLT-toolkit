use tauri::{AppHandle, Manager};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_shell::ShellExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

fn capture_screen_region(app_handle: &AppHandle) -> String {
    // 生成临时文件路径（macOS 推荐用 /tmp）
    let temp_path = "/tmp/jeelyton-tool-orc.png";

    let shell = app_handle.shell();
    let output = tauri::async_runtime::block_on(async move {
        shell
            .command("screencapture")
            .args(["-i", temp_path])
            .output()
            .await
            .unwrap()
    });

    if output.status.success() {
        temp_path.to_string()
    } else {
        String::from("")
    }
}

fn run_ocr(app_handle: &AppHandle, path: String) -> String {
    let shell = app_handle.shell();
    let output = tauri::async_runtime::block_on(async move {
        shell
            .command("uv")
            .args(["run", "ocr.py", &path])
            .current_dir("/Users/brook/code/jeelyton-tools/src-py")
            .output()
            .await
            .unwrap()
    });

    if output.status.success() {
        String::from_utf8(output.stdout).unwrap()
    } else {
        String::from("")
    }
}

#[tauri::command]
fn screencapture_to_clipboard(app: AppHandle) -> String {
    let temp_path = capture_screen_region(&app);
    if temp_path.is_empty() {
        return String::from("");
    }

    let text = run_ocr(&app, temp_path);
    // save to clipboard
    app.clipboard().write_text(text.clone()).unwrap();

    text
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![screencapture_to_clipboard])
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

                let f12_shortcut = Shortcut::new(None, Code::F12);
                app.app_handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new().with_handler(move |app, shortcut, event| {
                        if shortcut == &f12_shortcut {
                            match event.state() {
                                ShortcutState::Pressed => {
                                    let _ = screencapture_to_clipboard(app.clone());
                                }
                                ShortcutState::Released => {}
                            }
                        }
                    })
                    .build(),
                )?;

                app.global_shortcut().register(f12_shortcut)?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
