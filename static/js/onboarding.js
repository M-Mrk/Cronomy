function next_step(){
    console.log('Next step!')
    const card_base = document.getElementById("card_base")
    card_base.classList.remove("animate-fly-in-top")

    // Await function

    card_base.classList.add("animate-fly-out-bottom")
}

document.addEventListener("DOMContentLoaded", async () => {
    const next_buttons = document.getElementById("next_button")
    next_buttons.addEventListener('click', next_step);
});