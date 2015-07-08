
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
        zoom: 11,
        center: new google.maps.LatLng(47.597486111111095, -122.30471388888901),
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        streetViewControl:false,
        scaleControl: true,
        overviewMapControl: true
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    document.getElementById("map").style.backgroundColor = "#5C5745";

    var initialOpacity = 100;
    var tileUrl = "assets/test";
    overlay = new CustomTileOverlay(map, initialOpacity, tileUrl);
    overlay.show();
    // Add opacity control and set initial value
    createOpacityControl(map, initialOpacity);

    var params = {};
    if (document.location.href.lastIndexOf('?') > -1) {
        var paramsArray = document.location.href.substring(document.location.href.lastIndexOf('?')+1, document.location.href.length);
        paramsArray = paramsArray.split(/&/);
        for (var i = 0; i < paramsArray.length; i++) {
            var pair = paramsArray[i].split(/=/);
                params[pair[0]] = pair[1];
            }
            var center_lat = params.lat;
            var center_lon = params.lon;
            var init_zoom = parseInt(params.zoom);

            map.setZoom(init_zoom);
            map.setCenter(new google.maps.LatLng(center_lat, center_lon));
    }
    google.maps.event.trigger(map, 'center_changed');
    google.maps.event.addDomListener(window, "resize", function() {
        var map_el = document.getElementById("map");
        var header = document.getElementById("header");
        map_el.style.height = (document.documentElement.clientHeight - header.offsetHeight - header.offsetTop)  + "px";
        google.maps.event.trigger(map, 'resize');
    });
    window.dispatchEvent(new Event('resize'));
}

google.maps.event.addDomListener(window, 'load', init);
