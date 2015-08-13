GEOTIFF_DIR = geotiffs
TILE_DIR = tiles

JPG_DIR = jpgs
SM_JPG_DIR = sm_jpgs

GEOTIFFS = $(wildcard $(GEOTIFF_DIR)/*.tif) $(wildcard $(GEOTIFF_DIR)/**/*.tif)
TILES = $(patsubst $(GEOTIFF_DIR)/%.tif,$(TILE_DIR)/%,$(GEOTIFFS))

JPGS = $(wildcard $(JPG_DIR)/*.jpg) $(wildcard $(JPG_DIR)/**/*.jpg)
SM_JPGS = $(patsubst $(JPG_DIR)/%.jpg,$(SM_JPG_DIR)/%.jpg,$(JPGS))

all: tiles jpgs

tiles: $(TILE_DIR) $(TILES)
jpgs: $(SM_JPG_DIR) $(SM_JPGS)

$(TILE_DIR):
	mkdir -p $(TILE_DIR)

# This is lazy and only updates ones it actually needs to.
$(TILE_DIR)/%: $(GEOTIFF_DIR)/%.tif
	# Build the tiles.
	gdal2tiles.py -r cubicspline -z 3-9 -w none $< $@

$(SM_JPG_DIR):
	mkdir -p $(SM_JPG_DIR)

$(SM_JPG_DIR)/%.jpg: $(JPG_DIR)/%.jpg
	# Reize
	convert "$<" -resize 600x600\> "$@"

clean:
	rm -r tiles/*
