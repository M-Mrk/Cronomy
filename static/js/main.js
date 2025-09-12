export function new_toast(message, warn=false) {
    const toast_container = document.getElementById("toast_container");
    const toast = document.createElement('div');
    toast.classList.add("alert");
    if (warn) {
        toast.classList.add("alert-warning");
    } else {
        toast.classList.add("alert-info");
    }

    const toast_message = document.createElement("span");
    toast_message.textContent = String(message);
    toast.appendChild(toast_message);

    const toast_button = document.createElement("button");
    toast_button.textContent = "X";
    toast_button.className = "btn btn-xs btn-dash";
    toast_button.addEventListener("click", () => remove_toast(toast))
    toast.appendChild(toast_button);

    toast_container.appendChild(toast);

    setTimeout(() => {
        remove_toast(toast)
    }, 5000);
}

export function remove_toast(toast) {
    toast.classList.add("animate-fly-out-right")
    toast.addEventListener("transitionend", () => toast.remove(), { once: true })
}

export function update_theme(base, primary, secondary) {
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
