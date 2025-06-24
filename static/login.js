import { flashMsg, submitForm, submitOnEnter } from "./script.js";

let form = document.querySelector("form")
let inputs = document.querySelectorAll("input")
let btn = form.querySelector("button")

submitOnEnter(inputs, btn);

btn.addEventListener("click", () => {
    let username = document.getElementById("username");
    let password = document.getElementById("password");

    if (password.value === "" || username.value === "") {
        flashMsg("All fields must be filled");
        return;
    }

    submitForm(form);
})