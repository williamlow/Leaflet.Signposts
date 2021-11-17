# Leaflet.Signposts

![Example of signposts](/docs/example_image.jpg)

This plugin displays arrows and a count of how many points can be found outside the current map view in each given direction. It's intention is to encourage users to explore the map, and is particularly useful when some outlier points are in danger of being ignored in favour of larger central clusters.

## Features

This plugin adds eight new L.control locations to the map window to house the new controls, referred to as signposts. The plugin places these signposts at secondary intercardinal directions (eg. NNE, ENE, ESE) rather than ordinal and cardinal directions (eg. N, NE, E). This is because corners of the leaflet window are frequently used for other controls, such as zoom.

The count of points in each direction is based on eight (invisible) turf.js polgyons applied outside the current map view that extend just far enough to overlay all point coordinates. The signpost counts are updated as the map moves, and signposts are hidden when their count is zero.

Additional functionality can be seen in the second live example below. This includes changing the position of the signposts on smaller maps to avoid overlapping with other control objects, and hiding the signposts when a popup is open, so avoid excessive cluttering. These changes are achieved through adjusting the signpost css.

## Usage

Download the javascript and style files from the src directory, then link them in your HTML document.

### Default variable names

- The plugin looks for feature data in the variable 'points'. In the first example, this is read from a GeoJSON object as it's added to the map, eg.
``` var points = L.geoJSON(pointData).addTo(map);```
- The Leaflet instance is presumed to be named 'map'

### Dependencies

- Turf.js, used for it's points-in-polygon function.
- Leaflet, obviously.

## Examples

Simple example: https://williamlow.github.io/leaflet-signpost/demo.html

Live use: https://www.yangontimemachine.com/en/

## License

Distributed under the MIT License
