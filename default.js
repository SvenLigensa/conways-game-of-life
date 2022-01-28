var running = false;
var width = widthField.value;
var height = heightField.value;
var intervalID;
var showSettings = false;

var rules = [
    [false, false, true, true, false, false, false, false, false],
    [false, false, false, true, false, false, false, false, false]
];

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

const settingsIcon = document.getElementById("settingsIcon");

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
}




const grid = document.getElementById("grid");
const startStop = document.getElementById("startStop");
const upsSlider = document.getElementById("upsSlider");

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
    if (running) {
        startStop.innerText = "Start";
        window.clearInterval(intervalID);
    } else {
        startStop.innerText = "Stop";
        intervalID = window.setInterval(update, 1000/upsSlider.value);
    }
    running = !running;
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
            newRowState.push(rules[oldState[row][column] ? 0 : 1][numberOfLivingNeighbours]);
        }
        newState.push(newRowState);
    }
    generateGrid(width, height, newState);
}

generateGrid(width, height, generateEmptyState());
