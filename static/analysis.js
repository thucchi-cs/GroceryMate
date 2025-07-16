async function createWeeksCharts() {
    const response = await fetch("/weeks_data");
    const result = await response.json();

    let summary = document.getElementById("weeks_summary");
    summary.querySelector("#total").textContent += `$${result.total.toFixed(2)}`;
    summary.querySelector("#avg").textContent += `$${result.avg.toFixed(2)}`;
    summary.querySelector("#over_budget").textContent += `$${result.over_budget.toFixed(2)}`;
    let most_bought = summary.querySelector("#most_bought");
    for (let item in result.most_bought) {
        console.log(item)
        let p = document.createElement("p");
        p.innerHTML= `• ${item} - ${result.most_bought[item]}`;
        most_bought.appendChild(p)
    }

    let chartCanvas = document.getElementById("spending_chart-weeks");

    let colors = Array(result.spent.length).fill("rgba(8, 145, 8, 0.59)");

    let labels = result.dates;
    let values = result.spent;
    let budget = result.budget;

    await createSpendingCharts(chartCanvas, colors, labels, values, budget);

    let chartCanvas2 = document.getElementById("categories_chart-frequency");
    let chartCanvas3 = document.getElementById("categories_chart-values");
    let categories = Object.keys(result.categories);
    let catCounts = Object.values(result.categories).map(data => data.count)
    let catValues = Object.values(result.categories).map(data => data.value)
    console.log(categories)
    console.log(catCounts)
    console.log(catValues)
    for (const key in result.categories) {
        console.log(result.categories[key].count + " " + key + " " + result.categories[key].value)
    }

    await createCategoriesCharts(chartCanvas2, categories, catCounts, "frequency")
    await createCategoriesCharts(chartCanvas3, categories, catValues, "values")
}

async function createMonthsCharts() {
    const response = await fetch("/months_data");
    const result = await response.json();

    let summary = document.getElementById("months_summary");
    summary.querySelector("#total").textContent += `$${result.total.toFixed(2)}`;
    summary.querySelector("#avg").textContent += `$${result.avg.toFixed(2)}`;
    summary.querySelector("#over_budget").textContent += `$${result.over_budget.toFixed(2)}`;

    let chartCanvas = document.getElementById("spending_chart-months");

    let colors = Array(result.spent.length).fill("rgba(8, 145, 8, 0.59)");

    let labels = result.dates;
    let values = result.spent;
    let budget = result.budget;

    await createSpendingCharts(chartCanvas, colors, labels, values, budget);

    let chartCanvas2 = document.getElementById("categories_months-frequency");
    let chartCanvas3 = document.getElementById("categories_months-values");
    let categories = Object.keys(result.categories);
    let catCounts = Object.values(result.categories).map(data => data.count)
    let catValues = Object.values(result.categories).map(data => data.value)
    console.log(categories)
    console.log(catCounts)
    console.log(catValues)
    for (const key in result.categories) {
        console.log(result.categories[key].count + " " + key + " " + result.categories[key].value)
    }

    await createCategoriesCharts(chartCanvas2, categories, catCounts, "frequency")
    await createCategoriesCharts(chartCanvas3, categories, catValues, "values")
}

async function createSpendingCharts(chartCanvas, colors, labels, values, budget) {
    // Store data in array
    let data = {
        labels: labels,
        // Bars data
        datasets: [{
            data: values,
            backgroundColor: colors,
            order: 2,
            borderColor: "green",
            borderWidth: 2,
            label: "spent"
        }, 
        // Average line data
        {
            data: budget,
            type: "line",
            borderColor: "green",
            pointRadius: 0,
            pointHitRadius: 100,
            tension: 0,
            label: "budget",
            order: 1,
        }
        ]
    }

    // Create new chart
    new Chart(
        // element to be drawn on
        chartCanvas, {

        // plug in data
        type: "bar",
        data: data,

        // customizations
        options: {   
            responsive: true,
            plugins: {
                // No title or legend display
                legend: {
                    display: true,
                },
                title: {
                    display: false,
                },

                // Label units
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.parsed.y;
                            return `$${value.toFixed(2)}`
                        }
                    }
                }
            },

            // Axes scaling
            scales: {
                x: {
                    ticks: {
                        padding: 0
                    },
                    grid: {
                        offset: true
                    },
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    })   
}

async function createCategoriesCharts(chartCanvas, labels, values, type) {
    // Store data in array
    let data = {
        labels: labels,
        datasets: [{
            data: values
        }]
    }

    // Create new chart
    return new Chart(
        // Element to be drawn on
        chartCanvas, {

        // Plug in data
        type: "pie",
        data: data,

        // Customizations
        options: {
            responsive: true,
            plugins: {
                // Hide title
                title: {
                    display: false,
                },
                tooltip: {
                    // Label units
                    callbacks: {
                        label: (context) => {
                            const value = context.parsed;
                            if (type == "frequency") {
                                return `${value} transactions`
                            }
                            return `$${value.toFixed(2)}`
                        }
                    }
                }
            }
        }
    })
}


let tabBtns = document.querySelectorAll(".tab-btn");
tabBtns.forEach(button => {
    button.addEventListener("click", () => {
        let tabName = button.id;
        
        const tabs = document.querySelectorAll('.tab-content');
        const buttons = document.querySelectorAll('.tab-btn');
        
        tabs.forEach(tab => tab.classList.add('hidden'));
        buttons.forEach(btn => btn.classList.remove('active'));
        
        document.getElementById(`${tabName}-tab`).classList.remove('hidden');
        buttons.forEach(btn => {
            if (btn.textContent.includes(tabName === 'month' ? 'This Month' : 'Past 6')) {
                btn.classList.add('active');
            }
        });
    })
});

await createWeeksCharts();
await createMonthsCharts();