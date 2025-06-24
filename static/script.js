export function submitForm(form) {
    form.submit();
}

export function submitOnEnter(inputs, btn) {
    inputs.forEach(i => {
    i.addEventListener("keydown", event => {
        if (event.key == "Enter") {
            btn.click();
        }
    })
})}

export function flashMsg(msg) {
    let flash = document.querySelector("#flash-msg")
    console.log(flash);
    flash.hidden = false;
    flash.querySelector("#msg").innerHTML = msg
    console.log("hi")
}

let flashBtn = document.querySelector(".btn-close");
flashBtn.addEventListener("click", () => {
    let flash = document.querySelector("#flash-msg")
    flash.hidden = true;
    console.log("close")
})