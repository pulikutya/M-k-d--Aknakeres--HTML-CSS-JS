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

function UpdateSlider(ins, out, text)
{
	out.innerText = `${text}: ${ins.value}`
	LimitMineSlider();
}

function LimitMineSlider()
{
	MineNumberSlider.max = Math.floor(WidthSlider.value * HeightSlider.value / 3);
	MineNumberSlider.min = Math.floor(WidthSlider.value * HeightSlider.value / 20);
}

NewGameButton.onclick = function() {
	NewGame(WidthSlider.value, HeightSlider.value, MineNumberSlider.value);
}

WidthSlider.onclick = function(e) {UpdateSlider(WidthSlider, WidthSliderOUT, "Width")}
HeightSlider.onclick = function(e) {UpdateSlider(HeightSlider, HeightSliderOUT, "Height")}
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

var width = 7;
var height = 7;
var mines = 5;

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
		newh= height;
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

function SetRevealField(x, y, value) //F is flag E is empty (unrevealed) S is use the map, so reveal the field
{
	let crn = GetGridElement(x, y);
	reveal_map[x][y] = value;
	crn.innerHTML = "";
	switch (value)
	{
		case "F":
		{
			let img = document.createElement("img");
			img.src = "flag.png";
			img.alt = "F";
			img.id =`${x},${y}` ;
			crn.appendChild(img);
			break;
		}
		case "E":
		{
			/*let img = document.createElement("img");
			img.src = "Empty.png";
			img.alt = " ";
			img.id =`${x},${y}` ;
			crn.appendChild(img);*/
			break;
		}
		default: //checking map cases
		{
			switch(map[x][y])
			{
				case "M":
				{
					let img = document.createElement("img");
					img.src = "mine.png";
					img.alt = "M";
					img.id =`${x},${y}` ;
					crn.appendChild(img);
					break;
				}
				case "E":
				{
					/*let img = document.createElement("img");
					img.src = "Empty.png";
					img.alt = " ";
					img.id =`${x},${y}` ;
					crn.appendChild(img);*/
					break;
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
				}
			}
		}
	}
	
}

function DivIdToCoords(id) //converts the div id for example "#2,3" to coords: [2, 3]
{
	return id.split(",");
}

function GridElement_LeftClick(e) //left click event when clicked on a field
{
	c = DivIdToCoords(e.target.id);
	console.log("click: " + c);
	if(firststep)
	{
		PlaceMinesAndNumbers(mines, c);
		firststep = false;
	}
	UserLeftClickField(c[0], c[1]);
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
	
	console.log(`startpoint: ${startpoint};`)
	for(let i = 0; i < count; i++)
	{
		let r = null;
		while(r == null || map[r[0]][r[1]] == "M" || ArrayIncludes(d, r))
		{
	
			r = [randomIntBetween(0, width), randomIntBetween(0, height)];
		}
		map[r[0]][r[1]] = "M";
		console.log(`mine: ${r}`)
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


function RevealUser(x, y) //returns true if there is a mine
{
	if(reveal_map[x][y] == "E")
	{
		SetRevealField(x, y, map[x][y]);
		AutoReveal0(x, y);
		if(map[x][y] == "M")
		{
			Lose();
			return true;
		}
		else
		{
			notminescounter++;
		}
		return false;
	}
}
let notminescounter = 0;
function CheckWin()
{
	
	
	if(width * height - notminescounter == mines)
	{
		return Win();
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
	alert("maga nyert")
}


function Lose()
{
	LoseAnimation();
}

function LoseAnimation()
{
	let v =document.createElement("video");
	v.src="explosion.mp4"
	v.onended = LoseAnimationEnd;
	v.alt ="sus"
	v.id = "explosion"
	document.querySelector("#body").appendChild(v);
	v.play();
}

function LoseAnimationEnd()
{
	const time = 100000000;
	setTimeout(console.log(10), document.querySelector("#explosion").remove());
	
}

let firststep = true;

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
}

UpdateSlider(WidthSlider, WidthSliderOUT, "width");
UpdateSlider(HeightSlider, HeightSliderOUT, "height");
UpdateSlider(MineNumberSlider, MineNumberSliderOUT, "mines");

NewGame(7, 7, 20);