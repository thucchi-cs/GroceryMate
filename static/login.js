import { flashMsg, submitForm, submitOnEnter } from "./script.js";

let form = document.querySelector("form")
let inputs = document.querySelectorAll("input")
let btn = form.querySelector("button")

submitOnEnter(inputs, btn);

btn.addEventListener("click", () => {
    let username = document.getElementById("username");
    let password = document.getElementById("password");

    if (password.value === "" || username.value === "") {
        flashMsg("All fields must be filled!");
        username.value = "";
        password.value = ""
        return;
    }

    submitForm(form);
})

let showPassword = document.getElementById("show-password")
// When toggled
showPassword.addEventListener("click", () => {
    let passwords = document.querySelectorAll("#password")
    for (let password of passwords) {
        // change visibility
        if (showPassword.checked) {
            password.type = "text"
        } else {
            password.type = "password"
        }
    };
})