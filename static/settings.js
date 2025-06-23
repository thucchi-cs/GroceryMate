let addBtn = document.querySelector("#add_cat");
let categories = document.querySelector("#categories");
let deleteBtns = document.querySelectorAll("#delete_cat");

addBtn.addEventListener("click", () => {
    let listItem = document.createElement("li");
    let category = document.createElement("input");
    category.name = "new_cat";
    category.type = "text";
    category.placeholder = "New Category";
    category.autocomplete = "off";
    listItem.appendChild(category);
    categories.appendChild(listItem);
})

deleteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        let parent = btn.parentElement;
        let input = parent.querySelector("input");
        if (btn.innerHTML === "-") {
            btn.innerHTML = "+";
            parent.style.color = "red";
            input.value = input.value.substring(0, input.value.length-1) + "1"
        } else {
            btn.innerHTML = "-";
            parent.style.color = "white";
            input.value = input.value.substring(0, input.value.length-1) + "0"
        }
})})