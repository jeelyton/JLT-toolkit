use std::process::Command;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[tauri::command]
fn capture_screen_region() -> String {
    // 生成临时文件路径（macOS 推荐用 /tmp）
    let temp_path = "/tmp/screenshot.png";

    // 调用系统截图命令 (-i 交互模式选择区域, -c 保存到剪贴板)
    let status = Command::new("screencapture")
        .args(&["-i", temp_path]) // -i 选择区域并保存到文件
        .status()
        .expect("截图失败");

    if !status.success() {
        return String::from(""); // 用户取消截图会返回非零状态码
    }

    temp_path.to_string()
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, capture_screen_region])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
