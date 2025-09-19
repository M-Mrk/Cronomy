async function remove_loader() {
    const loader = document.getElementById("loader_base");
    if (!loader) {
        console.error("Could not find loader.");
        return;
    }
    loader.classList.add("animate-fly-out-top")
    loader.addEventListener("animationend", () => {
        setTimeout(() => {
            loader.classList.add("hidden");
            loader.classList.remove("animate-fly-out-top")
            return;
        }, 100);
    }, { once: true });
}

async function show_entry_collapse() {
    const user_collapse = document.getElementById("user_entries_body");
    const root_collapse = document.getElementById("root_entries_body");
    user_collapse.getElementsByTagName("input")[0].checked = true;
    root_collapse.getElementsByTagName("input")[0].checked = true;
    user_collapse.classList.remove("hidden");
    user_collapse.classList.add("animate-fly-in-top");
    root_collapse.classList.remove("hidden");
    root_collapse.classList.add("animate-fly-in-top");

    root_collapse.addEventListener("animationend", () => {
        root_collapse.classList.remove("animate-fly-in-top");
    }, { once: true });
    user_collapse.addEventListener("animationend", () => {
        user_collapse.classList.remove("animate-fly-in-top");
    }, { once: true });
}

function end_loading_sequence() {
    remove_loader();
    show_entry_collapse();
}

async function add_loader() {
    const loader = document.getElementById("loader_base");
    if (!loader) {
        console.error("Could not find loader.");
        return;
    }
    loader.classList.add("animate-fly-in-top");
    loader.classList.remove("hidden");
    loader.addEventListener("animationend", () => {
        setTimeout(() => {
            loader.classList.remove("animate-fly-in-top");
        }, 100);
    }, { once: true });
}

async function hide_entry_collapse() {
    const user_collapse = document.getElementById("user_entries_body");
    const root_collapse = document.getElementById("root_entries_body");
    user_collapse.classList.add("animate-fly-out-top");
    root_collapse.classList.add("animate-fly-out-top");

    return new Promise((resolve) => {
        let animationsCompleted = 0;
        const totalAnimations = 2;

        const checkComplete = () => {
            animationsCompleted++;
            if (animationsCompleted === totalAnimations) {
                resolve();
            }
        };

        root_collapse.addEventListener("animationend", () => {
            root_collapse.classList.add("hidden");
            root_collapse.classList.remove("animate-fly-out-top");
            checkComplete();
        }, { once: true });

        user_collapse.addEventListener("animationend", () => {
            user_collapse.classList.add("hidden");
            user_collapse.classList.remove("animate-fly-out-top");
            checkComplete();
        }, { once: true });
    });
}

async function start_loading_sequence() {
    await hide_entry_collapse();
    add_loader();
}

async function load_entries_json() {
    return fetch('/api/entries')
        .then(response => {
            if (!response.ok) {
                if (response.status === 500) {
                    return response.json().then(errorData => {
                        if (errorData.error) {
                            console.error(errorData.error);
                        } else {
                            console.error("An unknown error occurred.");
                        }
                    }).catch(() => {
                        console.error("Failed to parse error response.");
                    });
                } else {
                    console.error(`HTTP error: ${response.status}`);
                }
                return;
            }
            return response.json();
        })
        .catch(error => {
            console.error("Fetch failed:", error);
        });
}

function create_entry_base(entry) {
    const entry_base = document.createElement("div");
    entry_base.className = "collapse collapse-arrow bg-base-600 border border-0.5-base-500";

    const entry_check = document.createElement("input");
    entry_check.type = "checkbox";
    entry_base.appendChild(entry_check);

    const entry_title = document.createElement("div");
    entry_title.className = "collapse-title font-normal text-md flex flex-row justify-between";
    entry_title.innerText = String(entry.command);

    const line_number = document.createElement("kbd");
    line_number.className = "kbd";
    line_number.innerText = entry.line;
    entry_title.appendChild(line_number);
    entry_base.appendChild(entry_title);

    const entry_content = document.createElement("div");
    entry_content.className = "collapse-content text-sm";
    entry_content.innerText = "Test"
    entry_base.appendChild(entry_content);

    return entry_base
}

function add_entries(data) {
    const user_entries = data.user;
    if (user_entries && user_entries.length > 0) {
        const user_container = document.getElementById("user_entries_container");
        user_container.innerText = "";
        for (let entry of user_entries) {
            console.log(entry.command);
            const entry_html = create_entry_base(entry);
            console.dir(entry_html);
            user_container.appendChild(entry_html);
        }
    }

    const root_entries = data.root;
    if (root_entries && root_entries.length > 0) {
        const root_container = document.getElementById("root_entries_container");
        root_container.innerText = "";
        for (let entry of root_entries) {
            console.log(entry.command);
            const entry_html = create_entry_base(entry);
            console.dir(entry_html);
            root_container.appendChild(entry_html);
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const entries = await load_entries_json();
    add_entries(entries);
    end_loading_sequence();

    const refresh_button = document.getElementById("refresh_button");
    refresh_button.addEventListener("click", async () => {
        await start_loading_sequence();

        const new_entries = await load_entries_json();
        if (new_entries) {
            const root_container = document.getElementById("root_entries_container");
            root_container.innerHTML = "";

            const user_container = document.getElementById("user_entries_container");
            user_container.innerHTML = "";

            add_entries(new_entries);
        }
        end_loading_sequence();
    });
});