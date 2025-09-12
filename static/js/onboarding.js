import { new_toast } from "./main.js";

let loading = false;
let current_step = 1;
async function next_step() {
    if (loading) { // make sure to only execute once
        new_toast("Already loading...");
        set_step_ui(0);
        return;
    }
    loading = true

    console.log('Next step!');
    const card_base = document.getElementById("card_base");
    const card_button = document.getElementById("next_button");
    card_base.classList.remove("animate-fly-in-top");

    // Add spinner
    const spinner = document.createElement("span");
    spinner.className = "loading loading-spinner";
    spinner.id = "card_spinner";
    card_button.appendChild(spinner);
    
    try {
        await advance_step();
    } catch (error) {
        new_toast(`Step failed: ${error}`, true);
        cancel_load();
    }
    // card_base.classList.add("animate-fly-out-bottom")
}

function cancel_load() {
    loading = false;
    const spinner = document.getElementById("card_spinner");
    spinner.remove()
}

function set_step_ui(step) {
    const steps_ui = document.getElementById("steps_ui_list");
    const steps = steps_ui.getElementsByClassName("step");
    if (step > (steps.length-1)) {
        console.error("Could not set_step_ui, as specified step is higher than there are steps.");
        return;
    }

    for (let s = 0; s <= step; s++) { // Add class to step and all steps before
        const step_element = steps[s];
        if (!step_element.classList.contains("step-primary")) {
            step_element.classList.add("step-primary");
        }
    }

    step += 1
    for (let s = step; s < steps.length; s++) { // Remove class from all 
        const step_element = steps[s];
        if (step_element.classList.contains("step-primary")) {
            step_element.classList.remove("step-primary");
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const next_buttons = document.getElementById("next_button");
    next_buttons.addEventListener('click', next_step);
});

async function advance_step() {
    throw "Cant access hard drive!";
}