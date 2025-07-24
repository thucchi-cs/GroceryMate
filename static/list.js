import { flashMsg, countDecimalPlaces, submitOnEnter } from "./script.js";

let changed = false;

window.addEventListener('beforeunload', (event) => {
    console.log('User is about to leave the page!');
    console.log(event)
    if (changed) {
        event.preventDefault()
        let form = document.querySelector("#all_items");
        let formData = new FormData(form);
        let data = new URLSearchParams(formData);
        navigator.sendBeacon("/update_list", data);
        changed = false
    }
});


let listBudget = document.getElementById("list_budget")
let listSpent = document.getElementById("list_spent")
let listItems = document.getElementById("list_items")
let listTotal = document.getElementById("list_total")
let warning = document.getElementById("warning");

function checkBudget() {
    if (Number(listSpent.textContent.substring(listSpent.textContent.indexOf("$")+1)) > Number(listBudget.textContent.substring(listBudget.textContent.indexOf("$")+1))) {
        warning.hidden = false;
        warning.innerHTML = "You have spent above this week's budget!";
    } else if (Number(listTotal.textContent.substring(listTotal.textContent.indexOf("$")+1)) > Number(listBudget.textContent.substring(listBudget.textContent.indexOf("$")+1))) {
        warning.hidden = false;
        warning.innerHTML = "Your expected cost is above this week's budget!";
    } else {
        warning.hidden = true;
    }
}

let addForm = document.querySelector("#add_item");
let addBtn = document.querySelector("#add_btn")
let list = document.querySelector("#list-items")
submitOnEnter(addForm.querySelectorAll("input"), addBtn)
let newItems = 0;
addBtn.addEventListener("click", () => {
    newItems++;
    let item = addForm.querySelector("#item");
    let category = addForm.querySelector("#category").options[addForm.querySelector("#category").selectedIndex].text;
    let qty = addForm.querySelector("#qty");
    let price = addForm.querySelector("#price");

    if (item.value === "" || qty.value === "" || price.value === "" || category ==="Category") {
        flashMsg("All fields must be filled!")
        return;
    }

    if (Number(qty.value) < 1 || countDecimalPlaces(String(qty.value)) > 0) {
        flashMsg("Invalid quantity");
        return
    }

    if (Number(price.value) < 0.01 || countDecimalPlaces(String(price.value)) > 2) {
        flashMsg("Invalid price");
        return
    }

    let id = -newItems;

    let listItem = document.createElement("div");
    listItem.classList.add("grocery-row");
    let text = document.createElement("span");
    text.innerHTML = item.value + " " + category + " " + qty.value + " " + price.value;
    let idValue = document.createElement("input");
    idValue.type = "number";
    idValue.name = "new_id";
    idValue.hidden = true;
    idValue.value = id;
    let itemValue = document.createElement("input");
    itemValue.type = "text";
    itemValue.name = "new_item";
    itemValue.hidden = true;
    itemValue.value = item.value.replaceAll(" ", "_");
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

    let checkDiv = document.createElement("div");
    checkDiv.classList.add("grocery-cell", "cell-check");
    let boughtValue = document.createElement("input");
    boughtValue.classList.add("circle-checkbox");
    boughtValue.type = "checkbox";
    boughtValue.name = "bought";
    boughtValue.value = id;
    boughtValue.id = "bought";
    checkDiv.appendChild(boughtValue);

    let newQty = document.createElement("div");
    newQty.classList.add("grocery-cell", "cell-qty");
    newQty.textContent = qty.value;
    let newItem = document.createElement("div");
    newItem.classList.add("grocery-cell", "cell-name");
    newItem.textContent = item.value.substring(0,1).toUpperCase() + item.value.substring(1); 
    let newCat = document.createElement("div");
    newCat.classList.add("grocery-cell", "cell-category");
    newCat.textContent = category;
    let newPrice = document.createElement("div");
    newPrice.classList.add("grocery-cell", "cell-price");
    newPrice.textContent = "$" + price.value;

    let btnDiv = document.createElement("div");
    btnDiv.classList.add("grocery-cell", "cell-delete")
    let deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn")
    deleteBtn.id = "delete_item";
    deleteBtn.type = "button";
    deleteBtn.innerHTML = "&minus;";
    btnDiv.appendChild(deleteBtn);

    listItem.appendChild(idValue);
    // listItem.appendChild(text);
    listItem.appendChild(itemValue);
    listItem.appendChild(categoryValue);
    listItem.appendChild(qtyValue);
    listItem.appendChild(priceValue);
    listItem.appendChild(checkDiv);
    listItem.appendChild(newQty);
    listItem.appendChild(newItem);
    listItem.appendChild(newCat);
    listItem.appendChild(newPrice);
    listItem.appendChild(btnDiv);
    list.insertBefore(listItem, addForm);

    deleteBtn.addEventListener("click", () => {
        let numItemsTxt = listItems.textContent;
        listItems.textContent = numItemsTxt.substring(0, numItemsTxt.indexOf(" ")+1) + (Number(numItemsTxt.substring(numItemsTxt.indexOf(" ")+1)) - 1);
        let totalTxt = listTotal.textContent;
        listTotal.textContent = totalTxt.substring(0, totalTxt.indexOf("$")+1) + (Number(totalTxt.substring(totalTxt.indexOf("$")+1)) - Number(priceValue.value)).toFixed(2);
        if (boughtValue.checked) {
            let spentTxt = listSpent.textContent;
            listSpent.textContent = spentTxt.substring(0, spentTxt.indexOf("$")+1) + (Number(spentTxt.substring(spentTxt.indexOf("$")+1)) - Number(priceValue.value)).toFixed(2);
        }
        list.removeChild(listItem);
        checkBudget()
    })

    boughtValue.addEventListener("click", () => {
        let spentTxt = listSpent.textContent;
        if (boughtValue.checked) {
            listSpent.textContent = spentTxt.substring(0, spentTxt.indexOf("$")+1) + (Number(spentTxt.substring(spentTxt.indexOf("$")+1)) + Number(priceValue.value)).toFixed(2);
        } else {
            listSpent.textContent = spentTxt.substring(0, spentTxt.indexOf("$")+1) + (Number(spentTxt.substring(spentTxt.indexOf("$")+1)) - Number(priceValue.value)).toFixed(2);
        }
        checkBudget()
    })

    let numItemsTxt = listItems.textContent;
    listItems.textContent = numItemsTxt.substring(0, numItemsTxt.indexOf(" ")+1) + (Number(numItemsTxt.substring(numItemsTxt.indexOf(" ")+1)) + 1);
    let totalTxt = listTotal.textContent;
    listTotal.textContent = totalTxt.substring(0, totalTxt.indexOf("$")+1) + (Number(totalTxt.substring(totalTxt.indexOf("$")+1)) + Number(price.value)).toFixed(2);
    checkBudget()

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
        let parent = btn.parentElement.parentElement;
        list.removeChild(parent);
        let numItemsTxt = listItems.textContent;
        listItems.textContent = numItemsTxt.substring(0, numItemsTxt.indexOf(" ")+1) + (Number(numItemsTxt.substring(numItemsTxt.indexOf(" ")+1)) - 1);
        let price = parent.querySelector("#new_price");
        let totalTxt = listTotal.textContent;
        listTotal.textContent = totalTxt.substring(0, totalTxt.indexOf("$")+1) + (Number(totalTxt.substring(totalTxt.indexOf("$")+1)) - Number(price.value)).toFixed(2);
        let bought = parent.querySelector("#bought");
        if (bought.checked) {
            let spentTxt = listSpent.textContent;
            listSpent.textContent = spentTxt.substring(0, spentTxt.indexOf("$")+1) + (Number(spentTxt.substring(spentTxt.indexOf("$")+1)) - Number(price.value)).toFixed(2);
        }
        changed = true;
        checkBudget()
    })
})

let checkboxes = document.querySelectorAll("#bought");
checkboxes.forEach(chk => {
    chk.addEventListener("click", () => {
        console.log("CHANGE")
        let parent = chk.parentElement.parentElement;
        let price = parent.querySelector("#new_price");
        let spentTxt = listSpent.textContent;
        if (chk.checked) {
            listSpent.textContent = spentTxt.substring(0, spentTxt.indexOf("$")+1) + (Number(spentTxt.substring(spentTxt.indexOf("$")+1)) + Number(price.value)).toFixed(2);
        } else {
            listSpent.textContent = spentTxt.substring(0, spentTxt.indexOf("$")+1) + (Number(spentTxt.substring(spentTxt.indexOf("$")+1)) - Number(price.value)).toFixed(2);
        }
        changed = true
        checkBudget()
    })
})

checkBudget()

let names = document.querySelectorAll("#new_item")
for (let i=0; i < names.length; i++) {
    names[i].value = names[i].value.replaceAll(" ", "_")
}