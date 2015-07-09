GEOTIFF_DIR = geotiffs
TILE_DIR = tiles

GEOTIFFS = $(wildcard $(GEOTIFF_DIR)/*.tif) $(wildcard $(GEOTIFF_DIR)/**/*.tif)
TILES = $(patsubst $(GEOTIFF_DIR)/%.tif,$(TILE_DIR)/%,$(GEOTIFFS))

TOKEN_JQ = "split(\"/\") | .[:-1] | join(\".\")"
FILE_JQ = "split(\"/\") | .[length-1]"

all: $(TILE_DIR) $(TILE_DIR)/list.json $(TILES)

$(TILE_DIR):
	mkdir -p $(TILE_DIR)

$(TILE_DIR)/list.json:
	echo "{}" > $(TILE_DIR)/list.json

# This is lazy and only updates ones it actually needs to.
$(TILE_DIR)/%: $(GEOTIFF_DIR)/%.tif
	# Make an entry in the list.
	$(eval NAME = $(patsubst $(TILE_DIR)/%,%,$@))
	./add_metadata.sh $(NAME) $@
	# Build the tiles.
	gdal2tiles.py -r cubicspline -w none $< $@

clean:
	rm -r tiles/*
