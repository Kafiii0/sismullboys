use std::net::TcpStream;
use std::process::Command;
use std::path::PathBuf;
use tauri::Manager;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

fn find_engine_path(app: &tauri::App, engine_name: &str) -> Option<PathBuf> {
    let exe_filename = format!("{}.exe", engine_name);

    // 1. Check relative to current exe (Standard Windows NSIS installed directory)
    if let Ok(mut exe_dir) = std::env::current_exe() {
        exe_dir.pop();
        let candidates = [
            exe_dir.join(engine_name).join(&exe_filename),
            exe_dir.join("resources").join(engine_name).join(&exe_filename),
            exe_dir.join(&exe_filename),
        ];
        for c in &candidates {
            if c.exists() {
                return Some(c.clone());
            }
        }
    }

    // 2. Check resource directory from Tauri API
    if let Ok(res_dir) = app.path().resource_dir() {
        let candidates = [
            res_dir.join("resources").join(engine_name).join(&exe_filename),
            res_dir.join(engine_name).join(&exe_filename),
            res_dir.join(&exe_filename),
        ];
        for c in &candidates {
            if c.exists() {
                return Some(c.clone());
            }
        }
    }

    // 3. Check development / workspace paths
    let local_candidates = [
        PathBuf::from("resources").join(engine_name).join(&exe_filename),
        PathBuf::from("dist").join(engine_name).join(&exe_filename),
        PathBuf::from("..").join("dist").join(engine_name).join(&exe_filename),
        PathBuf::from("..").join("src-tauri").join("resources").join(engine_name).join(&exe_filename),
    ];
    for c in &local_candidates {
        if c.exists() {
            return Some(c.clone());
        }
    }

    None
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let pkg_name = app.package_info().name.to_lowercase();
            let is_hdmi = pkg_name.contains("hdmi") || pkg_name.contains("screen") || pkg_name.contains("presentation");
            let target_port = if is_hdmi { "127.0.0.1:8766" } else { "127.0.0.1:8765" };
            let engine_name = if is_hdmi { "hdmi_engine" } else { "witness_engine" };
            let py_fallback = if is_hdmi { "../desktop/hdmi_engine.py" } else { "../desktop/witness_engine.py" };

            if TcpStream::connect(target_port).is_err() {
                let current_pid = std::process::id().to_string();
                if let Some(engine_path) = find_engine_path(app, engine_name) {
                    #[cfg(windows)]
                    {
                        const CREATE_NO_WINDOW: u32 = 0x08000000;
                        let _ = Command::new(&engine_path)
                            .args(&["--parent-pid", &current_pid])
                            .stdin(std::process::Stdio::null())
                            .stdout(std::process::Stdio::null())
                            .stderr(std::process::Stdio::null())
                            .creation_flags(CREATE_NO_WINDOW)
                            .spawn();
                    }
                    #[cfg(not(windows))]
                    {
                        let _ = Command::new(&engine_path)
                            .args(&["--parent-pid", &current_pid])
                            .spawn();
                    }
                } else {
                    #[cfg(windows)]
                    {
                        let _ = Command::new("cmd")
                            .args(&["/c", "start", "/b", "python", py_fallback, "--parent-pid", &current_pid])
                            .spawn();
                    }
                    #[cfg(not(windows))]
                    {
                        let _ = Command::new("python3")
                            .args(&[py_fallback, "--parent-pid", &current_pid])
                            .spawn();
                    }
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
