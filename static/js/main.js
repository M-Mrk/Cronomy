function update_theme(base, primary, secondary) {
    // Convert hex to RGB values
    const baseRgb = hex_to_rgb(base);
    const primaryRgb = hex_to_rgb(primary);
    const secondaryRgb = hex_to_rgb(secondary);

    const root = document.documentElement;
    if (baseRgb) {
        root.style.setProperty('--user-base', `${baseRgb.r} ${baseRgb.g} ${baseRgb.b}`);
    }
    if (primaryRgb) {
        root.style.setProperty('--user-primary', `${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b}`);
    }
    if (secondaryRgb) {
        root.style.setProperty('--user-secondary', `${secondaryRgb.r} ${secondaryRgb.g} ${secondaryRgb.b}`);
    }
}

function hex_to_rgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function new_toast(message, warn) {
    const toast_container = document.getElementById("toast_container");
    // <div class="alert alert-warning">
    //     <span>Message sent successfully.</span>
    //     <button class="btn btn-xs btn-dash">X</button>
    // </div>
}