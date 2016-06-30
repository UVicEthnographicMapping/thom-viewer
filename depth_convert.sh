for geotiff in $(find 16bit/ -name '*.tif'); do
    MAP=${geotiff#/16bit}
    MATH_PATH=${MAP%/*.tif}
    mkdir -p 8bit/${MAP_PATH}
    gdal_translate -ot Byte -of GTiff "$geotiff" "8bit/${MAP}"
done
