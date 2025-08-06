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
    flash.hidden = false;
    flash.querySelector("#msg").innerHTML = msg
}

let flashBtn = document.querySelector(".btn-close");
flashBtn.addEventListener("click", () => {
    let flash = document.querySelector("#flash-msg")
    flash.hidden = true;
})

export function countDecimalPlaces(number) {
    let decimal = number.indexOf(".")
    if (decimal == -1) {
        return 0;
    }
    number = number.substring(decimal+1, number.length)
    return number.length;
}

let ping;

document.addEventListener("DOMContentLoaded", () => {
    ping = setInterval(() => {
        fetch("/ping", {
            method: "POST"
        });
    }, 60000)
})

window.addEventListener('beforeunload', () => {
    clearInterval(ping)
});