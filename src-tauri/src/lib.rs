use tauri::{AppHandle};
use tauri_plugin_clipboard_manager::ClipboardExt;
use tauri_plugin_shell::ShellExt;
use log;
use tauri_plugin_store::StoreExt;
use std::process::Command;
use tauri_plugin_global_shortcut::{Shortcut, Modifiers, Code};
use std::str::FromStr;
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

fn parse_shortcut(shortcut_str: &str) -> (Modifiers, Code) {
    let parts: Vec<&str> = shortcut_str.split('+').collect();
    let mut modifiers = Modifiers::empty();
    let mut key = Code::F12; // Default key

    for part in parts.iter() {
        match part.to_lowercase().as_str() {
            "command" | "commandorcontrol" => modifiers.insert(Modifiers::META),
            "alt" => modifiers.insert(Modifiers::ALT),
            "shift" => modifiers.insert(Modifiers::SHIFT),
            "control" => modifiers.insert(Modifiers::CONTROL),
            "super" => modifiers.insert(Modifiers::SUPER),
            key_str => {
                // Try to parse the last part as a key
                if part == parts.last().unwrap() {
                    // Convert the key string to uppercase and try to parse it as a Code
                    if let Ok(code) = Code::from_str(&key_str.to_uppercase()) {
                        key = code;
                    }
                }
            }
        }
    }

    (modifiers, key)
}

fn capture_screen_region(app_handle: &AppHandle) -> String {
    let cache_dir = app_handle.path().app_cache_dir().unwrap();
    log::info!("cache_dir: {}", cache_dir.display());
    std::fs::create_dir_all(&cache_dir).unwrap_or_else(|e| {
        log::error!("Failed to create cache directory: {}", e);
    });
    let path_buf = cache_dir.join("jeelyton-tool-orc.png");
    let temp_path = path_buf.to_str().unwrap();

    // let output = Command::new("cmd").output().unwrap();

    let shell = app_handle.shell();
    let output = match tauri::async_runtime::block_on(async move {
        shell
            .command("screencapture")
            .args(["-i", temp_path])
            .output()
            .await
    }) {
        Ok(output) => output,
        Err(e) => {
            log::error!("Failed to execute screencapture: {}", e);
            return String::from("");
        }
    };

    if !output.status.success() {
        log::error!("screencapture failed: {}", String::from_utf8(output.stderr).unwrap());
        return String::from("");
    }

    temp_path.to_string()
}

fn run_ocr(app: &AppHandle, path: String) -> String {
    let output = match tauri::async_runtime::block_on(async move {
        app.shell()
            .command("uv")
            .args(["run", "ocr.py", &path])
            .current_dir("src-py")
            .output()
            .await
    }) {
        Ok(output) => output,
        Err(e) => {
            log::error!("Failed to execute orc: {}", e);
            return String::from("");
        }
    };

    if !output.status.success() {
        log::error!("ocr failed: {}", String::from_utf8(output.stderr).unwrap());
        return String::from("");
    }

    String::from_utf8(output.stdout).unwrap()
}

#[tauri::command]
fn screencapture_to_clipboard(app: AppHandle) -> String {
    let temp_path = capture_screen_region(&app);
    if temp_path.is_empty() {
        return String::from("");
    }

    let text = run_ocr(&app, temp_path);

    if text.is_empty() {
        return String::from("");
    }

    log::info!("ocr result: {}", text);
    // save to clipboard
    app.clipboard().write_text(text.clone()).unwrap();
    text
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new()
            .level(log::LevelFilter::Info)
            .build())
        .plugin(tauri_plugin_store::Builder::default().build())
        // .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![screencapture_to_clipboard])
        .setup(|app| {
            #[cfg(desktop)]
            {
                let settings = app.store("settings.json")?;
                let shortcut_str = settings.get("ocr_shortcut")
                    .and_then(|v| v.as_str().map(String::from))
                    .unwrap_or("F8".to_string());
                
                let (modifiers, key) = parse_shortcut(&shortcut_str);
                let ocr_shortcut = Shortcut::new(Some(modifiers), key);

                use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new().with_handler(move |app, shortcut, event| {
                        if shortcut == &ocr_shortcut {
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
                app.global_shortcut().register(ocr_shortcut)?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
