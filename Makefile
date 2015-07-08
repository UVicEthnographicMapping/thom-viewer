GEOTIFF_DIR = geotiffs
TILE_DIR = tiles

GEOTIFFS = $(wildcard $(GEOTIFF_DIR)/*.tif)
TILES = $(patsubst $(GEOTIFF_DIR)/%.tif,$(TILE_DIR)/%,$(GEOTIFFS))

all: $(TILES)

# This is lazy and only updates ones it actually needs to.
$(TILE_DIR)/%: $(GEOTIFF_DIR)/%.tif
	# Make an entry in the list.
	echo $(patsubst $(TILE_DIR)/%,%,$@) >> $(TILE_DIR)/list
	# Build the tiles.
	gdal2tiles.py -r cubicspline -w none $< $@

clean:
	rm -r tiles/*
