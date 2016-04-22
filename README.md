An ethnographic mapping project by Brian Thom of the UVic Ethnographic Mapping lab.


[http://ethnographicmapping.uvic.ca/](http://ethnographicmapping.uvic.ca/)


You need:

* `gdal2`
* `convert` (From Imagemagick)
* A web server.

To build tiles:

```bash
make
```

You can use whatever web server you want, just move this directory to where it should be.

If you'd like to have auto updating data from a URL you can put something like this in your `crontab -e`:

```
0 */2 * * * curl "https://docs.google.com/spreadsheets/d/1_nKZw6s5i7URDz8W5Li66xyATH0m7wvExK8DZzTPRJA/pub?gid=988019414&single=true&output=csv" > www/cartographic-legacies.csv
0 */2 * * * curl "https://docs.google.com/spreadsheets/d/1_nKZw6s5i7URDz8W5Li66xyATH0m7wvExK8DZzTPRJA/pub?gid=963735893&single=true&output=csv" > www/categories.csv
```
