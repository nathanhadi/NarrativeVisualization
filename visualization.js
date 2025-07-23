
// Dictionary to pull state names from abbreviations for details on demand
const state_names = {
    'AL': 'Alabama',
    'AK': 'Alaska',
    'AZ': 'Arizona',
    'AR': 'Arkansas',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DE': 'Delaware',
    'FL': 'Florida',
    'GA': 'Georgia',
    'HI': 'Hawaii',
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'IA': 'Iowa',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'ME': 'Maine',
    'MD': 'Maryland',
    'MA': 'Massachusetts',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MS': 'Mississippi',
    'MO': 'Missouri',
    'MT': 'Montana',
    'NE': 'Nebraska',
    'NV': 'Nevada',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NY': 'New York',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VT': 'Vermont',
    'VA': 'Virginia',
    'WA': 'Washington',
    'WV': 'West Virginia',
    'WI': 'Wisconsin',
    'WY': 'Wyoming'
};

let svg1, svg2, svg3;
let tooltip;
let collegeData = null;

function initializeVisualization() {

    svg1 = d3.select("#chart_1")
        .append("svg")
        .attr("width", 1100)
        .attr("height", 700)
        .append("g")
        .attr("transform", "translate(90,40)");
        
    svg2 = d3.select("#chart_2")
        .append("svg")
        .attr("width", 1100)
        .attr("height", 700)
        .append("g")
        .attr("transform", "translate(130,40)");
        
    svg3 = d3.select("#chart_3")
        .append("svg")
        .attr("width", 1100)
        .attr("height", 700)
        .append("g")
        .attr("transform", "translate(130,40)");

    // Create dropdown for Scene 1
    let dropdown_1 = d3.select("#dropdown_1")
        .append("select")
        .attr("id", "college_type")
        .on("change", function() {
            createScene1(this.value);
        })
    
    dropdown_1.append("option").attr("value", "all").text("All");
    dropdown_1.append("option").attr("value", "public").text("Public");
    dropdown_1.append("option").attr("value", "private").text("Private");

    let currentScene = 1;
    
    // Next buttton
    d3.select("#next-button")
        .on("click", function() {
            if (currentScene === 1) {
                currentScene = 2;
                createScene2();
            } else if (currentScene === 2) {
                currentScene = 3;
                createScene3();
            }
            updateScenes();
        });
    
    // Previous button
    d3.select("#prev-button")
        .on("click", function() {
            if (currentScene === 2) {
                currentScene = 1;
                createScene1();
            } else if (currentScene === 3) {
                currentScene = 2;
                createScene2();
            }
            updateScenes();
        });
    
    // Updates scenes based on current scene and display correct buttons
    function updateScenes() {
        d3.select("#scene1-container").style("display", "none");
        d3.select("#scene2-container").style("display", "none");
        d3.select("#scene3-container").style("display", "none");
        
        d3.select(`#scene${currentScene}-container`).style("display", "block");
        
        if (currentScene === 1) {
            d3.select("#prev-button").style("display", "none");
            d3.select("#next-button").style("display", "inline-block").text("Next");
        } else if (currentScene === 2) {
            d3.select("#prev-button").style("display", "inline-block").text("Previous");
            d3.select("#next-button").style("display", "inline-block").text("Next");
        } else if (currentScene === 3) {
            d3.select("#prev-button").style("display", "inline-block").text("Previous");
            d3.select("#next-button").style("display", "none");
        }
    }
    
    updateScenes();

    // Hide details on click off the bar
    document.addEventListener('click', function(event) {        
        if (!event.target.matches('rect')) {
            d3.select(".tooltip").style("opacity", 0);
            d3.selectAll("rect").classed("selected", false);
        }
    });

    // Create tooltip for details on demand
    tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");
}

// Scene 1: Average Tuition by State - Bar Chart
function createScene1(college_type = "all") {
    svg1.selectAll("*").remove();
    if (!collegeData) return;

    let tooltip = d3.select(".tooltip");

    let filteredData = collegeData;
    if (college_type === "public") {
        filteredData = collegeData.filter(d => d.CONTROL === "1");
    } else if (college_type === "private") {
        filteredData = collegeData.filter(d => d.CONTROL === "2" || d.CONTROL === "3");
    }

    // Calculate average tuition by state
    let averagesByState = d3.rollup(filteredData,
        v => ({
            avg: d3.mean(v, d => +d.COSTT4_A),
            count: v.length
        }),
        d => d.STABBR
    );

    // Convert data to be used in bar chart
    let barChartData = Array.from(averagesByState, ([state, data]) => ({
        state: state,
        cost: data.avg,
        count: data.count
    }))
    .sort((a, b) => a.cost - b.cost);

    // Create scales for x and y axes
    const x = d3.scaleBand()
        .range([0, 940])
        .domain(barChartData.map(d => d.state))
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(barChartData, d => d.cost)])
        .range([580, 0]);

    // Add x axis
    svg1.append("g")
        .attr("transform", "translate(0,580)")
        .call(d3.axisBottom(x))
        
    svg1.append("text")
        .attr("x", 470)
        .attr("y", 620)
        .attr("text-anchor", "middle")
        .text("State");

    // Add y axis
    svg1.append("g")
        .call(d3.axisLeft(y).tickFormat(d => `$${d/1000}K`));

    svg1.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -290)
        .attr("text-anchor", "middle")
        .text("Average Annual Tuition Cost");

    // Add bars with transition
    svg1.selectAll("rect")
        .data(barChartData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.state))
        .attr("y", 580)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", "#80BAE7")
        .on("click", function(event, d) {
            svg1.selectAll("rect").classed("selected", false);
            d3.select(event.currentTarget).classed("selected", true);

            // Show tooltip
            tooltip.html(
                `<strong>${state_names[d.state]}</strong><br/>` +
                `Average Cost: $${Math.round(d.cost).toLocaleString()}<br/>` +
                `Number of Schools: ${d.count}`
            )
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY) + "px")
            .style("opacity", 1);
        })
        .transition()
        .duration(700)
        .attr("y", d => y(d.cost))
        .attr("height", d => 580 - y(d.cost));

    // Add title
    let titleText = "";
    if (college_type == "public") {
        titleText = "Public Colleges"
    } else if (college_type == "private") {
        titleText = "Private Colleges";
    } else {
        titleText = "All Colleges";
    }

    svg1.append("text")
        .attr("x", 470)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text(`Average College Tuition by State - ${titleText}`);

    addAnnotation(svg1, "Click bars for details");
}

// Scene 2: Compare Tuition vs Income 10 Years after graduation
function createScene2() {
    svg2.selectAll("*").remove();
    if (!collegeData) return;
    
    // Filter data for scatter plot
    // Get only tuition cost and income after 10 years that is not 0
    // And tuiton greater than 10000 and income greater than 20000 to spread data more
    let scatterPlotData = collegeData.filter(
        d => !isNaN(Number(d.COSTT4_A)) && 
            !isNaN(Number(d.MD_EARN_WNE_P10)) &&
            Number(d.COSTT4_A) > 10000 &&
            Number(d.MD_EARN_WNE_P10) > 20000 &&
            state_names.hasOwnProperty(d.STABBR)
    );

    // Create scales for x and y axes
    const x = d3.scaleLinear()
        .domain([10000, d3.max(scatterPlotData, d => Number(d.COSTT4_A))])
        .range([0, 940]);

    const y = d3.scaleLinear()
        .domain([20000, d3.max(scatterPlotData, d => Number(d.MD_EARN_WNE_P10))])
        .range([580, 0]);

    // Add x axis
    svg2.append("g")
        .attr("transform", "translate(0,580)")
        .call(d3.axisBottom(x).tickFormat(d => `$${d/1000}K`));

    svg2.append("text")
        .attr("x", 470)
        .attr("y", 620)
        .attr("text-anchor", "middle")
        .text("Annual Tuition Cost");

    // Add y axis
    svg2.append("g")
        .call(d3.axisLeft(y).tickFormat(d => `$${d/1000}K`));
    
    svg2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -290)
        .attr("text-anchor", "middle")
        .text("Average Annual Income 10 Years After Graduation");

    // Create scatter plot
    svg2.selectAll("circle")
        .data(scatterPlotData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.COSTT4_A))
        .attr("cy", d => y(d.MD_EARN_WNE_P10))
        .attr("r", 7)
        .attr("fill", "#80BAE7")
        .attr("opacity", 0.6)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 10).attr("opacity", 1).attr("fill", "red");
            tooltip.style("opacity", 1)
                .html(
                    `${d.INSTNM}<br/>
                    State: ${state_names[d.STABBR]}<br/>
                    Tuition: $${Number(d.COSTT4_A).toLocaleString()}<br/>
                    Income: $${Number(d.MD_EARN_WNE_P10).toLocaleString()}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 7).attr("opacity", 0.6).attr("fill", "#80BAE7");
            tooltip.style("opacity", 0);
        });

    svg2.append("text")
        .attr("x", 470)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text("Tuition Cost vs. Income (10 Years) After Graduation");

    addAnnotation(svg2, "Hover for school details");
}

// Scene 3: User Exploration with filters -> Income, Tuition, Number of Students, State, College Type
function createScene3() {
    svg3.selectAll("*").remove();
    if (!collegeData) return;

    // Add states to state filter
    Object.keys(state_names).forEach(state => {
        d3.select("#state-filter").append("option").attr("value", state).text(state_names[state]);
    });

    // Event listeners for filters
    d3.select("#income-min").on("input", updateScene3);
    d3.select("#tuition-max").on("input", updateScene3);
    d3.select("#students-min").on("input", updateScene3);
    d3.select("#college-type-filter").on("change", updateScene3);
    d3.select("#state-filter").on("change", updateScene3);

    updateScene3();
}

function updateScene3() {
    let incomeFilter = Number(d3.select("#income-min").property("value"));
    let tuitionFilter = Number(d3.select("#tuition-max").property("value"));
    let studentsFilter = Number(d3.select("#students-min").property("value"));
    let collegeTypeFilter = d3.select("#college-type-filter").property("value");
    let stateFilter = d3.select("#state-filter").property("value");

    // Update filter values displayed
    d3.select("#income-display").text(`$${incomeFilter/1000}K`);
    d3.select("#tuition-display").text(`$${tuitionFilter/1000}K`);
    d3.select("#students-display").text(`${studentsFilter/1000}K`);

    // Filter out scatterplot data based on filters
    // Exclude any colleges that have 0 tuition, income, or students
    let scatterPlotData = collegeData.filter(
        d => !isNaN(Number(d.COSTT4_A)) && 
        !isNaN(Number(d.MD_EARN_WNE_P10)) &&
        !isNaN(Number(d.UGDS)) &&
        Number(d.COSTT4_A) > 10000 &&
        Number(d.MD_EARN_WNE_P10) > 20000 &&
        Number(d.UGDS) > 0 &&
        state_names.hasOwnProperty(d.STABBR) &&
        Number(d.COSTT4_A) <= tuitionFilter &&
        Number(d.MD_EARN_WNE_P10) >= incomeFilter &&
        Number(d.UGDS) >= studentsFilter &&
        (collegeTypeFilter === "all" || 
            (collegeTypeFilter === "public" && d.CONTROL === "1") ||
            (collegeTypeFilter === "private" && (d.CONTROL === "2" || d.CONTROL === "3"))) &&
        (stateFilter === "all" || d.STABBR === stateFilter)
    );

    // Draw the scatterplot
    svg3.selectAll("*").remove();

    // Create scales for x and y axes
    const x = d3.scaleLinear()
        .domain([10000, d3.max(scatterPlotData, d => Number(d.COSTT4_A))])
        .range([0, 940]);

    const y = d3.scaleLinear()
        .domain([20000, d3.max(scatterPlotData, d => Number(d.MD_EARN_WNE_P10))])
        .range([580, 0]);

    // Add x axis
    svg3.append("g")
        .attr("transform", "translate(0,580)")
        .call(d3.axisBottom(x).tickFormat(d => `$${d/1000}K`));

    svg3.append("text")
        .attr("x", 470)
        .attr("y", 620)
        .attr("text-anchor", "middle")
        .text("Annual Tuition Cost");

    // Add y axis
    svg3.append("g")
        .call(d3.axisLeft(y).tickFormat(d => `$${d/1000}K`));
    
    svg3.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -290)
        .attr("text-anchor", "middle")
        .text("Average Annual Income 10 Years After Graduation");
    
    // Create scatter plot
    svg3.selectAll("circle")
        .data(scatterPlotData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.COSTT4_A))
        .attr("cy", d => y(d.MD_EARN_WNE_P10))
        .attr("r", 7)
        .attr("fill", "#80BAE7")
        .attr("opacity", 0.6)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 10).attr("opacity", 1).attr("fill", "red");
            tooltip.style("opacity", 1)
                .html(
                    `${d.INSTNM}<br/>
                    State: ${state_names[d.STABBR]}<br/>
                    Tuition: $${Number(d.COSTT4_A).toLocaleString()}<br/>
                    Income: $${Number(d.MD_EARN_WNE_P10).toLocaleString()}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 7).attr("opacity", 0.6).attr("fill", "#80BAE7");
            tooltip.style("opacity", 0);
        });

    svg3.append("text")
        .attr("x", 470)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text("Tuition Cost vs. Income After Graduation");

    addAnnotation(svg3, "Hover for school details");
}

function addAnnotation(svg, text, x = 100, y = 50) {
    svg.select(".annotation").remove();

    const annotation = svg.append("g").attr("class", "annotation");

    annotation.append("rect")
        .attr("x", x - 10)
        .attr("y", y - 20)
        .attr("width", 180)
        .attr("height", 30)
        .attr("fill", "lightgray")
        .attr("opacity", 0.5)
        .attr("stroke-width", 2);

    annotation.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-weight", "bold")
        .text(text);
}

async function loadCollegeData() {
    collegeData = await d3.csv("cleaned_college_data.csv");
    initializeVisualization();
    createScene1("all");
}

loadCollegeData();