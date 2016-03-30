.PHONY: all setup check build compile stage deploy clean-dist clean-stage clean

DIST=./dist/
STAGE=./stage/
SRC=./src/
RES=resources/

CC=webpack --progress --cache --bail --config



# all: check build
all: build


setup:
	@rm -rf node_modules
	@npm install


check:
	@eslint --ext .js,.jsx . || true


build: compile deploy
	@rm -rf $(STAGE)


compile: clean-stage stage $(STAGE)server
	@spritesmith
	@compass compile
## copy static assets
	@(cd $(SRC)main; rsync -Rr . ../../$(STAGE)client)
	@rm -r $(STAGE)client/js
	@rm -r $(STAGE)client/resources/scss
##compile
	@NODE_ENV="production" $(CC) ./webpack.config.js


$(STAGE)server:
##the server code doesn't compile, just copy it.
	@cp -r $(SRC)server $(STAGE)server


stage:
	@mkdir -p $(STAGE)client
	@mkdir -p $(STAGE)server


deploy: clean-dist
	@mkdir -p $(DIST)
	@mv -f $(STAGE)client $(DIST)client
	@mv -f $(STAGE)server $(DIST)server


clean-dist:
	@rm -rf $(DIST)


clean-stage:
	@rm -rf $(STAGE)


clean: clean-stage clean-dist
	@compass clean
	@rm src/main/resources/scss/_icons.scss
	@rm src/main/resources/images/sprite.png
