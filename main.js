/*******************************************************************************
Modified by Andrew Hobden, 2015.
******************************************************************************/
/*******************************************************************************
Copyright (c) 2010-2012. Gavin Harriss
Site: http://www.gavinharriss.com/
Originally developed for: http://www.topomap.co.nz/

Licences: Creative Commons Attribution 3.0 New Zealand License
http://creativecommons.org/licenses/by/3.0/nz/
******************************************************************************/

var OPACITY_MAX_PIXELS = 57; // Width of opacity control image
var map, overlay;

function init() {
    // Map options for example map
    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(47.597486111111095, -122.30471388888901),
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        streetViewControl:false,
        scaleControl: true,
        overviewMapControl: true
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    document.getElementById("map").style.backgroundColor = "#5C5745";

    // Add opacity control and set initial value
    var initialOpacity = 100;
    // createOpacityControl(map, initialOpacity);

    buildSidebar();
}

google.maps.event.addDomListener(window, 'load', init);

function changeMap(to) {
    var tileUrl = to;
    overlay = new CustomTileOverlay(map, 100, tileUrl);
    overlay.show();
}

function buildSidebar() {
    var ul = document.createElement("ul");
    $("#sidebar").append(ul);
    $.get("/tiles/list").done(function (out) {
        var set = out.split('\n');
        set.pop(); // remove a blank newline.
        set.map(function (val) {
            var li = document.createElement("li"),
                a  = document.createElement("a");
            $(a).html(val);
            $(a).data("tileset", val);
            $(a).attr("href", "#");
            $(a).click(function () {
                changeMap($(this).data("tileset"));
            });
            $(li).append(a);
            $(ul).append(li);
        });
    });
}
