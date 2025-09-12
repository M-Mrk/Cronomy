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

    let new_card;
    try {
        new_card = await advance_step();
    } catch (error) {
        new_toast(`Step failed: ${error.message}`, true);
        cancel_load();
        return;
    }
    set_step_ui((current_step - 1));
    card_base.classList.add("animate-fly-out-bottom");

    setTimeout(() => {
        show_new_card(new_card);
        loading = false;
    }, 1005);
}

function cancel_load() {
    loading = false;
    const spinner = document.getElementById("card_spinner");
    if (spinner) {
        spinner.remove();
    }
}

function show_new_card(new_card) {
    const card_base = document.getElementById("card_base");
    card_base.innerHTML = "";
    card_base.appendChild(new_card);
    card_base.classList.remove("animate-fly-out-bottom");
    card_base.classList.add("animate-fly-in-top");
}

function set_step_ui(step) {
    const steps_ui = document.getElementById("steps_ui_list");
    const steps = steps_ui.getElementsByClassName("step");
    if (step > (steps.length - 1)) {
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

function card_template(title, childs) {
    const card_body = document.createElement("div");
    card_body.className = "card-body";
    card_body.id = "card_body";

    const title_element = document.createElement("h2");
    title_element.className = "card-title";
    title_element.textContent = String(title);

    card_body.appendChild(title_element);
    for (const child of childs) {
        card_body.appendChild(child);
    }

    return card_body;
}

async function advance_step() {
    switch (current_step) {
        case 1:
            return step_2();
        default:
            return null;
    }
}

function step_2() {
    return fetch('/api/dependencies')
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    if (errorData.error) {
                        throw new Error(`${errorData.error}`);
                    }
                    throw new Error(`Unexpected error`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.installed) {
                const text = document.createElement("p");
                text.textContent = "Cron is installed. You can proceed to the next step.";

                const button = document.createElement("button");
                button.id = "next_button";
                button.className = "btn btn-primary btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-lg";
                button.innerText = "Next";
                button.addEventListener('click', next_step);

                const card_body = card_template("Cron is installed!", [text, button]);
                current_step = 2;
                return card_body;
            } else {
                const text = document.createElement("p");
                text.textContent = "Cronomy depends on cron/crontab. Please install cron or the equivalent for your distro (e.g. chronie) and restart Cronomy.";

                const tutorial = document.createElement("div");
                tutorial.className = "tabs tabs-lift";
                tutorial.innerHTML = `
                <label class="tab">
                    <input type="radio" name="os-tabs" checked />
                    <img src="/static/img/debian.svg" alt="Debian Logo" class="size-4 me-2" />
                    Debian
                </label>
                <div class="tab-content bg-base-100 border-base-300 p-6">
                    <div class="mockup-code w-full">
                        <pre><code>sudo apt-get install cron</code></pre>
                    </div>
                </div>

                <label class="tab">
                    <input type="radio" name="os-tabs" />
                    <img src="/static/img/arch.svg" alt="Arch Logo" class="size-4 me-2 text-user-text" />
                    Arch
                </label>
                <div class="tab-content bg-base-100 border-base-300 p-6">
                    <div class="mockup-code w-full">
                        <pre><code>sudo pacman -S cronie</code></pre>
                    </div>
                </div>

                <label class="tab">
                    <input type="radio" name="os-tabs" />
                    <img src="/static/img/other.svg" alt="Other" class="size-4 me-2" />
                    Other
                </label>
                <div class="tab-content bg-base-100 border-base-300 p-6">Try searching for your distros name + cron/crontab.</div>
                `

                const card_body = card_template("Seems like cron is not installed...", [text, tutorial]);
                current_step = 2;
                return card_body;
            }
        })
        .catch(error => {
            throw new Error(`Failed to fetch dependencies, ${error.message}`);
        });
}