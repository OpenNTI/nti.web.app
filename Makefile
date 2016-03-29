.PHONY: all stage setup compile clean check

DIST=./dist/
STAGE=./stage/
SRC=./src/
RES=resources/

CC=webpack --progress --cache --bail --config



# all: check compile
all: compile


setup:
	@rm -rf node_modules
	@npm install


check:
	@eslint --ext .js,.jsx . || true

compile: clean stage $(DIST)server
	@compass compile
## copy static assets
	@(cd $(SRC)main; rsync -Rr . ../../$(DIST)client)
	@rm -r $(DIST)client/js
	@rm -r $(DIST)client/resources/scss
##compile
	@NODE_ENV="production" $(CC) ./webpack.config.js


$(DIST)server:
##the server code doesn't compile, just copy it.
	@cp -r $(SRC)server $(DIST)server

stage:
	@mkdir -p $(DIST)client
	@mkdir -p $(DIST)server

clean:
	@compass clean
	@rm -rf $(DIST)
