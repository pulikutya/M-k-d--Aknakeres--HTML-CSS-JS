function randomIntBetween(min, max)
{
    return Math.floor(Math.random() * (max - min) + min);
}

function CheckIfArray(obj)
{
	return obj.constructor.name == "Array";
}

function ArraysEqual(a, b)
{
	if(CheckIfArray(a) && CheckIfArray(b))
	{
		if(a.length === b.length)
		{
			for(let i = 0; i < a.length; i++)
			{
				if(!ArraysEqual(a[i], b[i])) return false;
			}
			return true;
		}
		else return false;
	}
	else return a === b;
}

var map = [];
var reveal_map = [];
var ControlMode = "C"; //C is just click, F is flag
const Game_Grid_Container = document.querySelector(".Game-Grid-Container");
const Number_Colors = [undefined, "blue", "green", "red", "purple", "yellow", "brown", "grey", "lightdrey"];
const ClickSelector = document.querySelector("#ClickSelector");
const FlagSelector = document.querySelector("#FlagSelector");


const NewGameButton = document.querySelector("#NewGameButton");

const WidthSlider = document.querySelector("#WidthSelector");
const HeightSlider = document.querySelector("#HeightSelector");
const MineNumberSlider = document.querySelector("#MineNumberSelector");

const WidthSliderOUT = document.querySelector("#WidthSelectorOut");
const HeightSliderOUT = document.querySelector("#HeightSelectorOut");
const MineNumberSliderOUT = document.querySelector("#MineNumberSelectorOut");

function UpdateSlider(ins, out, text, updatemineslider = true)
{
	out.innerText = `${text}: ${ins.value}`
	if(updatemineslider) { LimitMineSlider(); }
}

function LimitMineSlider()
{
	newmax = WidthSlider.value *  HeightSlider.value / 3;
	MineNumberSlider.value = Math.floor(MineNumberSlider.value / MineNumberSlider.max  * newmax);
	MineNumberSlider.max = Math.floor(newmax);
	MineNumberSlider.min = Math.floor(WidthSlider.value * HeightSlider.value / 20);
	UpdateSlider(MineNumberSlider, MineNumberSliderOUT, "Mines", false)
}

NewGameButton.onclick = function() {
	NewGame(parseInt(WidthSlider.value), parseInt(HeightSlider.value), parseInt(MineNumberSlider.value));
}

WidthSlider.onclick = function(e) {UpdateSlider(WidthSlider, WidthSliderOUT, "Height")}
HeightSlider.onclick = function(e) {UpdateSlider(HeightSlider, HeightSliderOUT, "Width")}
MineNumberSlider.onclick = function(e) {UpdateSlider(MineNumberSlider, MineNumberSliderOUT, "Mines")}

function ControlSelector_LeftClick(control)
{
	ClickSelector.removeAttribute("ActiveControlSelectorButton");
	FlagSelector.removeAttribute("ActiveControlSelectorButton");
	switch(control.target.id)
	{
		case "ClickSelector":
			ControlMode = "C";
			ClickSelector.classList.add("ActiveControlSelectorButton");
			FlagSelector.classList.remove("ActiveControlSelectorButton");
			break;
		case "FlagSelector":
			ControlMode = "F";
			FlagSelector.classList.add("ActiveControlSelectorButton");
			ClickSelector.classList.remove("ActiveControlSelectorButton");
			break;
	}
}

ClickSelector.onclick = ControlSelector_LeftClick;
FlagSelector.onclick = ControlSelector_LeftClick;

var width = 10;
var height = 10;
var mines = 20;

function GenerateOneDiv(x, y)
{
	let crn = document.createElement("div");
	crn.classList.add("Game-Grid-Element");
	crn.id = `${x},${y}`;
	crn.onclick =GridElement_LeftClick;
	Game_Grid_Container.appendChild(crn);
	return crn;
}

function setCssNewSize(w, h)
{
	Game_Grid_Container.style.gridTemplateColumns = `repeat(${h}, var(--squareSize))`;
	Game_Grid_Container.style.gridTemplateRows = `repeat(${w}, var(--squareSize))`; 
	
}

function GenerateMap(neww, newh)
{
	if(neww == undefined)
	{
		neww = width;
	}
	if(newh== undefined)
	{
		newh = height;
	}
	setCssNewSize(neww, newh);
	width = neww;
	height = newh;
	ClearMap();
	for(w = 0; w < width; w++)
	{
		map.push([]);
		reveal_map.push([]);
		for(h = 0; h < height; h++)
		{
			GenerateOneDiv(w, h);
			map[w].push("E");
			reveal_map[w].push("E");

		}
	}
}

function ClearMap()
{
	Game_Grid_Container.innerHTML = "";
	map = [];
	reveal_map = [];
}

function GetGridElement(x, y)
{
	return document.getElementById(`${x},${y}`);
}

function GetField(x, y)
{
	return map[x][y];
}

function SetMapField(x, y, value) //M is mine, F is flag, E is empty, an number is any number in *INT type!!* //UF Is "unflag"
{
	map[x][y] = `${value}`;
}

function MakeImgInDiv(crndiv, path, alt)
{
	let img = document.createElement("img");
	img.src = path;
	img.id = crndiv.id;
	crndiv.appendChild(img);
}

function SetRevealField(x, y, value) //F is flag E is empty (unrevealed) S is use the map, so reveal the field FW - wrong flag
{
	let crn = GetGridElement(x, y);
	reveal_map[x][y] = value;
	crn.innerHTML = "";
	switch (value)
	{
		case "F":
		{
			MakeImgInDiv(crn, "flag.png", "F"); break;
		}
		case "M":
		{
			MakeImgInDiv(crn, "mine.png", "M"); break;
		}
		case "FW":
		{
			MakeImgInDiv(crn, "flag_wrong.png", "FW"); break;
		}
		case "ME":
		{
			MakeImgInDiv(crn, "mine_exploded.png", "ME"); break;
		}
		case "E":
		{
			break;
		}
		default: //checking map cases
		{
			switch(map[x][y])
			{
				case "M":
				{
					SetMapField(x, y, "M"); break;
				}
				default:
				{
					if(value >= 0 && value <= 8)
					{
						crn.innerText = `${value}`;
						crn.style.color = Number_Colors[value];
					}
					else
					{
						throw new Error("van egy buszjegyed, javascript debuggingra kéne? (igen ez egy error)");
					}
					break;
				}
			}
			break;
		}
	}
	
}

function DivIdToCoords(id) //converts the div id for example "#2,3" to coords: [2, 3]
{
	return id.split(",");
}

function GridElement_LeftClick(e) //left click event when clicked on a field
{
	if(gamerunning)
	{
		c = DivIdToCoords(e.target.id);
		if(firststep && ControlMode == "C")
		{
			PlaceMinesAndNumbers(mines, c);
			firststep = false;
		}
		UserLeftClickField(c[0], c[1]);
	}
	
}

function GetNeighboorCells(x, y)
{
	NeighbourCoords = [];
	for(let w = -1; w < 2; w++) //these two x y loops lopp trhough all possibilities and cancel wrong like it is outside the border or the cell is the smae as the original. this is relative looping to the x and y.
	{
		for(let h = -1; h < 2; h++)
		{
			if(!((x+w < 0 || y+h < 0) || (x+w >= width || y+h >= height) || (w == 0 && h == 0)))
			{
				NeighbourCoords.push([x + w, y + h]);	
			}
		}
	}
	return NeighbourCoords;
}

function SurroundingMines(x, y) //gets the neighbour cells with mines only
{
	return GetNeighboorCells(x, y).filter(item => map[item[0]][item[1]] == "M");
}

function ArrayIncludes(array, item)
{
	for(let i = 0; i < array.length; i++)
	{
		if(ArraysEqual(array[i], item)) return true;
	}
	return false;
}

function PlaceMinesAndNumbers(count, startpoint) //startpoint is where the use clicks first
{
	let d = GetNeighboorCells(parseInt(startpoint[0]), parseInt(startpoint[1]));
	d.push([parseInt(startpoint[0]), parseInt(startpoint[1])] );
	for(let i = 0; i < count; i++)
	{
		let r = null;
		while(r == null || map[r[0]][r[1]] == "M" || ArrayIncludes(d, r))
		{
	
			r = [randomIntBetween(0, width), randomIntBetween(0, height)];
		}
		map[r[0]][r[1]] = "M";
	}
;
	for(let w = 0; w < width; w++)
	{
		for(let h = 0; h < height; h++)
		{
			if(map[w][h] == "E")
			{
				map[w][h] = SurroundingMines(w, h).length;
			}
		}
	}
}


var MineCounter = mines;
var MineCounterText = document.querySelector("#MineCounter")
function UpdateMineCounter()
{
	MineCounterText.innerText = `${MineCounter}`;
}


function RevealUser(x, y)
{
	if(reveal_map[x][y] == "E")
	{
		SetRevealField(x, y, map[x][y]);
		
		
		if(map[x][y] == "M")
		{
			Lose();
			
		}
		else
		{
			notminescounter++;
			if(map[x][y] == 0)
			{
			AutoReveal0(x, y);
			}
		}
		
	}
}
let notminescounter = 0;
function CheckWin()
{
	if(width * height - notminescounter == mines)
	{
		Win();
	}
} //returns L if lose W if win

function FlagMineUser(x, y)
{
	switch(reveal_map[x][y])
	{
		case "E":
			MineCounter--;
			SetRevealField(x, y, "F")
			break;
		case "F":
			MineCounter++;
			SetRevealField(x, y, "E");
			break;
	}
	UpdateMineCounter();
}

function AutoReveal0(x, y)
{
	
	if(reveal_map[x][y] == "0")
	{
		let a = GetNeighboorCells(x, y);
		for(let i = 0; i < a.length; i++)
		{
			RevealUser(a[i][0], a[i][1]);
		}
		
		return;
	}
}

function UserLeftClickField(sx, sy)
{
	let x = parseInt(sx);
	let y = parseInt(sy);
	switch(ControlMode)
	{
		case "C":
		{
			RevealUser(x, y);
			break;
		}
		case "F":
		{
			FlagMineUser(x, y);
			break;
		}
	}
	CheckWin();
}

function Win()
{
	gamerunning = false;
	alert("maga nyert");
	EndGameReveal();
}


function Lose()
{
	gamerunning = false;
	LoseAnimation();
	
}

function LoseAnimation()
{
	let v =document.createElement("video");
	v.src="explosion.mp4"
	v.onended = LoseAnimation2;
	v.alt ="sus"
	v.id = "explosion"
	document.querySelector("#body").appendChild(v);
	v.play();
}

function LoseAnimation2()
{
	document.querySelector("#explosion").remove();
	EndGameReveal();
}

let firststep = true;
var gamerunning = false;
function NewGame(w, h, smines)
{
	setCssNewSize(w, h);
	width = w;
	height = h;
	mines = smines;
	MineCounter = mines;
	UpdateMineCounter();
	GenerateMap();
	firststep = true;
	gamerunning = true;
	notminescounter = 0;
}

function EndGameReveal()
{
	for(let w = 0; w < width; w++)
	{
		for(let h = 0; h < height; h++)
		{
			switch(reveal_map[w][h]) 
			{
				case "M":
				{
					SetRevealField(w, h, "ME"); break;
				}
				case "F":
				{
					if(map[w][h] == "M")
					{
						SetRevealField(w, h, "F");
					}
					else
					{
						SetRevealField(w, h, "FW");
					}
					break;
				}
				default:
					if(map[w][h] == "M")
					{
						SetRevealField(w, h, "M");
					}
				break;
			}
			
		}
	}
}

UpdateSlider(WidthSlider, WidthSliderOUT, "height");
UpdateSlider(HeightSlider, HeightSliderOUT, "width");
UpdateSlider(MineNumberSlider, MineNumberSliderOUT, "mines");

NewGame(10, 10, 20);