async function createChart() {
    const response = await fetch("/spent_data");
    const result = await response.json();
    
    let chartCanvas = document.getElementById("chart");

    let colors = Array(result.spent.length).fill("rgba(8, 145, 8, 0.59)");

    let labels = result.dates;
    let values = result.spent;
    let budget = result.budget;

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
    return new Chart(
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

await createChart()