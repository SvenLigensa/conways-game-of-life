const root = document.documentElement;
const settingsIcon = document.getElementById("settingsIcon");
const grid = document.getElementById("grid");
const startStop = document.getElementById("startStop");
const upsSlider = document.getElementById("upsSlider") as HTMLInputElement;
const primaryColor = document.getElementById("primary") as HTMLInputElement;
const secondaryColor = document.getElementById("secondary") as HTMLInputElement;
const widthField = document.getElementById("widthField") as HTMLInputElement;
const heightField = document.getElementById("heightField") as HTMLInputElement;
const variationBorn = document.getElementById("variationBorn") as HTMLInputElement;
const variationSurvive = document.getElementById("variationSurvive") as HTMLInputElement;

var width = parseInt(widthField.value);
var height = parseInt(heightField.value);
var running: boolean = false;
var showSettings: boolean = false;
var intervalID: number;

var rules: boolean[][] = [
    [false, false, false, true, false, false, false, false, false], /* S */
    [false, false, true, true, false, false, false, false, false] /* B */
];

// Close settings, when ENTER is pressed and released
document.addEventListener('keyup', (e) => {
    if (e.key === "Enter" && showSettings) {
        toggleSettings();
    }
});

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
    let newWidth: number = (parseInt(widthField.value) >= 1 && parseInt(widthField.value) <= 200) ? parseInt(widthField.value) : width;
    let newHeight: number = (parseInt(heightField.value) >= 1 && parseInt(heightField.value) <= 200) ? parseInt(heightField.value) : height;
    if (newWidth !== width || newHeight !== height) {
        width = newWidth;
        height = newHeight;
        generateGrid(width, height, generateEmptyState());
    }
    
    // Commit new speed
    updateUps();
    
    // Commit variation
    let newBorn: string = variationBorn.value;
    let newSurvive: string = variationSurvive.value;
    for (let i: number = 0; i < rules[0].length; ++i) {
        rules[0][i] = (newBorn.includes(i.toString())) 
        rules[1][i] = (newSurvive.includes(i.toString()))
    }
    
    // Commit new colors
    var hsl1: number[] = hexToHSL(primaryColor.value);
    var hsl2: number[] = hexToHSL(secondaryColor.value);
    root.style.setProperty("--primary-light", "hsl(" + hsl1[0] + ", " + hsl1[1] + "%, " + hsl1[2] + "%");
    root.style.setProperty("--primary-dark", "hsl(" + hsl1[0] + ", " + hsl1[1] + "%, " + hsl1[2] * 2/3 + "%");
    root.style.setProperty("--secondary", "hsl(" + hsl2[0] + ", " + hsl2[1] + "%, " + hsl2[2] + "%");
}

// hex in form: #rrggbb
function hexToHSL(hex: string)
{
    var r: number = parseInt(hex.substring(1, 3), 16) / 255;
    var g: number = parseInt(hex.substring(3, 5), 16) / 255;
    var b: number = parseInt(hex.substring(5, 7), 16) / 255;
    var max: number = Math.max(r, g, b),
        min: number = Math.min(r, g, b);
        var hsl: number[] = [(max + min)/2, (max + min)/2, (max + min)/2];
        // var h, s, l = (max + min) / 2;
        if (max == min) {
            hsl[0] = hsl[1] = 0;
    } else {
        var d: number = max - min;
        hsl[1] = hsl[2] > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                hsl[0] = (g - b) / d + (g < b ? 6 : 0);
                break;
                case g:
                    hsl[0] = (b - r) / d + 2;
                    break;
                    case b:
                        hsl[0] = (r - g) / d + 4;
                        break;
                    }
                    hsl[0] /= 6;
                }
                hsl[0] = Math.round(360 * hsl[0]);
                hsl[1] = Math.round(hsl[1] * 100);
                hsl[2] = Math.round(hsl[2] * 100);
                return hsl;
            }
            
            function generateGrid(width, height, state)
{
    // Clear existing grid
    while(grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }
    
    // Create new grid with specified width and height
    for (let row: number = 0; row < height; ++row) {
        let tableRow: HTMLElement = document.createElement("tr");
        for (let column: number = 0; column < width; ++column) {
            let tableCell: HTMLElement = document.createElement("td");
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
        intervalID = window.setInterval(update, 1000/parseInt(upsSlider.value));
    }
    else window.clearInterval(intervalID);
}

function generateEmptyState()
{
    let state: boolean[][] = [];
    for (let row: number = 0; row < height; ++row) {
        let state_row: boolean[] = [];
        for (let col: number = 0; col < width; ++col) {
            state_row.push(false);
        }
        state.push(state_row);
    }
    return state;
}

function readState()
{
    let state: boolean[][] = [];
    Array.prototype.forEach.call(grid.childNodes, function(row: Node) {
        let rowState: boolean[] = [];
        Array.prototype.forEach.call(row, function(cell: Node, rowState: boolean[]) {
            rowState.push((cell as HTMLElement).classList.contains("living"));
        });
    });
    return state;
}

function update()
{
    let oldState: boolean[][] = readState();
    let newState: boolean[][] = [];

    for (let row: number = 0; row < height; ++row) {
        let newRowState: boolean[] = [];
        for (let column: number = 0; column < width; ++column) {
			let numberOfLivingNeighbours: number = 0;
            for (let rowOffset: number = -1; rowOffset <= 1; ++rowOffset) {
                if (row + rowOffset < 0 || row + rowOffset >= height) continue;
                for (let columnOffset: number = -1; columnOffset <= 1; ++columnOffset) {
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
