#####################
# Control Variables #
#####################

WEBPACK_LIBRARY_FLAGS+= -d
WEBPACK_APPLICATION_FLAGS+= -d
BUILD_TYPE=dev
ELECTRON_PACKAGER_FLAGS=--no-prune
ifeq ($(MD_LIVE_BUILD),prod)
	WEBPACK_LIBRARY_FLAGS=
	WEBPACK_APPLICATION_FLAGS=
	BUILD_TYPE=prod
	NPM_INSTALL_FLAGS=--prod
	ELECTRON_PACKAGER_FLAGS=
endif

PROJECT_ROOT=$(shell pwd)
NODE_BIN=$(PROJECT_ROOT)/node_modules/.bin

NAME=sangria
APP_NAME=$(NAME)-app

#####################
# User Target Rules #
#####################

.PHONY: \
	all clean lint fixlint lintfix lint-prod prod-lint\
	test watch-test run-test runtest\
	web watch-web prod-web phony-web\
	app watch-app prod-app phony-app\
	pkg, prod-pkg

all: pkg
clean:
	rm -rf dist

.PRECIOUS: \
	dist/$(BUILD_TYPE)/$(APP_NAME)-linux-x64 \
	dist/$(BUILD_TYPE)/$(APP_NAME)-linux-ia32 \
	dist/$(BUILD_TYPE)/$(APP_NAME)-linux-armv7l \
	dist/$(BUILD_TYPE)/$(APP_NAME)-win32-x64 \
	dist/$(BUILD_TYPE)/$(APP_NAME)-win32-ia32 \
	dist/$(BUILD_TYPE)/$(APP_NAME)-darwin-x64 \

pkg: \
	dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-linux-x64.tar.gz \
	dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-linux-ia32.tar.gz \
	dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-linux-armv7l.tar.gz \
	dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-win32-x64.zip \
	dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-win32-ia32.zip \
	dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-darwin-x64.app.zip \
	dist/$(BUILD_TYPE)/pkg/$(APP_NAME).tar.gz \
	dist/$(BUILD_TYPE)/pkg/$(NAME).tar.gz

lint:
	eslint $(ESLINT_FLAGS) client server electron
	eslint $(ESLINT_FLAGS) -c webpack/.eslintrc webpack

lint-prod prod-lint:
	ESLINT_FLAGS='--max-warnings=0' make lint

# in order to run the tests, we compile the entire project with babel
TEST_PLATFORM=web

phony-test test:
	webpack $(WEBPACK_APPLICATION_FLAGS) --config=webpack/webpack.tests.js
	make runtest

run-test runtest:
	for x in $$(find dist/$(BUILD_TYPE)/tests/ |grep '\.js$$'); do \
		mocha $$x; \
	done;

fixlint lintfix:
	eslint --fix client server electron
	eslint --fix -c webpack/.eslintrc webpack

WEB_TARGETS=\
	dist/$(BUILD_TYPE)/web/server.js \
	dist/$(BUILD_TYPE)/web/server.js \
	dist/$(BUILD_TYPE)/web/package.json \
	dist/$(BUILD_TYPE)/web/README.md
web: $(WEB_TARGETS)

APP_TARGETS=\
	dist/$(BUILD_TYPE)/electron/main.js \
	dist/$(BUILD_TYPE)/electron/package.json \
	dist/$(BUILD_TYPE)/electron/README.md \
	# dist/$(BUILD_TYPE)/electron/node_modules
	
app: $(APP_TARGETS)

# Setting environment variables is hard, so we have these convenicne aliases
# for watching during dev and making prod builds

watch-web:
	WEBPACK_APPLICATION_FLAGS=--watch make phony-web

watch-app:
	WEBPACK_APPLICATION_FLAGS=--watch make phony-app

watch-test:
	WEBPACK_APPLICATION_FLAGS='--watch' make phony-test

prod-web:
	MD_LIVE_BUILD=prod make web

prod-app:
	MD_LIVE_BUILD=prod make app

prod-pkg:
	MD_LIVE_BUILD=prod make pkg

##########################
# Packaging Applications #
##########################

# we need to use pattern rules here to inform make that a
# single invocation of the rule builds all the packages
dist/$(BUILD_TYPE)/%-linux-x64 \
dist/$(BUILD_TYPE)/%-linux-ia32 \
dist/$(BUILD_TYPE)/%-linux-armv7l \
dist/$(BUILD_TYPE)/%-mas-x64 \
dist/$(BUILD_TYPE)/%-darwin-x64 \
dist/$(BUILD_TYPE)/%-win32-ia32 \
dist/$(BUILD_TYPE)/%-win32-x64: $(APP_TARGETS)
	mkdir -p $$(dirname $@)
	cd dist/$(BUILD_TYPE)/electron &&\
		$(NODE_BIN)/electron-packager . \
			$(ELECTRON_PACKAGER_FLAGS) \
			--all \
			--out=.. \
			--overwrite \

dist/$(BUILD_TYPE)/pkg/%.tar.gz: dist/$(BUILD_TYPE)/%
	mkdir -p $$(dirname $@)
	cd $$(dirname $<) && tar -czf pkg/$$(basename $@) $$(basename $<)

dist/$(BUILD_TYPE)/pkg/%.zip: dist/$(BUILD_TYPE)/%
	mkdir -p $$(dirname $@)
	cd $$(dirname $<) && zip -r pkg/$$(basename $@) $$(basename $<)

dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-darwin-x64.app.zip: \
		dist/$(BUILD_TYPE)/$(APP_NAME)-darwin-x64/$(APP_NAME).app
	mkdir -p $$(dirname $@)
	cd dist/$(BUILD_TYPE) && zip -r \
		pkg/$(APP_NAME)-darwin-x64.app.zip \
		$(APP_NAME)-darwin-x64/$(APP_NAME).app


dist/$(BUILD_TYPE)/pkg/$(NAME).tar.gz: $(WEB_TARGETS)
	mkdir -p $$(dirname $@)
	cd dist/$(BUILD_TYPE) && tar -czf pkg/$(NAME).tar.gz web

dist/$(BUILD_TYPE)/pkg/$(APP_NAME).tar.gz: $(APP_TARGETS)
	mkdir -p $$(dirname $@)
	cd dist/$(BUILD_TYPE) && tar -czf pkg/$(APP_NAME).tar.gz electron


###########################################
# Webpack the Application, after the libs #
###########################################

# we don't want to track all the js files that are built in the same build step
# because we don't use the separate webpack subbundles in the makefile, so we
# track if it has run based on server.js
phony-web dist/$(BUILD_TYPE)/web/server.js: \
		webpack/webpack.web.js \
		\
		dist/$(BUILD_TYPE)/web/public/js/client.lib.js \
		dist/$(BUILD_TYPE)/web/bin/sangria \
		server/*.js \
		server/views/*.handlebars \
		server/document-types/*.js \
		server/document-types/*.handlebars \

	webpack $(WEBPACK_APPLICATION_FLAGS) --config=$<

# same as above
phony-app dist/$(BUILD_TYPE)/electron/main.js: \
		webpack/webpack.electron.js \
		\
		dist/$(BUILD_TYPE)/electron/assets/js/client.lib.js \
		dist/$(BUILD_TYPE)/electron/bin/sangria-app \
		server/*.js \
		server/views/*.handlebars \
		server/document-types/*.js \
		server/document-types/*.handlebars \
		dist/$(BUILD_TYPE)/electron/assets/index.html

	webpack $(WEBPACK_APPLICATION_FLAGS) --config=$<


##############################
# Webpack the Client Library #
##############################

dist/$(BUILD_TYPE)/web/public/js/client.lib.js: \
		webpack/web/webpack.web.clientlib.js
	webpack $(WEBPACK_LIBRARY_FLAGS) --config=$<

dist/$(BUILD_TYPE)/electron/assets/js/client.lib.js: \
		webpack/electron/webpack.electron.clientlib.js
	webpack $(WEBPACK_LIBRARY_FLAGS) --config=$<


##################################################
# Files copied directly (not managed by webpack) #
##################################################

# readme
dist/$(BUILD_TYPE)/%/README.md: README.md
	mkdir -p $$(dirname $@)
	cp $< $@

# package.json
dist/$(BUILD_TYPE)/%/package.json: %/package.json
	mkdir -p $$(dirname $@)
	cp $< $@

dist/$(BUILD_TYPE)/electron/node_modules: \
	dist/$(BUILD_TYPE)/electron/package.json \
	dist/$(BUILD_TYPE)/electron/README.md
	cd $$(dirname $<) && npm install $(NPM_INSTALL_FLAGS)

# html index used by electron
dist/$(BUILD_TYPE)/electron/assets/index.html: electron/index.html
	mkdir -p $$(dirname $@)
	cp $< $@

# sangria 'executable' for launching the web server from cli
dist/$(BUILD_TYPE)/web/bin/sangria: server/bin/sangria
	mkdir -p $$(dirname $@)
	cp $< $@

dist/$(BUILD_TYPE)/electron/bin/sangria-app: electron/bin/sangria-app
	mkdir -p $$(dirname $@)
	cp $< $@

dist/$(BUILD_TYPE)/tests/electron/test-update: \
		webpack/webpack.electron.tests.js \
		client/tests/*.js \
		server/tests/*.js
	webpack --config=$< --bail
	touch $@
