import { flashMsg, submitForm, submitOnEnter } from "./script.js";

let form = document.querySelector("form")
let inputs = document.querySelectorAll("input")
let btn = form.querySelector("button")

submitOnEnter(inputs, btn);

function clearForm(inputFields) {
    inputFields.forEach(input => {
        input.value = "";
    })
}

btn.addEventListener("click", () => {
    let username = document.getElementById("username");
    let password = document.getElementById("password");
    let password2 = document.getElementById("password2");

    if (password.value === "" || username.value === "" || password2.value==="") {
        flashMsg("All fields must be filled.")
        clearForm([username, password, password2]);
        return;
    }

    const allowed = "abcdefghijklmnopqrstuvwxyz0123456789_."
    for (const letter of username.value) {
        if (!allowed.includes(letter)) {
            flashMsg("Username can only contain lowercase letters a-z, digits 0-9, periods or underscores!");
            clearForm([username, password, password2]);
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
        flashMsg("Password does not meet security criteria!");
        clearForm([username, password, password2]);
        return;
    }

    if (password.value.length < 8) {
        flashMsg("Password is too short!");
        clearForm([username, password, password2]);
        return;
    }

    if (password.value != password2.value) {
        flashMsg("Password was not confirmed!");
        clearForm([username, password, password2]);
        return
    }

    submitForm(form);
})