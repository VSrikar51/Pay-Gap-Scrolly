const margin = {top:50, right: 80, bottom: 60, left: 70}
const width = 800 - margin.right - margin.left;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#timeline-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("data/timeline-data.csv").then(data => {
    data.forEach(d => {
        d.year = +d.year;
        d.ratio = +d.ratio;
    });

    const xScale = d3.scaleLinear()
        .domain([1979,2023])
        .range([0,width]);
    
    const yScale = d3.scaleLinear()
        .domain([55, 90])
        .range([height,0]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(10);
    const yAxis = d3.axisLeft(yScale).tickFormat(d => d + "%");

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);
    
    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    svg.append("g")
        .attr("class","grid")
        .call(d3.axisLeft(yScale)
            .tickSize(-width)
            .tickFormat("")
        );

    svg.append("text")
        .attr("class", "x-label")
        .attr("x", width/2)
        .attr("y", height+50)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Year");
        
    svg.append("text")
        .attr("class", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Women's Earnings as % of Men's");

    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "700")
        .style("fill", "#2c3e50")
        .text("The Stagnant Progrss towards Pay Equity")

    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.ratio))
        .curve(d3.curveMonotoneX);

    const path = svg.append("path")
                    .datum(data)
                    .attr("class","line")
                    .attr("fill", "none")
                    .attr("stroke","#667eea")
                    .attr("stroke-width", 3)
                    .attr("d", line);
                
    const totalLength = path.node().getTotalLength();

    path.attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(2000)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);

    svg.selectAll(".data-point")
        .data(data)
        .enter()
        .append('circle')
        .attr("class", "data-point")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.ratio))
        .attr("r", 0)
        .attr("fill", "#667eea")
        .transition()
        .delay((d,i) => i*40)
        .duration(500)
        .attr("r", 3);
    
    const tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
    
    d3.selectAll(".data-point")
        .on("mouseover", function(event,d){
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            
            tooltip.html(`<strong>${d.year}</strong><br/>
                        Women Earn <strong> ${d.ratio}%</strong><br/> of Men's Earnings`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 6);
        })
        .on("mouseout", function(){
            tooltip.transition().duration(500).style("opacity",0);
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 3);
        });

        const year2000Data = data.find(d => d.year === 2000);

        if(year2000Data){
            svg.append("line")
                .attr("class","annotation-line")
                .attr("x1", xScale(2000))
                .attr("y1", 0)
                .attr("x2", xScale(2000))
                .attr("y2", height)
                .attr("stroke", "#94a3b8")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray","5,5")
                .style("opacity",0)
                .transition()
                .delay(2500)
                .duration(500)
                .style("opacity", 0.5);

            svg.append("text")
                .attr("class", "annotation-text")
                .attr("x", xScale(2000)+5)
                .attr("y", yScale(85))
                .attr("text-anchor", "start")
                .style("font-size", "12px")
                .style("fill", "#64748b")
                .style("opacity",0)
                .text("Progress slows after 2000")
                .transition()
                .delay(2500)
                .duration(500)
                .style("opacity",1);

        }
});

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');


function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particleGroups = [
    {
        name: "White Men BA",
        count: 400,  // Reduced: each particle = $10,000 now
        actualAmount: 3889600,
        color: "#10b981",
        targetY: 0.15,
        active: true
    },
    {
        name: "White Women BA",
        count: 300,  // Reduced proportionally
        actualAmount: 2988960,
        color: "#f59e0b",
        targetY: 0.38,
        active: false
    },
    {
        name: "Black Women",
        count: 185,
        actualAmount: 1849120,
        color: "#ef4444",
        targetY: 0.62,
        active: false
    },
    {
        name: "Hispanic Women",
        count: 166,
        actualAmount: 1664000,
        color: "#ec4899",
        targetY: 0.82,
        active: false
    }
];


let particles = [];
let currentParticleStep = 0;

console.log("Particle system initializing...");
console.log("Groups:", particleGroups);



class Particle {
    constructor(x, y, group, groupIndex) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.group = group;
        this.groupIndex = groupIndex;
        this.radius = 4;
        this.alpha = 0.9;
    }
    
    update() {
        // Apply forces based on group
        if (this.group.active) {
            const targetY = canvas.height * this.group.targetY;
            const targetX = canvas.width / 2;
            
            // Attraction to target position
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                this.vx += dx * 0.0001;
                this.vy += dy * 0.0001;
            }
            
            // Damping
            this.vx *= 0.95;
            this.vy *= 0.95;
            
            // Update position
            this.x += this.vx;
            this.y += this.vy;
            
            // Boundaries
            if (this.x < 0) this.x = 0;
            if (this.x > canvas.width) this.x = canvas.width;
            if (this.y < 0) this.y = 0;
            if (this.y > canvas.height) this.y = canvas.height;
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.group.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

console.log("Particle class defined");

// Initialize particles - start with all groups in center
function initParticles() {
    particles = [];
    
    particleGroups.forEach((group, groupIndex) => {
        for (let i = 0; i < group.count; i++) {
            // Start all particles in center
            const x = canvas.width / 2 + (Math.random() - 0.5) * 100;
            const y = canvas.height / 2 + (Math.random() - 0.5) *100;
            particles.push(new Particle(x, y, group, groupIndex));
        }
    });
    
    console.log(`Created ${particles.length} particles`);
}

// Animation loop
function animate() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animate);
}

function drawGroupLabels() {
    ctx.font = 'bold 16px Segoe UI';
    ctx.textAlign = 'left';
    
    particleGroups.forEach((group, index) => {
        if (group.active) {
            const yPos = canvas.height * group.targetY;
            
            // Draw label background
            const labelText = `${group.name}: ${group.count.toLocaleString()} particles`;
            const textWidth = ctx.measureText(labelText).width;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(20, yPos - 20, textWidth + 20, 30);
            
            // Draw colored indicator
            ctx.fillStyle = group.color;
            ctx.beginPath();
            ctx.arc(30, yPos - 5, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw text
            ctx.fillStyle = '#1a1a2e';
            ctx.fillText(labelText, 45, yPos);
        }
    });
}

// Start when data loads
initParticles();
animate();

console.log("Particle system started!");

function updateChart(step){
    const stepNum = parseInt(step);
    const path = d3.select(".line");
    const circles = d3.selectAll(".data-point");

    // Timeline chart updates (steps 0-2)
    if(stepNum <= 2) {
        if(stepNum == 0){
            path.transition()
                .duration(1000)
                .attr("stroke", "#667eea")
                .attr("stroke-width", 3);

            circles.transition()
                .duration(1000)
                .attr("fill", "#667eea");
        }
        else if (stepNum == 1){
            path.transition()
                .duration(1000)
                .attr("stroke","#ef4444")
                .attr("stroke-width", 5);

            circles.transition()
                .duration(1000)
                .attr("fill","#ef4444");
        }
        else if (stepNum == 2){
            path.transition()
                .duration(1000)
                .attr("stroke", "#f59e0b")
                .attr("stroke-width", 4);

            circles.transition()
                .duration(1000)
                .attr("fill","#f59e0b");
        }
    }
    
    // Particle system updates (steps 3-6)
    if(stepNum >= 3 && stepNum <= 6) {
        updateParticleStep(stepNum - 3);
    }
}

// Update particle groups based on scroll step
function updateParticleStep(step) {
    console.log("Updating particles for step:", step);
    
    // Step 0 (scroll step 3): Only White Men active
    if (step === 0) {
        particleGroups[0].active = true;  // White Men
        particleGroups[1].active = false;
        particleGroups[2].active = false;
        particleGroups[3].active = false;
    }
    // Step 1 (scroll step 4): White Men + White Women
    else if (step === 1) {
        particleGroups[0].active = true;  // White Men
        particleGroups[1].active = true;  // White Women
        particleGroups[2].active = false;
        particleGroups[3].active = false;
    }
    // Step 2 (scroll step 5): Add Black Women
    else if (step === 2) {
        particleGroups[0].active = true;
        particleGroups[1].active = true;
        particleGroups[2].active = true;  // Black Women
        particleGroups[3].active = false;
    }
    // Step 3 (scroll step 6): All groups active
    else if (step === 3) {
        particleGroups[0].active = true;
        particleGroups[1].active = true;
        particleGroups[2].active = true;
        particleGroups[3].active = true;  // Hispanic Women
    }
}


const scroller =scrollama();

scroller.setup({
                step:".step",
                offset: 0.5,
                debug: false
            })
            .onStepEnter(response => {
                const step = response.element.dataset.step;
                document.querySelectorAll(".step").forEach(s => s.classList.remove("is-active"));
                response.element.classList.add("is-active");
                updateChart(step);
            });

window.addEventListener("resize", scroller.resize);
