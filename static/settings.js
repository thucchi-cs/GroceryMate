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
    category.classList.add("category-input")
    listItem.appendChild(category);
    categories.appendChild(listItem);
})

deleteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        let parent = btn.parentElement;
        let input = parent.querySelector("input");
        if (btn.innerHTML === "+") {
            btn.innerHTML = "&minus;";
            parent.style.color = "#2f2f2f";
            input.value = input.value.substring(0, input.value.length-1) + "0";
            btn.style.backgroundColor = "#d9534f"
        } else {
            btn.innerHTML = "+";
            parent.style.color = "red";
            input.value = input.value.substring(0, input.value.length-1) + "1";
            btn.style.backgroundColor = "#28a745";
        }
})})