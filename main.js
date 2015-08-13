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
        overviewMapControl: true
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
        $(number).text(dataset["Number"]);
        td = document.createElement("td");
        $(td).append(number);
        tr.append(td);

        // Web link

        if (dataset["URL"]) {
            var urlElem = document.createElement("span");
            $(urlElem).html(" <a target=_blank href=\""+dataset["URL"]+"\">Link</a>");
            td = document.createElement("td");
            $(td).append(urlElem);
            tr.append(td);
        } else {
            tr.append(document.createElement("td"));
        }

        // Alt link
        if (dataset["Alternate Link"]) {
            var alternateLinkElem = $(document.createElement("span"));
            alternateLinkElem.html(" <a target=_blank href=\""+dataset["Alternate Link"]+"\">Alternate</a>");
            td = $(document.createElement("td"));
            td.append(alternateLinkElem);
            tr.append(td);
        } else {
            tr.append(document.createElement("td"));
        }

        // Download
        if (dataset["JPG File"]) {
            var downloadElem = $(document.createElement("a"));
            downloadElem.addClass("btn");
            downloadElem.addClass("btn-info");
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

            // Build Link.
            var linkElem = $(document.createElement("a"));
            linkElem.text(category["Pretty Category"]);
            linkElem.attr("href", "#");
            linkElem.click(function () {
                $(this).siblings("ul").toggle();
            });
            // Setup Tooltip
            linkElem.attr("data-toggle", "tooltip");
            linkElem.attr("data-placement", "right");
            linkElem.attr("data-trigger", "hover");
            linkElem.attr("title", category["InfoWindow"]);
            linkElem.tooltip();
            categoryElem.append(linkElem);

            // Build sublist.
            var entriesElem = $(document.createElement("ul"));
            category.entries.map(function buildDOM(entry) {
                // Build `li`
                var liElem = $(document.createElement("li"));

                // Build checkbox.
                var checkboxElem = $(document.createElement("input"));
                checkboxElem.attr("type", "checkbox");
                checkboxElem.data("dataset", entry);
                checkboxElem.click(function () {
                    toggleMap($(this).data("dataset"));
                });
                liElem.append(checkboxElem);

                // Build label.
                var labelElem = $(document.createElement("label"));
                labelElem.text(entry["Number"] +" "+ entry["Pretty Title"]);
                // Tooltip
                labelElem.attr("data-toggle", "tooltip");
                labelElem.attr("data-placement", "bottom");
                labelElem.attr("data-trigger", "hover");
                labelElem.attr("data-html", "true");
                labelElem.attr("title", "<img class=\"tooltip-image\" src=\"sm_jpgs/" + entry["JPG File"] + "\">");
                labelElem.tooltip();
                liElem.append(labelElem);

                return liElem;
            }).map(function appendEntries(entry) {
                return entriesElem.append(entry);
            });
            entriesElem.hide(); // Show on click.
            categoryElem.append(entriesElem);

            return categoryElem;
        }));

        var sidebarElem = $("#sidebar");
        sidebarElem.append(categoriesElem);
    });
}
