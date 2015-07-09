#!/bin/bash

SOURCE=$1
DESTINATION=$2

# Do NOT name this $PATH! It's a bad idea!
SOURCE_PATH=$(jq "split(\"/\") | .[:-1] | join(\".\")" <<< "\"$SOURCE\"")
DESTINATION_PATH=$(jq "split(\"/\") | .[:-1] | join(\".\")" <<< "\"$DESTINATION\"")
FILE_NAME=$(jq "split(\"/\") | .[length-1]" <<< "\"$SOURCE\"")

if [ $SOURCE_PATH == "\"\"" ]
then
    SOURCE_PATH=""
    OUTPUT=$(jq ".$FILE_NAME = \"$DESTINATION\"" tiles/list.json)
else
    SOURCE_PATH=".${SOURCE_PATH[@]:1:-1}"
    OUTPUT=$(jq "$SOURCE_PATH.$FILE_NAME = \"$DESTINATION\"" tiles/list.json)
fi

echo "Updated to: $OUTPUT"

echo "$OUTPUT" > tiles/list.json
