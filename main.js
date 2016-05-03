/*
 * A project for Brian Thom of the University of Victoria Ethnographic Mapping Lab
 * Learn more about the lab: http://ethnographicmapping.uvic.ca/
 * Explore the project: http://ethnomap.uvic.ca/
 *
 * `main.js` by Andrew Hobden, 2015, MIT licensed.
*/

var DATA_LIST = "cartographic-legacies.csv";
var CATEGORY_LIST = "categories.csv";
var BOUNDS_LIST = "boundaries.csv";

var map, data;

/*
 * Initialization. runs on loaded.
 */
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

    toggleInfobox();

    data = getData();
    data.then(categoryList);

    var tooltips = $("[data-toggle=tooltip]");
    tooltips.tooltip({ trigger: "hover", });

    // Add new buttons
    var categoriesButton = document.createElement("div");
    $(categoriesButton).text("Browse Library");
    $(categoriesButton).click(toggleSidebar);
    $(categoriesButton).toggleClass("gm-button");
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(categoriesButton);

    var mapsButton = document.createElement("div");
    $(mapsButton).text("Selected Maps");
    $(mapsButton).click(toggleDatasets);
    $(mapsButton).toggleClass("gm-button");
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapsButton);

    var infoButton = document.createElement("div");
    $(infoButton).text("Project Info");
    $(infoButton).click(toggleInfobox)
    $(infoButton).toggleClass("gm-button");
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(infoButton);

    // var searchButton = document.createElement("div");
    // $(searchButton).text("Search Box");
    // $(searchButton).click(toggleSearchRectangle)
    // $(searchButton).toggleClass("gm-button");
    // map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchButton);

}
google.maps.event.addDomListener(window, 'load', init);

/*
 *  Functions for events.
 */
function toggleMap(dataset) {
    // Set the icon.
    $("li[file='"+dataset["TIF File"]+"'] i").toggleClass("glyphicon-eye-open glyphicon-eye-close btn-primary");
    // Get tile url
    var tilesetName = dataset["TIF File"].split(".");
    tilesetName.pop(); // remove extension.
    tilesetName = String(tilesetName);
    var tileUrl = "tiles/" + dataset["Category"] + "/" + tilesetName;
    // Before loading the map let's make sure we don't already have it loaded.
    var foundIdx = null;
    map.overlayMapTypes.forEach(function (elem, idx) {
        if (elem.name == tilesetName) {
            foundIdx = idx;
        }
    });
    if (foundIdx !== null) {
        // Remove existing tileset.
        map.overlayMapTypes.removeAt(foundIdx);
        $("#datasets > tbody > tr").map(function () {
            if ($(this).data("dataset") === tilesetName) {
                this.remove();
            }
        });
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

        console.log(dataset);

        map.fitBounds({
            east: dataset["East"],
            west: dataset["West"],
            south: dataset["South"] ,
            north: dataset["North"]
        });

        // Add a Dataset entry.
        var tr = $(document.createElement("tr"));
        tr.data("dataset", tilesetName);

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

        // Finally add it to the datasets.
        $("#datasets > tbody").append(tr);

        // It's good to do this for new users.
        toggleDatasets(true);
    }
}

function toggleSidebar(optional_state) {
    console.log("Toggling sidebar");
    if (optional_state === true) {
        $("#sidebarContainer").addClass("in");
    } else if (optional_state === false) {
        $("#sidebarContainer").removeClass("in");
    } else {
        $("#sidebarContainer").toggleClass("in");
    }
}

function toggleDatasets(optional_state) {
    console.log("Toggling Datasets");
    if (optional_state === true) {
        $("#datasetsContainer").addClass("in");
    } else if (optional_state === false) {
        $("#datasetsContainer").removeClass("in");
    } else {
        $("#datasetsContainer").toggleClass("in");
    }
}

function toggleInfobox(optional_state) {
    console.log("Toggling infobox");
    $("#infoboxContainer").modal("toggle");
}

function getData() {
    return Promise.all([
        getEntries(),
        getCategories(),
        getBounds()
    ]).then(function (results) {
        // Yes this is a slow operation and it really sucks.
        var entries = results[0],
            categories = results[1],
            bounds = results[2];

        return categories.data.map(function (category) {
            category.entries = entries.data.filter(function (entry) {
                return entry["Category"] === category["Category"];
            }).map(function (entry) {
                // Populate the bounds.
                var chosen = bounds.data.find(function (row) {
                    return row["TIF File"] == entry["TIF File"];
                });
                // Sometimes the future sucks and computers don't work.
                if (chosen) {
                    entry["East"] = Number(chosen["East"]);
                    entry["West"] = Number(chosen["West"]);
                    entry["South"] = Number(chosen["South"]);
                    entry["North"] = Number(chosen["North"]);
                } else {
                    entry["East"] = 0;
                    entry["West"] = 0;
                    entry["South"] = 0;
                    entry["North"] = 0;
                }
                // Return it.
                return entry;
            });
            return category;
        });
    })
}

/*
 * CSV Asset Acquisition Function  Squad
 */

// Fetches the category list from the server.
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

function getBounds() {
    return new Promise(function (resolve, reject) {
        Papa.parse(BOUNDS_LIST, {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                return resolve(results);
            }
        });
    });
}

/*
 * Fired when the user chooses a category sidebar.
 * This changes the sidebar to contain that category's data sets.
 */
function chooseCategory(category) {

    var previewElem = $(document.createElement("div"));
    previewElem.attr("id", "preview");
    var cf1Elem = $(document.createElement("div"));
    cf1Elem.attr("id", "cf1");
    cf1Elem.css('background-image', 'url(placeholder.jpg)');
    cf1Elem.toggleClass('in');
    previewElem.append(cf1Elem);
    var cf2Elem = $(document.createElement("div"));
    cf2Elem.attr("id", "cf2");
    cf2Elem.css('background-image', '');
    previewElem.append(cf2Elem);

    var entriesElem = $(document.createElement("ul"));
    entriesElem.attr("id", "entries");

    category.entries.map(function buildDOM(entry) {
        // Ensure it's off.
        toggleBoundsRectangle(entry, false);
        // Build `li`
        var liElem = $(document.createElement("li"));
        liElem.attr("file", entry["TIF File"]);

        // Build checkbox.
        var linkElem = $(document.createElement("span"));

        linkElem.html("<i class=\"btn btn-xs btn-default glyphicon glyphicon-eye-close\"></i>" + entry["Pretty Title"]);
        linkElem.data("dataset", entry);
        linkElem.click(function () {
            toggleMap($(this).data("dataset"));
        });
        map.overlayMapTypes.forEach(function (elem, idx) {
            var tilesetName = entry["TIF File"].split(".");
            tilesetName.pop(); // remove extension.
            tilesetName = String(tilesetName);
            if (elem.name == tilesetName) {
                // Set the icon.
                linkElem.find("i").toggleClass("glyphicon-eye-open glyphicon-eye-close btn-primary");
            }
        });

        // in, then out
        linkElem.hover(function () {
            $("#cf2").css('background-image', 'url(' +  "sm_jpgs/" + entry["JPG File"] + ')');
            $("#cf2").toggleClass('in');

            category.entries.map(function (entry) {
                toggleBoundsRectangle(entry, false);
            });
            toggleBoundsRectangle($(this).data("dataset"), true);
        }, function () {
            $("#cf2").toggleClass('in');
            category.entries.map(function (entry) {
                toggleBoundsRectangle(entry, false);
            });
            toggleBoundsRectangle($(this).data("dataset"), false);
        });

        // Build label.
        var labelElem = $(document.createElement("span"));
        labelElem.text();
        labelElem.append(linkElem);

        liElem.append(labelElem);

        return liElem;
    }).map(function appendEntries(entry) {
        return entriesElem.append(entry);
    });

    var backElem = $(document.createElement("li"));
    backElem.html("<span><i class=\"glyphicon glyphicon-arrow-left\"></i>Go back...</span>");
    backElem.click(function () { data.then(categoryList); });
    entriesElem.append(backElem);


    var sidebarElem = $("#sidebar");
    sidebarElem.html(previewElem);
    sidebarElem.append(entriesElem);
}

/*
 * Fired when the user either goes back or on init.
 * This changes the sidebar to contain the list of categories.
 */
function categoryList(categories) {
    var categoriesElem = $(document.createElement("ul"));
    categoriesElem.attr("id", "categories");

    categoriesElem.append(categories.map(function (category) {
        var categoryElem = $(document.createElement("li"));

        // Setup description
        var descriptionElem = $(document.createElement("div"));
        descriptionElem.toggleClass("description");
        descriptionElem.text(category["Info Window"]);

        // Build checkbox.
        var boundsElem = $(document.createElement("span"));
        boundsElem.addClass("glyphicon glyphicon-info-sign");
        boundsElem.data("category", category["Category"]);
        boundsElem.click(function () {
            descriptionElem.toggleClass("in");
        });
        categoryElem.append(boundsElem);

        // Build Link.
        var linkElem = $(document.createElement("strong"));
        linkElem.text(category["Pretty Category"]);
        linkElem.hover(function () {
            category.entries.map(function (entry) {
                toggleBoundsRectangle(entry, true);
            });
        }, function () {
            category.entries.map(function (entry) {
                toggleBoundsRectangle(entry, false);
            });
        });
        linkElem.click(function () {
            chooseCategory(category);
        });

        categoryElem.append(linkElem);
        categoryElem.append("<br>");
        categoryElem.append(descriptionElem);

        return categoryElem;
    }));

    var sidebarElem = $("#sidebar");
    sidebarElem.html(categoriesElem);
}

/*
 * Mouseover event for sidebar items to show rectable preview.
 */
 // We need to keep a little state object to remember what is visible.
var boundsRectangles = {}
function toggleBoundsRectangle(dataset, state) {
    var title = dataset["TIF File"];
    var did_exist = boundsRectangles[title] !== undefined;

    if (did_exist) {
        // Exists, remove it.
        boundsRectangles[title].setMap(null);
        delete boundsRectangles[title];
    }

    if (state === true && did_exist === false) {
        // Need to add it.
        var bounds = {
            north: dataset["North"],
            south: dataset["South"],
            west: dataset["West"],
            east: dataset["East"],
        };
        boundsRectangles[title] =  new google.maps.Rectangle({
            bounds: bounds,
            clickable: true
        });
        boundsRectangles[title].addListener("click", function () { toggleMap(dataset); });
        boundsRectangles[title].setMap(map);
    }
}

/*
 * Toggles the searching rectangle.
 */
var searchRectangle = new google.maps.Rectangle({
    clickable: true,
    draggable: true,
    editable: true,
});
searchRectangle.addListener('bounds_changed', searchBounds);

function toggleSearchRectangle() {
    console.log("Search Rectanble");
    if (searchRectangle.getMap() === null) {
        console.log("Should be on");
        var center = map.center;
        var bounds = {
            north: center.lat() + 5,
            south: center.lat() - 5,
            east: center.lng() + 5,
            west: center.lng() - 5,
        };
        searchRectangle.setBounds(bounds);
        searchRectangle.setMap(map);
    } else {
        searchRectangle.setMap(null);
    }
}

function searchBounds() {
    var bounds = searchRectangle.getBounds();
    console.log(bounds);
}

/*
 * This is a function utilized by tooltips to determine their best suited position.
 */
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
