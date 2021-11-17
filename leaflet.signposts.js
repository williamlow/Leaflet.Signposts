   /////////////////////////////////
  //       Leaflet.Signposts     //
 //         November 2021       //
/////////////////////////////////

// This plugin adds eight new L.control locations to the map window which display a directional marker and a count of how many points can be found outside the current map view in each given direction

// This version places the new controls at secondary intercardinal directions (eg. NNE, ENE, ESE) rather than ordinal and cardinal directions (eg. N, NE, E). This is because corners of the leaflet window are frequently used for other controls, such as zoom.

// The count is based on eight (invisible) turf polgyons applied area outside the current map view that extend just far enough to overlay all point coordinates

// The new L.controls are updated as the map moves, and are hidden when the count is zero

// The plugin looks for feature data in the variable 'points'. In the example (available on GitHub) this is read from a GeoJSON object as it's added to the map, eg. var points = L.geoJSON(pointData).addTo(map);

  //////////////////////////////////
 //       Adding signposts       //
//////////////////////////////////

// Adds new placeholder locations to the Leaflet map window where L.controls can then be placed
// Adapted from https://stackoverflow.com/questions/33614912/how-to-locate-leaflet-zoom-control-in-a-desired-position/33621034#33621034
// Note that these locations are described by css classes (see plugin css file)

function addControlPlaceholders(map) {
	var corners = map._controlCorners,
	l = 'leaflet-',
	container = map._controlContainer;

	function createCorner(vSide, hSide) {
		var className = l + vSide + ' ' + l + hSide;
		corners[vSide + hSide] = L.DomUtil.create('div', className, container);
		}

	createCorner('y25', 'left');
	createCorner('y25', 'right');
	createCorner('y75', 'left');
	createCorner('y75', 'right');
	createCorner('top', 'x25');
	createCorner('bottomAdj', 'x25');
	createCorner('top', 'x75');
	createCorner('bottomAdj', 'x75');
}

addControlPlaceholders(map);

// Builds arrays of signpost names, their positions (refering to the new corners created above), and the required rotation of the direction icon
var signposts = ["NNE","ENE","ESE","SSE","SSW","WSW","WNW","NNW"];
var signpostsLoc = ['topx75','y25right','y75right','bottomAdjx75','bottomAdjx25','y75left','y25left','topx25'];
var signpostsRot = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

for (i in signposts) {
let name = signposts[i]+"control"; // eg. NNWcontrol
window[name]  = L.control({position: signpostsLoc[i]}); // Creates an new L.control object and puts it in the position from the array

// Adds a div with classes to allow later targeting, and populates it with the directional arrow, and a span that will hold the count value. If choosing to hide the signposts at first, an new class could be added here to do so.
window[name].onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'signposts '+signposts[i]); // Adds general 'signpost' class and unique name class eg. 'NNW'
	this._div.innerHTML = 
	'<svg role="img" viewBox="0 0 448 512" style="transform-origin: 0.4375em 0.5em;">' // The arrow
	+'<g transform="translate(224 256)">'
	+'<g transform="translate(0, 0)  scale(1, 1)  rotate('+signpostsRot[i]+' 0 0)">' // Rotated according to array
	+'<path fill="currentColor" d="M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z" transform="translate(-224 -256)"></path>'
	+'</g></g></svg>'
	+'<span id='+signposts[i]+'>0</span>'; // The span, with its ID set to the signpost name eg. 'NNW'
    return this._div;
};
window[name].addTo(map);
}


  //////////////////////////////////
 //        Adding polygons       //
//////////////////////////////////

// Declaring variables
var viewBounds;
var bboxN;
var bboxE;
var bboxS;
var bboxW;
var bboxMidX;
var bboxMidY;
// Finds the bounds of our point data, and adds a margin to ensure the furthest points are captured
// Note: I have not experimented with values that cross the antimeridian. Leaflet guidance on LatLngBounds objects asserts that if the area crosses the antimeridian, you must specify corners outside the [-180, 180] degrees longitude range - so this may work unadjusted.
var pointsN = points.getBounds().getNorth()+1;
var pointsE = points.getBounds().getEast()+1;
var pointsS = points.getBounds().getSouth()-1;
var pointsW = points.getBounds().getWest()-1;

// A function to apply 8 polygons around the map area (see Github link for a visual explanation)
function updatePolys (){
	
	viewBounds = map.getBounds(); 	// Get the bounds of the map viewport
	
	// Set our variables to the viewport bounds. Our polygons will use these to build our surrounding polygons.
	bboxN = viewBounds.getNorth();
	bboxE = viewBounds.getEast();
	bboxS = viewBounds.getSouth();
	bboxW = viewBounds.getWest();
	bboxMidX = viewBounds.getCenter().lng;
	bboxMidY = viewBounds.getCenter().lat;

	// Combines the bounds of the map viewport and our data points to create 8 turf.js polygons around the map view area that overlay all data points.
	NNE = turf.polygon([[
	[bboxMidX,pointsN],[pointsE,pointsN],[bboxE,bboxN],[bboxMidX,bboxN],[bboxMidX,pointsN]]
	]);
	ENE = turf.polygon([[
	[bboxE,bboxN],[pointsE,pointsN],[pointsE,bboxMidY],[bboxE,bboxMidY],[bboxE,bboxN]]
	]);
	ESE = turf.polygon([[
	[bboxE,bboxMidY],[pointsE,bboxMidY],[pointsE,pointsS],[bboxE,bboxS],[bboxE,bboxMidY]]
	]);
	SSE = turf.polygon([[
    [bboxMidX,bboxS],[bboxE,bboxS],[pointsE,pointsS],[bboxMidX,pointsS],[bboxMidX,bboxS]]
	]);
	SSW = turf.polygon([[
	[bboxW,bboxS],[bboxMidX,bboxS],[bboxMidX,pointsS],[pointsW,pointsS],[bboxW,bboxS]]
	]);
	WSW = turf.polygon([[
	[pointsW,bboxMidY],[bboxW,bboxMidY],[bboxW,bboxS],[pointsW,pointsS],[pointsW,bboxMidY]]
	]);
	WNW = turf.polygon([[
	[pointsW,pointsN],[bboxW,bboxN],[bboxW,bboxMidY],[pointsW,bboxMidY],[pointsW,pointsN]]
	]);
	NNW = turf.polygon([[
	[pointsW,pointsN],[bboxMidX,pointsN],[bboxMidX,bboxN],[bboxW,bboxN],[pointsW,pointsN]]
	]);
	
}

  //////////////////////////////////
 //   Points-in-polygon check    //
//////////////////////////////////

// A function to do point-in-polygon checks and update the signpost values
function pointsCheck() {
	var pointsFilter = points.toGeoJSON(); // Convert data to the right format for turf.js calculations

	for (i in signposts) {
		var ptsWithin = turf.pointsWithinPolygon(pointsFilter, window[signposts[i]]).features.length; // Use turf.js to count the points in a polygon. It returns a feature collection so we query the length. 

		document.getElementById(signposts[i]).innerHTML = ptsWithin // Finds the span in the target signpost and updates the count. jQuery alternative $('#'+signposts[i]).text(ptsWithin);

		let name = signposts[i]+"control"; // Builds the name of the L.control object eg. NNWcontrol
		if (ptsWithin == 0) { // If the count is zero, we hide the signpost by adding a CSS class. If not, we remove the class.
			window[name]._div.classList.add('hideSignpost');
				} else {
				window[name]._div.classList.remove('hideSignpost');}
	}
}

  //////////////////////////////////
 //       Function calls         //
//////////////////////////////////

// Adds the polygon creation and point-in-polygon check functions to a map move listener
map.on("move", function() {
updatePolys();
pointsCheck();
});

// Call the two functions on initial load
updatePolys();
pointsCheck();