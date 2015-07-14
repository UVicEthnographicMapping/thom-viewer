/*******************************************************************************
Andrew Hobden, 2015.
MIT.
******************************************************************************/
var OPACITY_MAX_PIXELS = 57; // Width of opacity control image
var DATA_LIST = "cartographic-legacies.csv";

var map,
    sliderElem,
    // Per map
    numberElem,
    categoryElem,
    fileNameElem,
    bibliographicReferenceElem,
    urlElem,
    alternateLinkElem;

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

    sliderElem = $("#slider");
    sliderElem.on("input", function () {
        var overlay = map.overlayMapTypes.getAt(0);
        if (overlay) {
            overlay.setOpacity(sliderElem.val() / 100);
        }
    });

    numberElem = $("#number");
    categoryElem = $("#category");
    fileNameElem = $("#fileName");
    bibliographicReferenceElem = $("#bibliographicReference");
    urlElem = $("#url");
    alternateLinkElem = $("#alternateLink");

    buildSidebar();
}

google.maps.event.addDomListener(window, 'load', init);

function changeMap(dataset) {
    // Clear map over overlays.
    map.overlayMapTypes.clear();

    // Set up new tiles.
    var tileUrl = dataset["File Name"].split(".");
    tileUrl.pop(); // remove extension.
    tileUrl = "tiles/" + tileUrl;
    var overlay = new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            return tileUrl + "/" + zoom + "/" + coord.x + "/" + (Math.pow(2,zoom)-coord.y-1) + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        isPng: true,
    });
    map.overlayMapTypes.push(overlay);

    // Data
    numberElem.text(dataset["Number"]);
    categoryElem.text(dataset["Category"]);
    fileNameElem.text(dataset["File Name"]);
    bibliographicReferenceElem.text(dataset["Bibliographic Reference"]);
    urlElem.text(dataset["URL"]);
    alternateLinkElem.text(dataset["Alternate Link"]);
}

function buildSidebar() {
    Papa.parse(DATA_LIST, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            // The list will be added to.
            var list = document.createElement("ul");
            var categories = {};

            results.data.map(function (val) {
                var li = document.createElement("li"),
                    a  = document.createElement("a");
                $(a).html(val["File Name"]);
                // Populate data.
                $(a).data("dataset", val);
                $(a).attr("href", "#");
                $(a).click(function () {
                    changeMap($(this).data("dataset"));
                });
                $(li).append(a);
                // Add to category
                if (!categories[val.Category]) {
                    categories[val.Category] = document.createElement("ul");
                }
                $(categories[val.Category]).append(li);
            });

            // Build the heirarchical sidebar.
            for (var category in categories) {
                var sublist = document.createElement("li"),
                    link = document.createElement("a");
                // Link setup.
                $(link).text(category);
                $(link).attr("href", "#");
                $(link).click(function () {
                    $(this).siblings("ul").toggle();
                });
                // List setup.
                $(sublist).append(link);
                $(categories[category]).hide(); // Show on click.
                $(sublist).append(categories[category]);
                $(list).append(sublist);
            }
            var sidebar = $("#sidebar");
            sidebar.append(list);
        }
    });
}
