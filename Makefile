.PHONY: all setup test check build compile styles clean-styles clean

DIST=./dist/
SRC=./src/
RES=resources/

CC=webpack --progress --cache --bail --config



# all: check build
all: build


setup:
	@rm -rf node_modules
	@npm install

test:
	@jest --coverage

check:
	@eslint --ext .js,.jsx . || true

styles: clean-styles
	@spritesmith
	@node-sass $(SRC)main/resources/scss -o $(SRC)main/resources/css
	@postcss --use autoprefixer -r $(SRC)main/resources/css/*.css

build: check test compile
	@echo "Done."

compile: clean styles
	@mkdir -p $(DIST)client
	@mkdir -p $(DIST)server
##the server code doesn't compile, just copy it.
	@cp -r $(SRC)server/ $(DIST)server/
## copy static assets
	@(cd $(SRC)main; rsync -Rr . ../../$(DIST)client)
	@rm -r $(DIST)client/js
	@rm -r $(DIST)client/resources/scss
##compile
	@NODE_ENV="production" $(CC) ./webpack.config.js
##record versions
	@npm la 2>/dev/null > $(DIST)client/js/versions.txt || true
	@npm ls 2>/dev/null | grep nti- | sed -e 's/^[\│\├\─\┬\└\ ]\{1,\}/z /g' | sort | sed -e 's/^z/-/g' > $(DIST)client/js/nti-versions.txt || true


clean-styles:
	@rm -rf $(SRC)main/resources/css
	@rm -f $(SRC)main/resources/scss/utils/_icons.scss
	@rm -f $(SRC)main/resources/images/sprite.png

clean: clean-styles
	@rm -rf $(DIST)
