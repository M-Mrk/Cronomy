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

function get_cron_explanation(entry) {
    const { minute, hour, day_of_month, month, day_of_week } = entry;
    
    // functions for
    // time
    const format_time = (h, m) => {
        if (h === '*' && m === '*') return 'every minute';
        if (h === '*') return m === '*' ? 'every minute' : `at minute ${m} of every hour`;
        if (m === '*') return `every minute of hour ${h}`;
        return `at ${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
    };
    
    // days
    const format_days = (dom, dow) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        if (dom === '*' && dow === '*') return 'every day';
        if (dom !== '*' && dow === '*') return `on day ${dom} of the month`;
        if (dom === '*' && dow !== '*') {
            const dayNum = parseInt(dow);
            return isNaN(dayNum) ? `on ${dow}` : `on ${days[dayNum] || dow}`;
        }
        return `on day ${dom} of the month and on ${days[parseInt(dow)] || dow}`;
    };
    
    // months
    const format_months = (m) => {
        if (m === '*') return 'every month';
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        const monthNum = parseInt(m);
        return `in ${months[monthNum - 1] || m}`;
    };
    
    // Build explanation
    let explanation = 'Runs ';
    
    // handle edge case
    if (minute === '*' && hour === '*' && day_of_month === '*' && month === '*' && day_of_week === '*') {
        return 'Runs every minute of every day';
    }
    
    // time part
    explanation += format_time(hour, minute);
    
    // day part
    const day_part = format_days(day_of_month, day_of_week);
    if (day_part !== 'every day') {
        explanation += ', ' + day_part;
    }
    
    // month part
    if (month !== '*') {
        explanation += ', ' + format_months(month);
    }
    
    return explanation;
}

function create_entry_base(entry) {
    const entry_base = document.createElement("div");
    entry_base.className = "collapse collapse-arrow bg-base-600 border border-0.5-base-500";

    const entry_check = document.createElement("input");
    entry_check.type = "checkbox";
    entry_base.appendChild(entry_check);

    const entry_title = document.createElement("div");
    entry_title.className = "collapse-title font-normal text-md flex flex-row justify-between items-center";
    
    // Create command container
    const command_container = document.createElement("div");
    command_container.className = "flex flex-col flex-1 mr-4";
    
    // Command text
    const command_text = document.createElement("span");
    command_text.className = "font-medium text-base-content truncate";
    command_text.innerText = String(entry.command);
    command_text.title = String(entry.command); // Tooltip for full command
    command_container.appendChild(command_text);
    
    // Cron schedule preview
    const schedule_preview = document.createElement("span");
    schedule_preview.className = "text-sm text-base-content/70 mt-1";
    schedule_preview.innerText = `${entry.minute} ${entry.hour} ${entry.day_of_month} ${entry.month} ${entry.day_of_week}`;
    command_container.appendChild(schedule_preview);
    
    entry_title.appendChild(command_container);

    const line_number = document.createElement("kbd");
    line_number.className = "kbd kbd-sm";
    line_number.innerText = entry.line;
    entry_title.appendChild(line_number);
    entry_base.appendChild(entry_title);

    const entry_content = document.createElement("div");
    entry_content.className = "collapse-content text-sm";
    
    if (entry.error) {
        entry_content.innerText = 'Entry is malformed: ' + String(entry.error);
        entry_base.appendChild(entry_content);
        return entry_base;
    }

    // Create detailed cron information
    const cron_details = document.createElement("div");
    cron_details.className = "space-y-4 p-2";
    
    // Command section
    const command_section = document.createElement("div");
    command_section.innerHTML = `
        <div class="mb-3">
            <h4 class="font-semibold text-base-content mb-2 flex items-center">
                <span class="badge badge-primary badge-sm mr-2">CMD</span>
                Command
            </h4>
            <div class="bg-base-700 rounded-lg p-3 font-mono text-sm break-all">
                ${entry.command}
            </div>
        </div>
    `;
    cron_details.appendChild(command_section);
    
    // Schedule section
    const schedule_section = document.createElement("div");
    schedule_section.innerHTML = `
        <div class="mb-3">
            <h4 class="font-semibold text-base-content mb-2 flex items-center">
                <span class="badge badge-secondary badge-sm mr-2">CRON</span>
                Schedule
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div class="bg-base-700 rounded-lg p-3 text-center">
                    <div class="text-xs text-base-content/70 mb-1">Minute</div>
                    <div class="font-mono text-lg font-bold text-primary">${entry.minute}</div>
                </div>
                <div class="bg-base-700 rounded-lg p-3 text-center">
                    <div class="text-xs text-base-content/70 mb-1">Hour</div>
                    <div class="font-mono text-lg font-bold text-primary">${entry.hour}</div>
                </div>
                <div class="bg-base-700 rounded-lg p-3 text-center">
                    <div class="text-xs text-base-content/70 mb-1">Day</div>
                    <div class="font-mono text-lg font-bold text-primary">${entry.day_of_month}</div>
                </div>
                <div class="bg-base-700 rounded-lg p-3 text-center">
                    <div class="text-xs text-base-content/70 mb-1">Month</div>
                    <div class="font-mono text-lg font-bold text-primary">${entry.month}</div>
                </div>
                <div class="bg-base-700 rounded-lg p-3 text-center">
                    <div class="text-xs text-base-content/70 mb-1">Weekday</div>
                    <div class="font-mono text-lg font-bold text-primary">${entry.day_of_week}</div>
                </div>
            </div>
        </div>
    `;
    cron_details.appendChild(schedule_section);
    
    // Human readable explanation
    const explanation_section = document.createElement("div");
    const human_readable = get_cron_explanation(entry);
    explanation_section.innerHTML = `
        <div>
            <h4 class="font-semibold text-base-content mb-2 flex items-center">
                <span class="badge badge-accent badge-sm mr-2">INFO</span>
                Schedule Explanation
            </h4>
            <div class="bg-base-700 rounded-lg p-3">
                <p class="text-base-content/90">${human_readable}</p>
            </div>
        </div>
    `;
    cron_details.appendChild(explanation_section);
    
    // Error section (if exists)
    if (entry.error) {
        const error_section = document.createElement("div");
        error_section.innerHTML = `
            <div>
                <h4 class="font-semibold text-error mb-2 flex items-center">
                    <span class="badge badge-error badge-sm mr-2">ERR</span>
                    Error
                </h4>
                <div class="alert alert-error">
                    <span>${entry.error}</span>
                </div>
            </div>
        `;
        cron_details.appendChild(error_section);
    }
    
    entry_content.appendChild(cron_details);
    entry_base.appendChild(entry_content);

    return entry_base
}

function add_entries(data) {
    const user_entries = data.user;
    if (user_entries && user_entries.length > 0) {
        const user_container = document.getElementById("user_entries_container");
        user_container.innerText = "";
        for (let entry of user_entries) {
            const entry_html = create_entry_base(entry);
            user_container.appendChild(entry_html);
        }
    }

    const root_entries = data.root;
    if (root_entries && root_entries.length > 0) {
        const root_container = document.getElementById("root_entries_container");
        root_container.innerText = "";
        for (let entry of root_entries) {
            const entry_html = create_entry_base(entry);
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

    // Modal functionality
    setupModalHandlers();
});

// Global variable to track which type of entry we're adding
let currentEntryType = 'user';

function setupModalHandlers() {
    const userPlusButton = document.getElementById("user_plus_button");
    const rootPlusButton = document.getElementById("root_plus_button");
    const modal = document.getElementById("new_entry_modal");
    const form = document.getElementById("new_entry_form");

    // Open modal for user entries
    userPlusButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent collapse toggle
        currentEntryType = 'user';
        openNewEntryModal();
    });

    // Open modal for root entries
    rootPlusButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent collapse toggle
        currentEntryType = 'root';
        openNewEntryModal();
    });

    // Handle quick template buttons
    document.querySelectorAll('[data-schedule]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const schedule = e.target.getAttribute('data-schedule');
            applyScheduleTemplate(schedule);
        });
    });

    // Handle form submission
    form.addEventListener('submit', handleFormSubmission);
}

function openNewEntryModal() {
    const modal = document.getElementById("new_entry_modal");
    const form = document.getElementById("new_entry_form");
    
    // Update modal title based on entry type
    const title = modal.querySelector('h3');
    title.textContent = `Add New ${currentEntryType === 'user' ? 'User' : 'Root'} Cron Entry`;
    
    // Reset form
    form.reset();
    
    // Show modal
    modal.showModal();
}

function applyScheduleTemplate(schedule) {
    const parts = schedule.split(' ');
    if (parts.length === 5) {
        document.querySelector('input[name="minute"]').value = parts[0];
        document.querySelector('input[name="hour"]').value = parts[1];
        document.querySelector('input[name="day_of_month"]').value = parts[2];
        document.querySelector('input[name="month"]').value = parts[3];
        document.querySelector('input[name="day_of_week"]').value = parts[4];
    }
}

async function handleFormSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Show loading state
    submitButton.textContent = 'Adding...';
    submitButton.disabled = true;
    
    try {
        const entryData = {
            minute: formData.get('minute') || '*',
            hour: formData.get('hour') || '*',
            day_of_month: formData.get('day_of_month') || '*',
            month: formData.get('month') || '*',
            day_of_week: formData.get('day_of_week') || '*',
            command: formData.get('command'),
            user: currentEntryType === 'root' ? 'false' : 'true'
        };

        // Validate required command
        if (!entryData.command.trim()) {
            throw new Error('Command is required');
        }

        const response = await fetch('/api/entries/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(entryData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to add entry');
        }

        // Success - close modal and refresh entries
        document.getElementById("new_entry_modal").close();
        showToast('Entry added successfully!', 'success');
        
        // Refresh the entries list
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

    } catch (error) {
        console.error('Error adding entry:', error);
        showToast(error.message || 'Failed to add entry', 'error');
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast_container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'} mb-2`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="btn btn-sm btn-ghost" onclick="this.parentElement.remove()">✕</button>
    `;

    toastContainer.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}