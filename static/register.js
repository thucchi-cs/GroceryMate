import { add, submitForm, submitOnEnter } from "./script.js";

console.log(add(2,4))

let form = document.querySelector("form")
let inputs = document.querySelectorAll("input")
let btn = document.querySelector("button")

submitOnEnter(inputs, btn);

btn.addEventListener("click", () => {
    let username = document.getElementById("username");
    let password = document.getElementById("password");
    let password2 = document.getElementById("password2");

    if (password.value === "" || username.value === "" || password2.value==="") {
        console.log("no");
        return;
    }

    const allowed = "abcdefghijklmnopqrstuvwxyz0123456789_."
    for (const letter of username.value) {
        if (!allowed.includes(letter)) {
            console.log("username includes error");
            return;
        }
    }

    // # Check for password security level
    const symbols = "`~!@#$%^&*()_-+=;:,.<>?/{}[]\\|"
    let hasSymbol = false
    let hasDigit = false
    let hasUpper = false
    for (const letter of password.value) {
        if (symbols.includes(letter)) {
            hasSymbol = true;
        } else if (!isNaN(Number(letter))) {
            hasDigit = true;
        } else if (letter != letter.toLowerCase()) {
            hasUpper = true;
        }

        if (hasSymbol && hasDigit && hasUpper) {
            break
        }
    }

    if (!(hasSymbol && hasDigit && hasUpper)) {
        console.log("pwd not meet criteria");
        return;
    }

    if (password.value.length < 8) {
        console.log("pwd too short");
        return;
    }

    if (password.value != password2.value) {
        console.log("pwd no confirm")
        return
    }

    submitForm(form);
})