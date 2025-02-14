async function get_json(path){
	var out;
	await fetch(path)
		.then((response) => response.json())
		.then((json) => {
			out = json;
		}
	);
	return out;
}

function save(){
	var slot = document.getElementById("slot").value
	localStorage.setItem("shipSlot" + slot, JSON.stringify(ship_data))

}
function load(){
	var slot = document.getElementById("slot").value
	var new_data = JSON.parse(localStorage.getItem("shipSlot" + slot))
	if (new_data){
		ship_data = new_data
	}else{
		ship_data = {
			"Holes": [],
			"Type" : 0,
			"WaterLevel": 0.0
		}
	}
	update_overlay()
}

function save_file(){
	const data = JSON.stringify(ship_data)
	const blob = new Blob([data], {type: 'type/plain'})
	const url = URL.createObjectURL(blob)
	const link = document.createElement("a")
	link.href = url
	link.download = "shipData.txt"
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}

async function openFilePicker() {
	try {
	  const handles = await window.showOpenFilePicker({ multiple: false });
	  const files = await Promise.all(handles.map(handle => handle.getFile()));
	  
	  var reader = new FileReader()
	  reader.readAsArrayBuffer(files[0])
	  reader.onloadend = function(){
		var enc = new TextDecoder("utf-8")
		ship_data = JSON.parse(enc.decode(reader.result))
		update_overlay()
	  }
	
	} catch (err) {
	  console.error("The user canceled the selection or an error occurred:", err);
	}
  }

function load_file(){
	openFilePicker()
}

function show_popup(element){
 	const popup = document.getElementById("popup")
 	if (popup.style.visibility == "visible"){
		if (popup.lastElementChild.getAttribute("innerText") == element.id){
			popup.style.visibility = "hidden";
		}
		else {
			popup.lastElementChild.setAttribute("innerText", element.id)
			popup.style.transform = `translate(${element.style.left}, ${element.style.top})`
		}
 	}
 	else {
		if (popup.lastElementChild.getAttribute("innerText") == element.id){
			popup.style.visibility = "visible";
		}
		else {
			popup.style.visibility = "visible";
			popup.lastElementChild.setAttribute("innerText", element.id)
			popup.style.transform = `translate(${element.style.left}, ${element.style.top})`
		}
	}
}

function keg(){
	var num_holes = Math.floor(Math.random() * 6) + 5
	var index = Math.floor(Math.random() * ship_data["Holes"].length)
	for (var i = index; i < num_holes + index; i++){
		if (i >= ship_data["Holes"].length){
			ship_data["Holes"][Math.abs(i - ship_data["Holes"].length)] =  Math.min(ship_data["Holes"][Math.abs(i - ship_data["Holes"].length)] + (Math.floor(Math.random() * 2) + 2), 3)
		}else{
			ship_data["Holes"][i] =  Math.min(ship_data["Holes"][i] + (Math.floor(Math.random() * 2) + 2), 3)
		}
	}
	update_overlay()
}

function meg(){
	var num_holes = Math.floor(Math.random() * 2) + 2
	var index = Math.floor(Math.random() * ship_data["Holes"].length)
	for (var i = index; i < num_holes + index; i++){
		if (i >= ship_data["Holes"].length){
			ship_data["Holes"][Math.abs(i - ship_data["Holes"].length)] =  Math.min(ship_data["Holes"][Math.abs(i - ship_data["Holes"].length)] + (Math.floor(Math.random() * 2) + 1), 3)
		}else{
			ship_data["Holes"][i] =  Math.min(ship_data["Holes"][i] + (Math.floor(Math.random() * 2) + 1), 3)
		}
	}
	update_overlay()
}

function unbucket(){
	var amount = parseInt(document.getElementById("amount").value)
	var water = ship_data["WaterLevel"]
	water += amount
	ship_data["WaterLevel"] = water

	update_overlay()
}

function bucket(){
	var disp = document.getElementById("bucket")
	var water = ship_data["WaterLevel"]
	if (water >= 50){
		disp.innerText = "50 water bailed"
		water -= 50
	}
	else{
		disp.innerText = Math.round(water) + " water bailed"
		water = 0
	}
	ship_data["WaterLevel"] = water

	update_overlay()
}

function upgrade_hole(){
	const div = document.getElementById("popup")
	id = div.lastElementChild.getAttribute("innerText")
	
	index = parseInt(id.replace("u", ""))
	if (id.includes("u")){
		index += ship_locations["Ships"][ship_data["Type"]]["LowerHoles"].length
	}

	if (ship_data["Holes"][index] < 3){
		ship_data["Holes"][index] = ship_data["Holes"][index] + 1;
	}
	update_overlay()
}

function repair_hole(){
	const div = document.getElementById("popup")
	id = div.lastElementChild.getAttribute("innerText")

	index = parseInt(id.replace("u", ""))
	if (id.includes("u")){
		index += ship_locations["Ships"][ship_data["Type"]]["LowerHoles"].length
	}

	if (ship_data["Holes"][index] != 0){
		ship_data["Holes"][index] = 0;
	}
	update_overlay()
}

function repair_all(){
	for (var i = 0; i < ship_data["Holes"].length; i++){
		ship_data["Holes"][i] = 0
	}
	update_overlay()
}

function hit_hole(){
	var level = document.getElementById("level").value
	var index = Math.floor(ship_data["Holes"].length * Math.random())
	ship_data["Holes"][index] = Math.min(3, parseInt(ship_data["Holes"][index]) + parseInt(level))
	update_overlay()
}

function trigger_round(){

	var water = ship_data["WaterLevel"]
	for (var i = 0; i < ship_data["Holes"].length; i++){
		var level = ship_data["Holes"][i]
		if (level > 0){
			if (i < ship_locations["Ships"][ship_data["Type"]]["LowerHoles"].length){
				water += ship_locations["Ships"][ship_data["Type"]]["WaterLower"][level - 1]
			}else{
				var toAdd = ship_locations["Ships"][ship_data["Type"]]["WaterUpper"][level - 1]
				if (water + toAdd > ship_locations["Ships"][ship_data["Type"]]["UpperWater"]){
					if (water > ship_locations["Ships"][ship_data["Type"]]["UpperWater"]){
						water += ship_locations["Ships"][ship_data["Type"]]["WaterLower"][level - 1]
					}else{
						var dif = ship_locations["Ships"][ship_data["Type"]]["UpperWater"] - water - toAdd
						water = ship_locations["Ships"][ship_data["Type"]]["UpperWater"] + (Math.abs(dif)/toAdd) * ship_locations["Ships"][ship_data["Type"]]["WaterLower"][level - 1]
					}
				}
				else
					water += ship_locations["Ships"][ship_data["Type"]]["WaterUpper"][level - 1]
			}
		}
	}
	ship_data["WaterLevel"] = water
	update_overlay()
}

var ship_locations;

const container = document.querySelector(".ship-container")

var ship_image = document.getElementById("ship-image")

var ship_data = {
	"Holes": [],
	"Type" : 0,
	"WaterLevel": 0.0
}

async function update_overlay(){
	if (ship_locations == null){
		ship_locations = await get_json('ship_assets/ship_locations.json')
	}
	const upperHoles = ship_locations["Ships"][ship_data["Type"]]["UpperHoles"]
	const lowerHoles = ship_locations["Ships"][ship_data["Type"]]["LowerHoles"]
	if (ship_data["Holes"].length == 0){
		for (var i = 0; i < lowerHoles.length + upperHoles.length; i++){
			ship_data["Holes"].push(0)
		}
	}

	document.querySelectorAll(".overlay-text-green").forEach(h => h.remove());
	document.querySelectorAll(".overlay-text").forEach(h => h.remove());
	const image_x = ship_image.clientWidth
	const imageAspectRatio = ship_locations["Ships"][ship_data["Type"]]["ImageSize"]["Y"]/ship_locations["Ships"][ship_data["Type"]]["ImageSize"]["X"];
	const num_lowers = lowerHoles.length
	for (var i = 0; i < ship_data["Holes"].length; i++){
		if (ship_data["Holes"][i] != 0){
			const a = document.createElement("a")
			a.classList.add("overlay-text")
			if (i >= num_lowers){
				a.id = "u" + (i - num_lowers)
				a.style.left = `${(upperHoles[i - num_lowers]["X"]/ship_locations["Ships"][ship_data["Type"]]["ImageSize"]["X"]) * image_x / window.innerWidth * 100}vw`
				a.style.top =  `${(upperHoles[i - num_lowers]["Y"]/ship_locations["Ships"][ship_data["Type"]]["ImageSize"]["Y"]) * image_x / window.innerWidth * 100 * imageAspectRatio}vw`
			}else{
				a.id = i
				a.style.left = `${(lowerHoles[i]["X"]/ship_locations["Ships"][ship_data["Type"]]["ImageSize"]["X"]) * image_x / window.innerWidth * 100}vw`
				a.style.top =  `${(lowerHoles[i]["Y"]/ship_locations["Ships"][ship_data["Type"]]["ImageSize"]["Y"]) * image_x / window.innerWidth * 100 * imageAspectRatio}vw`
			}
			a.innerText = ship_data["Holes"][i]
			a.onclick = function(){ show_popup(this); };
			container.appendChild(a);
		}else{
			const a = document.createElement("a")
			a.classList.add("overlay-text-green")
			if (i >= num_lowers){
				a.id = "u" + (i - num_lowers)
				a.style.left = `${(upperHoles[i - num_lowers]["X"]/ship_locations["Ships"][ship_data["Type"]]["ImageSize"]["X"]) * image_x / window.innerWidth * 100}vw`
				a.style.top =  `${(upperHoles[i - num_lowers]["Y"]/ship_locations["Ships"][ship_data["Type"]]["ImageSize"]["Y"]) * image_x / window.innerWidth * 100 * imageAspectRatio}vw`
			}else{
				a.id = i
				a.style.left = `${(lowerHoles[i]["X"]/ship_locations["Ships"][ship_data["Type"]]["ImageSize"]["X"]) * image_x / window.innerWidth * 100}vw`
				a.style.top =  `${(lowerHoles[i]["Y"]/ship_locations["Ships"][ship_data["Type"]]["ImageSize"]["Y"]) * image_x / window.innerWidth * 100 * imageAspectRatio}vw`
			}
			a.innerText = "+"
			a.onclick = function(){ show_popup(this); };
			container.appendChild(a);
		}
	}

	if (ship_data["WaterLevel"] >= ship_locations["Ships"][ship_data["Type"]]["MaxWater"]){
		document.getElementById("sunk-text").style.visibility = "visible";
		document.getElementById("water").classList.remove("water")
		document.getElementById("water").classList.add("water-sunk")
	}else{
		document.getElementById("sunk-text").style.visibility = "hidden";
		document.getElementById("water").classList.remove("water-sunk")
		document.getElementById("water").classList.add("water")
	}

	document.getElementById("water").innerText = "Water: " + Math.round(ship_data["WaterLevel"]) + "/" + Math.round(ship_locations["Ships"][ship_data["Type"]]["MaxWater"])
}

update_overlay()

window.addEventListener("click", function(event) {
    // List of elements to ignore (can be classes, IDs, or tag names)
    const ignoredSelectors = [".overlay-text", ".overlay-text-green", "#popup", ".popup-button"];
    // Check if the clicked element matches any of the ignored selectors
    if (ignoredSelectors.some(selector => event.target.matches(selector))) {
        return; // Exit the function without running the handler
    }

    this.document.getElementById("popup").style.visibility = "hidden";
});
