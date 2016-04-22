#! /usr/bin/bash

OUTPUT_FILE=boundaries.csv

write_bounds () {
    TIF_FILE=$(cat $1 | grep -Po '(?<=Title>).*(?=</T)')
    #
    WEST=$(cat $1 | grep -Po '(?<=minx=")[\d-\.]*(?=")')
    EAST=$(cat $1 | grep -Po '(?<=maxx=")[\d-\.]*(?=")')
    #
    SOUTH=$(cat $1 | grep -Po '(?<=miny=")[\d-\.]*(?=")')
    NORTH=$(cat $1 | grep -Po '(?<=maxy=")[\d-\.]*(?=")')

    echo "$TIF_FILE,$WEST,$EAST,$SOUTH,$NORTH" >> $OUTPUT_FILE
}

rm $OUTPUT_FILE || true
echo "TIF File,West,East,South,North" > $OUTPUT_FILE

for NAME in tiles/**/*/tilemapresource.xml; do
    echo "Writing $NAME"
    write_bounds $NAME
done
