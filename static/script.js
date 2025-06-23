export function add(a,b) {
    return a+b;
}

export function submitForm(form) {
    form.submit()
}

export function submitOnEnter(inputs, btn) {
    inputs.forEach(i => {
    i.addEventListener("keydown", event => {
        if (event.key == "Enter") {
            btn.click();
        }
    })
})
}