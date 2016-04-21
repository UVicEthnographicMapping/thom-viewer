#! /usr/bin/bash

OUTPUT_FILE=boundaries.csv

write_bounds () {
    TITLE=$(cat $1 | grep -Po '(?<=Title>).*(?=.tif)')
    #
    MINX=$(cat $1 | grep -Po '(?<=minx=")[\d-\.]*(?=")')
    MAXX=$(cat $1 | grep -Po '(?<=maxx=")[\d-\.]*(?=")')
    #
    MINY=$(cat $1 | grep -Po '(?<=miny=")[\d-\.]*(?=")')
    MAXY=$(cat $1 | grep -Po '(?<=maxy=")[\d-\.]*(?=")')

    echo "$TITLE, $MINX, $MAXX, $MINY, $MAXY" >> $OUTPUT_FILE
}

rm $OUTPUT_FILE || true
echo "title, minx, maxx, miny, maxy" > $OUTPUT_FILE

for NAME in tiles/**/*/tilemapresource.xml; do
    echo "Writing $NAME"
    write_bounds $NAME
done
