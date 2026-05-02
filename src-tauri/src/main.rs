fn main() {
    std::panic::set_hook(Box::new(|info| {
        eprintln!("ERROR: {}", info);
        eprintln!("\nPress Enter to close...");
        let mut s = String::new();
        std::io::stdin().read_line(&mut s).ok();
    }));

    duple_lib::run();

    // Keep window open if app exits normally
    eprintln!("\nApp exited. Press Enter to close...");
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).ok();
}
