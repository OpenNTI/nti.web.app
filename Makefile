.PHONY: all setup check build compile styles stage deploy clean-dist clean-stage clean-styles clean

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

styles: clean-styles
	@spritesmith
	@node-sass $(SRC)main/resources/scss -o $(SRC)main/resources/css
	@postcss --use autoprefixer -r $(SRC)main/resources/css/*.css


build: compile deploy
	@npm la 2>/dev/null > $(DIST)client/js/versions.txt
	@npm ls 2>/dev/null | grep nti- | sed -e 's/^[\│\├\─\┬\└\ ]\{1,\}/z /g' | sort | sed -e 's/^z/-/g' > $(DIST)client/js/nti-versions.txt
	@rm -rf $(STAGE)


compile: clean-stage stage styles
##the server code doesn't compile, just copy it.
	@cp -r $(SRC)server/ $(STAGE)server/
## copy static assets
	@(cd $(SRC)main; rsync -Rr . ../../$(STAGE)client)
	@rm -r $(STAGE)client/js
	@rm -r $(STAGE)client/resources/scss
##compile
	@NODE_ENV="production" $(CC) ./webpack.config.js


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

clean-styles:
	@rm -rf $(SRC)main/resources/css
	@rm -f $(SRC)main/resources/scss/utils/_icons.scss
	@rm -f $(SRC)main/resources/images/sprite.png

clean: clean-stage clean-dist clean-styles
