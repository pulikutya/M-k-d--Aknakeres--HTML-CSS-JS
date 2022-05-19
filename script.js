function randomIntBetween(min, max)
{
    return Math.floor(Math.random() * (max - min) + min);
}



var map = [];
var reveal_map = [];
const Game_Grid_Container = document.querySelector(".Game-Grid-Container")
const Number_Colors = [undefined, "blue", "green", "red", "purple", "yellow", "brown", "grey", "lightdrey"]

var width = 5;
var height = 5;

function GenerateOneDiv(x, y)
{
	let crn = document.createElement("div");
	crn.classList.add("Game-Grid-Element");
	crn.id = `${x},${y}`;
	crn.onclick =GridElement_LeftClick;
	Game_Grid_Container.appendChild(crn);
	return crn;
}

function GenerateMap()
{
	ClearMap();
	for(w = 0; w < width; w++)
	{
		map.push([]);
		reveal_map.push([]);
		for(h = 0; h < height; h++)
		{
			map[w].push(GenerateOneDiv(w, h));
			SetField(w, h, "E")
			reveal_map.push(false);
		}
	}
}

function ClearMap()
{
	Game_Grid_Container.innerHTML = "";
	map = [];
}

function GetGridElement(x, y)
{
	return document.getElementById(`${x},${y}`)
}

function GetField(x, y)
{
	return map[x][y];
}



function SetField(x, y, value) //M is mine, F is flag, E is empty, an number is any number in *INT type!!*
{
	map[x][y] = `${value}`;
	let crn = GetGridElement(x, y);
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
			img.src = "empty.png";
			img.alt = " ";
			crn.appendChild(img);
			img.id =`${x},${y}` ;*/
			break;
		}
		default:
			if(value >= 0 && value <= 8)
			{
				crn.innerText = `${value}`
				crn.style.color = Number_Colors[value];
			}
			else
			{
				throw new Error("buszjegy");
			}
	}
}

function GridElement_LeftClick(e)
{
	console.log(e.path[0].id);
}

function PlaceMinesAndNumbers(count)
{
	for(let i = 0; i < count; i++)
	{
		
	}
}

function Reveal(x, y)
{

}

GenerateMap();
SetField("0", "0", "M");
SetField("0", "2", "F");