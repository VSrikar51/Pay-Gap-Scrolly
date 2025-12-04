function init() {
    console.log("Initializing Pay Gap Visualization...");
    
    // Create bar chart
    createBarChart("bar-chart", barChartData);
    
    // Create violin chart
    createViolinChart("violin-chart", violinChartData);
    
    updateSummaryStats();
    
    console.log("Visualization loaded successfully!");
}


function updateSummaryStats() {
    // Find Black Women data
    const blackWomen = barChartData.find(d => d.group === "Black Women");
    const whiteMen = barChartData.find(d => d.group === "White Men");
    
    if (blackWomen && whiteMen) {

        document.getElementById("stat-gap").textContent = `${blackWomen.payGap}%`;
        
        const annualDiff = whiteMen.annualSalary - blackWomen.annualSalary;
        document.getElementById("stat-annual").textContent = `$${Math.round(annualDiff / 1000)}K`;
        
        document.getElementById("stat-ratio").textContent = `$${blackWomen.ratio.toFixed(2)}`;
    }
}

//Handle window resize

function handleResize() {
    // Debounce resize events
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        createBarChart("bar-chart", barChartData);
        createViolinChart("violin-chart", violinChartData);
    }, 250);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {

    init();
}

// Handle window resize
window.addEventListener("resize", handleResize);

