let changed = false;

window.addEventListener('beforeunload', (event) => {
    console.log('User is about to leave the page!');
    console.log(event)
    if (changed) {
        event.preventDefault()
        let formData = new FormData(document.querySelector("#all_items"));
        let data = new URLSearchParams(formData);
        navigator.sendBeacon("/update_list", data);
        changed = false
    }
});

let listId = document.getElementById("list_id")
let listStart = document.getElementById("list_start")
let listEnd = document.getElementById("list_end")
let listBudget = document.getElementById("list_budget")
let listSpent = document.getElementById("list_spent")
let listItems = document.getElementById("list_items")
let listTotal = document.getElementById("list_total")

let addForm = document.querySelector("#add_item");
let addBtn = document.querySelector("#add_btn")
let list = document.querySelector("#list-items")
let newItems = 0;
addBtn.addEventListener("click", () => {
    newItems++;
    let item = addForm.querySelector("#item");
    let category = addForm.querySelector("#category").options[addForm.querySelector("#category").selectedIndex].text;
    let qty = addForm.querySelector("#qty");
    let price = addForm.querySelector("#price");

    let id = -newItems;

    let listItem = document.createElement("li");
    let text = document.createElement("span");
    text.innerHTML = item.value + " " + category + " " + qty.value + " " + price.value;
    let idValue = document.createElement("input");
    idValue.type = "number";
    idValue.name = "new_id";
    idValue.hidden = true;
    idValue.value = id;
    let boughtValue = document.createElement("input");
    boughtValue.type = "checkbox";
    boughtValue.name = "bought";
    boughtValue.value = id;
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

    listItem.appendChild(idValue);
    listItem.appendChild(boughtValue);
    listItem.appendChild(text);
    listItem.appendChild(itemValue);
    listItem.appendChild(categoryValue);
    listItem.appendChild(qtyValue);
    listItem.appendChild(priceValue);
    listItem.appendChild(deleteBtn);
    list.insertBefore(listItem, addForm);

    deleteBtn.addEventListener("click", () => {
        let numItemsTxt = listItems.textContent;
        listItems.textContent = numItemsTxt.substring(0, numItemsTxt.indexOf(" ")+1) + (Number(numItemsTxt.substring(numItemsTxt.indexOf(" ")+1)) - 1);
        let totalTxt = listTotal.textContent;
        listTotal.textContent = totalTxt.substring(0, totalTxt.indexOf(" ")+1) + (Number(totalTxt.substring(totalTxt.indexOf(" ")+1)) - Number(priceValue.value)).toFixed(2);
        list.removeChild(listItem);
    })

    boughtValue.addEventListener("click", () => {
        let spentTxt = listSpent.textContent;
        if (boughtValue.checked) {
            listSpent.textContent = spentTxt.substring(0, spentTxt.indexOf(" ")+1) + (Number(spentTxt.substring(spentTxt.indexOf(" ")+1)) + Number(priceValue.value)).toFixed(2);
        } else {
            listSpent.textContent = spentTxt.substring(0, spentTxt.indexOf(" ")+1) + (Number(spentTxt.substring(spentTxt.indexOf(" ")+1)) - Number(priceValue.value)).toFixed(2);
        }
    })

    let numItemsTxt = listItems.textContent;
    listItems.textContent = numItemsTxt.substring(0, numItemsTxt.indexOf(" ")+1) + (Number(numItemsTxt.substring(numItemsTxt.indexOf(" ")+1)) + 1);
    let totalTxt = listTotal.textContent;
    listTotal.textContent = totalTxt.substring(0, totalTxt.indexOf(" ")+1) + (Number(totalTxt.substring(totalTxt.indexOf(" ")+1)) + Number(price.value)).toFixed(2);

    item.value = ""
    addForm.querySelector("#category").options[0].selected = true;
    price.value = ""
    qty.value = ""
    item.focus()

    changed = true;
})

let deleteBtns = document.querySelectorAll("#delete_item");
deleteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        let parent = btn.parentElement;
        list.removeChild(parent);
        let numItemsTxt = listItems.textContent;
        listItems.textContent = numItemsTxt.substring(0, numItemsTxt.indexOf(" ")+1) + (Number(numItemsTxt.substring(numItemsTxt.indexOf(" ")+1)) - 1);
        let price = parent.querySelector("#new_price");
        let totalTxt = listTotal.textContent;
        listTotal.textContent = totalTxt.substring(0, totalTxt.indexOf(" ")+1) + (Number(totalTxt.substring(totalTxt.indexOf(" ")+1)) - Number(price.value)).toFixed(2);
        changed = true;
    })
})

let checkboxes = document.querySelectorAll("#bought");
checkboxes.forEach(chk => {
    chk.addEventListener("click", () => {
        console.log("CHANGE")
        let parent = chk.parentElement;
        let price = parent.querySelector("#new_price");
        let spentTxt = listSpent.textContent;
        if (chk.checked) {
            listSpent.textContent = spentTxt.substring(0, spentTxt.indexOf(" ")+1) + (Number(spentTxt.substring(spentTxt.indexOf(" ")+1)) + Number(price.value)).toFixed(2);
        } else {
            listSpent.textContent = spentTxt.substring(0, spentTxt.indexOf(" ")+1) + (Number(spentTxt.substring(spentTxt.indexOf(" ")+1)) - Number(price.value)).toFixed(2);
        }
        changed = true
    })
})