/*******************************************************************************
Andrew Hobden, 2015.
MIT.
******************************************************************************/
var DATA_LIST = "cartographic-legacies.csv";
var CATEGORY_LIST = "categories.csv";

var map;

function init() {
    // Map options for example map
    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(47.597486111111095, -122.30471388888901),
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        streetViewControl:false,
        scaleControl: true,
        panControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
        },
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
        },
        overviewMapControl: true,
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    document.getElementById("map").style.backgroundColor = "#5C5745";

    buildSidebar();

    var tooltips = $("[data-toggle=tooltip]");
    tooltips.tooltip({ trigger: "hover", });

}

google.maps.event.addDomListener(window, 'load', init);

function toggleMap(dataset) {
    // Get tile url
    var tilesetName = dataset["TIF File"].split(".");
    tilesetName.pop(); // remove extension.
    tilesetName = String(tilesetName);
    var tileUrl = "tiles/" + dataset["Category"] + "/" + tilesetName;
    var foundIdx = null;
    map.overlayMapTypes.forEach(function (elem, idx) {
        if (elem.name == tilesetName) {
            foundIdx = idx;
        }
    });
    console.log(foundIdx);
    if (foundIdx !== null) {
        console.log("Removing!")
        // Remove existing tileset.
        map.overlayMapTypes.removeAt(foundIdx);
        $("#datasets > tbody > #" + tilesetName).remove();
    } else {
        // Make a new tileset.
        var overlay = new google.maps.ImageMapType({
            name: tilesetName,
            getTileUrl: function (coord, zoom) {
                return tileUrl + "/" + zoom + "/" + coord.x + "/" + (Math.pow(2,zoom)-coord.y-1) + ".png";
            },
            tileSize: new google.maps.Size(256, 256),
            isPng: true,
        });
        map.overlayMapTypes.push(overlay);
        // Add a Dataset entry.
        var tr = $(document.createElement("tr"));
        tr.attr("id", tilesetName);

        // Build the removal box.
        var buttonElem = $(document.createElement("button"));
        buttonElem.addClass("btn btn-xs btn-danger glyphicon glyphicon-remove");
        buttonElem.data("dataset", dataset);
        buttonElem.prop('checked', true);
        buttonElem.click(function () {
            toggleMap($(this).data("dataset"));
        });
        td = document.createElement("td");
        $(td).append(buttonElem);
        tr.append(td);

        // Build Slider
        var sliderElem = document.createElement("input");
        $(sliderElem).attr("type", "range");
        $(sliderElem).attr("min", "0");
        $(sliderElem).attr("max", "100");
        $(sliderElem).attr("value", "100");
        $(sliderElem).on("input", function () {
            var val = Number($(sliderElem).val()) / 100;
            map.overlayMapTypes.forEach(function (elem, idx) {
                if (elem.name == tilesetName) {
                    elem.setOpacity(val);
                }
            });
        });
        td = document.createElement("td");
        $(td).append(sliderElem);
        tr.append(td);

        // Build reference
        var bibliographicReferenceElem = document.createElement("span");
        $(bibliographicReferenceElem).text(dataset["Bibliographic Reference"]);
        td = document.createElement("td");
        $(td).append(bibliographicReferenceElem);
        tr.append(td);

        // Build Page Number
        var number = document.createElement("span");
        $(number).text(dataset["Page #"]);
        td = document.createElement("td");
        $(td).append(number);
        tr.append(td);

        // Web link

        if (dataset["URL"]) {
            var urlElem = document.createElement("span");
            $(urlElem).html(" <a target=blank href=\""+dataset["URL"]+"\"><i class=\"btn btn-default btn-xs glyphicon glyphicon-link\"></i></a>");
            td = document.createElement("td");
            $(td).append(urlElem);
            tr.append(td);
        } else {
            tr.append(document.createElement("td"));
        }

        // Alt link
        if (dataset["Alternate Link"]) {
            var alternateLinkElem = $(document.createElement("span"));
            alternateLinkElem.html(" <a target=blank href=\""+dataset["Alternate Link"]+"\"><i class=\"btn btn-default btn-xs glyphicon glyphicon-link\"></i></a>");
            td = $(document.createElement("td"));
            td.append(alternateLinkElem);
            tr.append(td);
        } else {
            tr.append(document.createElement("td"));
        }

        // Download
        if (dataset["JPG File"]) {
            var downloadElem = $(document.createElement("a"));
            downloadElem.addClass("btn btn-xs btn-default");
            downloadElem.attr("target", "blank");
            downloadElem.attr("href", "jpgs/" + dataset["JPG File"]);
            downloadElem.html("<i class='glyphicon glyphicon-download'></i>");
            td = $(document.createElement("td"));
            td.append(downloadElem);
            console.log(downloadElem);
            tr.append(td);
        } else {
            tr.append(document.createElement("td"));
        }

        $("#datasets").append(tr);
    }

}

var kmlSet = {};
function toggleKml(category) {
    if (!kmlSet[category]) {
        // Create it.
        var location = String(window.location).slice(0, -1);
        kmlSet[category] = new google.maps.KmlLayer({
            url: location + "/kmls/" + category + ".kml",
            map: map,
        });
        console.log(kmlSet[category]);
    } else {
        // Remove it.
        kmlSet[category].setMap(null);
        delete kmlSet[category];
    }
}

function toggleSidebar() {
    console.log("Toggling sidebar");
    $("#sidebarContainer").toggleClass("in");
}

function toggleDatasets() {
    console.log("Toggling sidebar");
    $("#datasetsContainer").toggleClass("in");
}

function toggleInfobox() {
    console.log("Toggling infobox");
    $("#infoboxContainer").toggleClass("in");
}

function getCategories() {
    return new Promise(function (resolve, reject) {
        Papa.parse(CATEGORY_LIST, {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                return resolve(results);
            }
        });
    });
}

function getEntries() {
    return new Promise(function (resolve, reject) {
        Papa.parse(DATA_LIST, {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                return resolve(results);
            }
        });
    });
}

function buildSidebar() {
    Promise.all([
        getEntries(),
        getCategories()
    ]).then(function populateCategories(results) {
        var entries = results[0],
            categories = results[1];

        return categories.data.map(function (category) {
            category.entries = entries.data.filter(function (entry) {
                return entry["Pretty Category"] === category["Pretty Category"];
            });
            return category;
        });
    }).then(function buildHtml(categories) {
        var categoriesElem = $(document.createElement("ul"));

        categoriesElem.append(categories.map(function (category) {
            var categoryElem = $(document.createElement("li"));

            // Build checkbox.
            var kmlCheckboxElem = $(document.createElement("span"));
            kmlCheckboxElem.addClass("glyphicon glyphicon-eye-close btn btn-sm");
            kmlCheckboxElem.data("category", category["Category"]);
            kmlCheckboxElem.click(function () {
                toggleKml($(this).data("category"));
                $(this).toggleClass("glyphicon-eye-close glyphicon-eye-open btn-primary");
            });
            categoryElem.append(kmlCheckboxElem);

            // Build Link.
            var linkElem = $(document.createElement("span"));
            linkElem.html('<i class="btn btn-sm glyphicon glyphicon-folder-close"></i>' + category["Pretty Category"]);
            linkElem.click(function () {
                $(this).siblings("ul").toggle();
                $(this).find("i.btn").toggleClass("glyphicon-folder-close glyphicon-folder-open btn-primary");
            });
            // Setup Tooltip
            linkElem.attr("data-toggle", "tooltip");
            linkElem.attr("data-placement", "right");
            linkElem.attr("data-trigger", "hover");
            linkElem.attr("title", category["Info Window"]);
            linkElem.tooltip();
            categoryElem.append(linkElem);

            // Build sublist.
            var entriesElem = $(document.createElement("ul"));
            category.entries.map(function buildDOM(entry) {
                // Build `li`
                var liElem = $(document.createElement("li"));

                // Build checkbox.
                var linkElem = $(document.createElement("span"));

                linkElem.html("<i class=\"btn btn-sm glyphicon glyphicon-eye-close\"></i>" + entry["Pretty Title"]);
                linkElem.data("dataset", entry);
                // Tooltip
                linkElem.attr("data-toggle", "tooltip");
                linkElem.attr("data-placement", "auto top");
                linkElem.attr("data-viewport", "main");
                linkElem.attr("data-trigger", "hover");
                linkElem.attr("data-html", "true");
                linkElem.attr("title", "<img class=\"tooltip-image\" src=\"sm_jpgs/" + entry["JPG File"] + "\">");
                linkElem.tooltip();
                linkElem.click(function () {
                    toggleMap($(this).data("dataset"));
                    $(this).find("i").toggleClass("glyphicon-eye-open glyphicon-eye-close btn-primary");
                });

                // Build label.
                var labelElem = $(document.createElement("label"));
                labelElem.text();
                linkElem.append(labelElem);

                liElem.append(linkElem);



                return liElem;
            }).map(function appendEntries(entry) {
                return entriesElem.append(entry);
            });
            entriesElem.hide(); // Show on click.
            categoryElem.append(entriesElem);

            return categoryElem;
        }))

        var sidebarElem = $("#sidebar");
        sidebarElem.append(categoriesElem);
    });
}

var getPlacementFunction = function (defaultPosition, width, height) {
    return function (tip, element) {
        var position, top, bottom, left, right;

        var $element = $(element);
        var boundTop = $(document).scrollTop();
        var boundLeft = $(document).scrollLeft();
        var boundRight = boundLeft + $(window).width();
        var boundBottom = boundTop + $(window).height();

        var pos = $.extend({}, $element.offset(), {
            width: element.offsetWidth,
            height: element.offsetHeight
        });

        var isWithinBounds = function (elPos) {
            return boundTop < elPos.top && boundLeft < elPos.left && boundRight > (elPos.left + width) && boundBottom > (elPos.top + height);
        };

        var testTop = function () {
            if (top === false) return false;
            top = isWithinBounds({
                top: pos.top - height,
                left: pos.left + pos.width / 2 - width / 2
            });
            return top ? "top" : false;
        };

        var testBottom = function () {
            if (bottom === false) return false;
            bottom = isWithinBounds({
                top: pos.top + pos.height,
                left: pos.left + pos.width / 2 - width / 2
            });
            return bottom ? "bottom" : false;
        };

        var testLeft = function () {
            if (left === false) return false;
            left = isWithinBounds({
                top: pos.top + pos.height / 2 - height / 2,
                left: pos.left - width
            });
            return left ? "left" : false;
        };

        var testRight = function () {
            if (right === false) return false;
            right = isWithinBounds({
                top: pos.top + pos.height / 2 - height / 2,
                left: pos.left + pos.width
            });
            return right ? "right" : false;
        };

        switch (defaultPosition) {
            case "top":
                if (position = testTop()) return position;
            case "bottom":
                if (position = testBottom()) return position;
            case "left":
                if (position = testLeft()) return position;
            case "right":
                if (position = testRight()) return position;
            default:
                if (position = testTop()) return position;
                if (position = testBottom()) return position;
                if (position = testLeft()) return position;
                if (position = testRight()) return position;
                return defaultPosition;
        }
    }
};
