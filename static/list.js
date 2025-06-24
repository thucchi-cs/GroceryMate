window.addEventListener('beforeunload', (event) => {
    console.log('User is about to leave the page!');
    let form = document.querySelector("#all_items");
    let formData = new FormData(document.querySelector("#all_items"));
    let data = new URLSearchParams(formData).toString();
    fetch("/update_list?"+data, {
        method: "POST"
    })
});
let form = document.querySelector("#all_items");
form.addEventListener("submit", () => {
    console.log("SUBMITTED")
})

let addForm = document.querySelector("#add_item");
let addBtn = document.querySelector("#add_btn")
let list = document.querySelector("#list_items")
addBtn.addEventListener("click", () => {
    let item = addForm.querySelector("#item");
    let category = addForm.querySelector("#category").options[addForm.querySelector("#category").selectedIndex].text;
    let qty = addForm.querySelector("#qty");
    let price = addForm.querySelector("#price");

    let listItem = document.createElement("li");
    listItem.innerHTML = item.value + " " + category + " " + qty.value + " " + price.value;
    let itemValue = document.createElement("input");
    itemValue.type = "text";
    itemValue.name = "new_item";
    itemValue.hidden = true;
    itemValue.value = item.value;
    let categoryValue = document.createElement("input");
    categoryValue.type = "number";
    categoryValue.name = "new_category_id";
    categoryValue.hidden = true;
    categoryValue.value = addForm.querySelector("#category").value;
    let qtyValue = document.createElement("input");
    qtyValue.type = "number";
    qtyValue.name = "new_quantity";
    qtyValue.hidden = true;
    qtyValue.value = qty.value;
    let priceValue = document.createElement("input");
    priceValue.type = "number";
    priceValue.name = "new_price";
    priceValue.hidden = true;
    priceValue.value = price.value;
    let deleteBtn = document.createElement("button");
    deleteBtn.id = "delete_item";
    deleteBtn.type = "button";
    deleteBtn.innerHTML = "-";

    listItem.appendChild(itemValue);
    listItem.appendChild(categoryValue);
    listItem.appendChild(qtyValue);
    listItem.appendChild(priceValue);
    listItem.appendChild(deleteBtn);
    list.insertBefore(listItem, addForm);

    deleteBtn.addEventListener("click", () => {
        delete_items(deleteBtn)
    })

    item.value = ""
    addForm.querySelector("#category").options[0].selected = true;
    price.value = ""
    qty.value = ""
})

function delete_items(btn) {
    let parent = btn.parentElement;
    list.removeChild(parent);
}

let deleteBtns = document.querySelectorAll("#delete_item");
deleteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        delete_items(btn)
    })
})
