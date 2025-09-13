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

function next_button_template() {
    const button = document.createElement("button");
    button.id = "next_button";
    button.className = "btn btn-primary btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-lg";
    button.innerText = "Next";
    button.addEventListener('click', next_step);
    return button;
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
        case 2:
            return step_3();
        case 3:
            return step_4()
        case 4:
            window.location.href = '/';
            return
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
                const button = next_button_template();

                const card_body = card_template("Cron is installed!", [text, button]);
                current_step = 2;
                return card_body;
            } else {
                const text = document.createElement("p");
                text.textContent = "Cronomy depends on cron/crontab. Please install cron or the equivalent for your distro (e.g. cronie) and restart Cronomy.";

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

function step_3() {
    const text = document.createElement("p");
    text.textContent = "Now we need to find your crontab file and check if cronomy can access it.";

    const spinner = document.createElement("span");
    spinner.className = "loading loading-spinner loading-lg";
    spinner.id = "cron_path_spinner";

    const card_body = card_template("Crontab access", [text, spinner]);
    current_step = 3;
    setTimeout(check_crontab, 1000); // wait to make sure card was created and then fetch if path can be found automatically
    return card_body;
}

function step_4() {
    const text = document.createElement("p");
    text.textContent = "Setup completed. Lets get started!";
    const button = next_button_template();
    button.innerText = 'Start';

    const card_body = card_template("Done!", [text, button]);
    current_step = 4;
    return card_body;
}

async function check_crontab() {
    return fetch('/api/crontab_path')
        .then(response => {
            const spinner = document.getElementById("cron_path_spinner");
            console.log(spinner);
            if (spinner) {
                spinner.remove();
            }

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
            const card_body = document.getElementById("card_body");
            if (data.found === true) {
                const alert = document.createElement("div");
                alert.className = "alert alert-success";
                alert.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Crontabs are found and accessable!</span>
                `
                card_body.appendChild(alert);

                const button = next_button_template();
                card_body.appendChild(button);
            } else {
                const alert = document.createElement("div");
                alert.className = "alert alert-error";
                alert.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Crontabs could not be read: ${data.found}</span>
                `
                card_body.appendChild(alert);
            }
        })
        .catch(error => {
            throw new Error(`Failed to access crontab path, ${error.message}.`);
        });
}