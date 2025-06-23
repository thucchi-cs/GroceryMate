import { add, submitForm } from "./script.js";

console.log(add(2,4))

let form = document.querySelector("form")
let inputs = document.querySelectorAll("input")
let btn = document.querySelector("button")

inputs.forEach(i => {
    i.addEventListener("keydown", event => {
        if (event.key == "Enter") {
            btn.click();
        }
    })
})

btn.addEventListener("click", () => {
    let username = document.getElementById("username");
    let password = document.getElementById("password");

    if (password.value === "" || username.value === "") {
        console.log("no");
        return;
    }

    submitForm(form);
})