use tauri::Manager;

pub fn run() {
    eprintln!("Starting Duple...");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .setup(|app| {
            eprintln!("Setup complete, showing window...");
            if let Some(window) = app.get_webview_window("main") {
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("FATAL: Failed to run Tauri application");
}
