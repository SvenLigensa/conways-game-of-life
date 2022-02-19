var width = widthField.value;
var height = heightField.value;
var running = false;
var showSettings = false;
var intervalID;

var rules = [
    [false, false, false, true, false, false, false, false, false], /* S */
    [false, false, true, true, false, false, false, false, false] /* B */
];

const root = document.documentElement;
const settingsIcon = document.getElementById("settingsIcon");
const grid = document.getElementById("grid");
const startStop = document.getElementById("startStop"); /* Footer button to start or stop simulation */
const upsSlider = document.getElementById("upsSlider"); /* Slider setting the Updates per Second */
const primaryColor = document.getElementById("primary");
const secondaryColor = document.getElementById("secondary");

function generateEmptyState()
{
    let state = [];
    for (let row = 0; row < height; ++row) {
        let row = [];
        for (let col = 0; col < width; ++col) {
            row.push(false);
        }
        state.push(row);
    }
    return state;
}

function toggleSettings()
{
    showSettings = !showSettings;
    settingsIcon.classList.toggle("open");
    if (showSettings) {
        document.getElementById("overlay").style.display = "block";
        document.getElementById("settings").style.display = "block";
    }
    else {
        commitSettings();
        document.getElementById("overlay").style.display = "none";
        document.getElementById("settings").style.display = "none";
    }
}

function commitSettings()
{
    // Commit size of grid
    let newWidth = (widthField.value >= 1 && widthField.value <= 300) ? widthField.value : width;
    let newHeight = (heightField.value >= 1 && heightField.value <= 300) ? heightField.value : height;
    if (newWidth !== width || newHeight !== height) {
        width = newWidth;
        height = newHeight;
        generateGrid(width, height, generateEmptyState());
    }

    // Commit variation
    let newBorn = variationBorn.value;
    let newSurvive = variationSurvive.value;
    for (let i = 0; i < rules[0].length; ++i) {
        rules[0][i] = (newBorn.includes(i.toString())) 
        rules[1][i] = (newSurvive.includes(i.toString()))
    }

    // Commit new speed
    updateUps();

    // Commit new colors
    var hsl1 = hexToHSL(primaryColor.value);
    var hsl2 = hexToHSL(secondaryColor.value);
    root.style.setProperty("--primary-light", "hsl(" + hsl1[0] + ", " + hsl1[1] + "%, " + hsl1[2] + "%");
    root.style.setProperty("--primary-dark", "hsl(" + hsl1[0] + ", " + hsl1[1] + "%, " + hsl1[2] * 2/3 + "%");
    root.style.setProperty("--secondary", "hsl(" + hsl2[0] + ", " + hsl2[1] + "%, " + hsl2[2] + "%");
}

// hex in form: #rrggbb
function hexToHSL(hex)
{
    var r = parseInt(hex.substring(1, 3), 16);
    var g = parseInt(hex.substring(3, 5), 16);
    var b = parseInt(hex.substring(5, 7), 16);
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max == min) {
        h = s = 0;
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
        case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
        case g:
            h = (b - r) / d + 2;
            break;
        case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
    }
    let hsl = [];
    hsl[0] = Math.round(360 * h);
    s = s * 100;
    hsl[1] = Math.round(s);
    l = l * 100;
    hsl[2] = Math.round(l);
    return hsl;
}

function generateGrid(width, height, state)
{
    // Clear existing grid
    while(grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }
    
    // Create new grid with specified width and height
    for (let row = 0; row < height; ++row) {
        let tableRow = document.createElement("tr");
        for (let column = 0; column < width; ++column) {
            let tableCell = document.createElement("td");
            if (state[row][column]) tableCell.classList.add("living");
            tableCell.addEventListener('click', function(){
                if (!running) tableCell.classList.toggle("living");
            });
            tableRow.appendChild(tableCell);
        }
        grid.appendChild(tableRow);
    }
}

function toggleSimulation()
{
    running = !running;
    updateUps();
    if (running) startStop.innerText = "Stop";
    else startStop.innerText = "Start";
}

function updateUps()
{
    if (running) {
        if (intervalID)
            window.clearInterval(intervalID);
        intervalID = window.setInterval(update, 1000/upsSlider.value);
    }
    else window.clearInterval(intervalID);
}

function readState()
{
    let state = [];
    for(let row of grid.childNodes.values()) {
        let rowState = [];
        for (let cell of row.childNodes.values()) {
            rowState.push(cell.classList.contains("living"));
        }
        state.push(rowState);
    }
    return state;
}

function update()
{
    let oldState = readState();
    let newState = [];

    for (let row = 0; row < height; ++row) {
        let newRowState = [];
        for (let column = 0; column < width; ++column) {
			let numberOfLivingNeighbours = 0;
            for (let rowOffset = -1; rowOffset <= 1; ++rowOffset) {
                if (row + rowOffset < 0 || row + rowOffset >= height) continue;
                for (let columnOffset = -1; columnOffset <= 1; ++columnOffset) {
                    if (column + columnOffset < 0 || column + columnOffset >= width) continue;
                    if (rowOffset === 0 && columnOffset === 0) continue;
                    if (oldState[row + rowOffset][column + columnOffset]) ++numberOfLivingNeighbours;
                }
            }
            newRowState.push(rules[oldState[row][column] ? 1 : 0][numberOfLivingNeighbours]);
        }
        newState.push(newRowState);
    }
    generateGrid(width, height, newState);
}

generateGrid(width, height, generateEmptyState());
