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
        .attr("class","grid")
        .call(d3.axisLeft(yScale)
            .tickSize(-width)
            .tickFormat("")
        );

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);
    
    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

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
        .text("The Stagnant Progress Towards Pay Equity");

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
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
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
            
            tooltip.html(`<strong>${d.year}</strong><br/>Women Earn <strong>${d.ratio}%</strong><br/> of Men's Earnings`)
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

const baseline = {
    total: 3889600,
    particleCount: 389
};

const particleGroups = [
    {
        name: "White Men BA",
        earnings: 3889600,
        particleCount: 389,
        loss: 0,
        lossParticles: 0,
        color: "#10b981",
        targetY: 0.25,
        fallAway: false,
        active: true
    },
    {
        name: "White Women BA",
        earnings: 2988960,
        particleCount: 299,
        loss: 900640,
        lossParticles: 90,
        color: "#f59e0b",
        targetY: 0.65,
        fallAway: true,
        active: false
    },
    {
        name: "Black Women",
        earnings: 1849120,
        particleCount: 185,
        loss: 2040480,
        lossParticles: 204,
        color: "#ef4444",
        targetY: 0.75,
        fallAway: true,
        active: false
    },
    {
        name: "Hispanic Women",
        earnings: 1664000,
        particleCount: 166,
        loss: 2225600,
        lossParticles: 223,
        color: "#ec4899",
        targetY: 0.85,
        fallAway: true,
        active: false
    }
];

let particles = [];

class Particle {
    constructor(x, y, group, groupIndex, isFalling) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.group = group;
        this.groupIndex = groupIndex;
        this.radius = 3;
        this.alpha = 0.85;
        this.isFalling = isFalling || false;
        this.targetReached = false;
    }
    
    update() {
        if (!this.group.active) return;
        
        if (this.isFalling && this.group.fallAway) {
            const targetY = canvas.height * this.group.targetY;
            this.vy += 0.15;
            this.vy *= 0.98;
            this.vx += (Math.random() - 0.5) * 0.1;
            this.vx *= 0.95;
            this.y += this.vy;
            this.x += this.vx;
            
            if (this.y > targetY) {
                this.alpha *= 0.98;
            }
        } else {
            const targetY = canvas.height * 0.25;
            const targetX = canvas.width / 2;
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                this.vx += dx * 0.0005;
                this.vy += dy * 0.0005;
            }
            
            this.vx *= 0.92;
            this.vy *= 0.92;
            this.x += this.vx;
            this.y += this.vy;
        }
        
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width) this.x = canvas.width;
    }
    
    draw() {
        if (this.alpha < 0.05) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.group.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function initParticles() {
    particles = [];
    const startX = canvas.width / 2;
    const startY = canvas.height * 0.25;
    
    particleGroups.forEach((group, groupIndex) => {
        if (groupIndex === 0) {
            for (let i = 0; i < baseline.particleCount; i++) {
                const x = startX + (Math.random() - 0.5) * 120;
                const y = startY + (Math.random() - 0.5) * 120;
                particles.push(new Particle(x, y, group, groupIndex, false));
            }
        } else {
            for (let i = 0; i < group.particleCount; i++) {
                const x = startX + (Math.random() - 0.5) * 120;
                const y = startY + (Math.random() - 0.5) * 120;
                particles.push(new Particle(x, y, group, groupIndex, false));
            }
            
            for (let i = 0; i < group.lossParticles; i++) {
                const x = startX + (Math.random() - 0.5) * 120;
                const y = startY + (Math.random() - 0.5) * 120;
                particles.push(new Particle(x, y, group, groupIndex, true));
            }
        }
    });
}

function animate() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    drawGroupLabels();
    requestAnimationFrame(animate);
}

function drawGroupLabels() {
    ctx.font = 'bold 18px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(canvas.width / 2 - 150, 20, 300, 50);
    ctx.fillStyle = '#10b981';
    ctx.fillText('Baseline: $3.89M', canvas.width / 2, 40);
    ctx.font = '12px Segoe UI';
    ctx.fillStyle = '#666';
    ctx.fillText('White Men BA - 40 Year Career', canvas.width / 2, 58);
    ctx.font = 'bold 16px Segoe UI';
    ctx.textAlign = 'left';
    
    particleGroups.forEach((group, index) => {
        if (group.active && group.fallAway) {
            const yPos = canvas.height * group.targetY;
            const lossText = `-$${(group.loss / 1000000).toFixed(2)}M Lost`;
            const nameText = group.name;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fillRect(20, yPos - 35, 200, 50);
            ctx.fillStyle = group.color;
            ctx.beginPath();
            ctx.arc(35, yPos - 10, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1a1a2e';
            ctx.fillText(nameText, 55, yPos - 15);
            ctx.fillStyle = group.color;
            ctx.font = 'bold 14px Segoe UI';
            ctx.fillText(lossText, 55, yPos + 5);
            ctx.font = 'bold 16px Segoe UI';
        }
    });
}

initParticles();
animate();

function updateChart(step){
    const stepNum = parseInt(step);
    const path = d3.select(".line");
    const circles = d3.selectAll(".data-point");

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
    
    if(stepNum >= 3 && stepNum <= 6) {
        updateParticleStep(stepNum - 3);
    }
}

function updateParticleStep(step) {
    if (step === 0) {
        particleGroups[0].active = true;
        particleGroups[1].active = false;
        particleGroups[2].active = false;
        particleGroups[3].active = false;
    }
    else if (step === 1) {
        particleGroups[0].active = true;
        particleGroups[1].active = true;
        particleGroups[2].active = false;
        particleGroups[3].active = false;
    }
    else if (step === 2) {
        particleGroups[0].active = true;
        particleGroups[1].active = true;
        particleGroups[2].active = true;
        particleGroups[3].active = false;
    }
    else if (step === 3) {
        particleGroups[0].active = true;
        particleGroups[1].active = true;
        particleGroups[2].active = true;
        particleGroups[3].active = true;
    }
}

const scroller = scrollama();

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