#####################
# Control Variables #
#####################

WEBPACK_LIBRARY_FLAGS+= -d
WEBPACK_APPLICATION_FLAGS+= -d
BUILD_TYPE=dev
ifeq ($(MD_LIVE_BUILD),prod)
	WEBPACK_LIBRARY_FLAGS=
	WEBPACK_APPLICATION_FLAGS=
	BUILD_TYPE=prod
endif

NAME=md-live
APP_NAME=$(NAME)-app

#####################
# User Target Rules #
#####################

.PHONY: \
	all clean lint fixlint lintfix test\
	web watch-web prod-web phony-web\
	app watch-app prod-app phony-app\
	pkg, prod-pkg

all: pkg
clean:
	rm -rf dist

pkg: \
	dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-linux-x64.tar.gz \
	dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-linux-ia32.tar.gz \
	dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-linux-armv7l.tar.gz \
	dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-win32-x64.zip \
	dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-win32-ia32.zip \
	dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-darwin-x64.app.zip \
	dist/$(BUILD_TYPE)/pkg/$(NAME).tar

lint:
	eslint client server electron
	eslint -c webpack/.eslintrc webpack

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

web: dist/$(BUILD_TYPE)/web/server.js

app: dist/$(BUILD_TYPE)/electron/main.js

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
dist/$(BUILD_TYPE)/%-win32-x64: \
		dist/$(BUILD_TYPE)/electron/main.js \
		dist/$(BUILD_TYPE)/electron/package.json \
		dist/$(BUILD_TYPE)/electron/node_modules \
		dist/$(BUILD_TYPE)/electron/README.md
	mkdir -p $$(dirname $@)
	electron-packager dist/$(BUILD_TYPE)/electron \
		--all \
		--out=dist/$(BUILD_TYPE) \
		--overwrite

dist/$(BUILD_TYPE)/pkg/%.tar.gz: dist/$(BUILD_TYPE)/%
	mkdir -p $$(dirname $@)
	cd $$(dirname $<) && tar -czf pkg/$$(basename $@) $$(basename $<)

dist/$(BUILD_TYPE)/pkg/%.zip: dist/$(BUILD_TYPE)/%
	mkdir -p $$(dirname $@)
	cd $$(dirname $<) && zip pkg/$$(basename $@) $$(basename $<)

dist/$(BUILD_TYPE)/pkg/$(APP_NAME)-darwin-x64.app.zip: \
		dist/$(BUILD_TYPE)/$(APP_NAME)-darwin-x64/$(APP_NAME).app
	mkdir -p $$(dirname $@)
	cd dist/$(BUILD_TYPE) && zip \
		pkg/$(APP_NAME).app.zip \
		$(APP_NAME)-darwin-x64/$(APP_NAME).app


dist/$(BUILD_TYPE)/pkg/$(NAME).tar: \
		dist/$(BUILD_TYPE)/web/server.js \
		dist/$(BUILD_TYPE)/web/package.json \
		dist/$(BUILD_TYPE)/web/README.md
	mkdir -p $$(dirname $@)
	cd dist/$(BUILD_TYPE) && tar -c -f pkg/$(NAME).tar web


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
		dist/$(BUILD_TYPE)/web/bin/mdlive \
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
	dist/$(BUILD_TYPE)/electron/package.json
	cd $$(dirname $<) && npm install

# html index used by electron
dist/$(BUILD_TYPE)/electron/assets/index.html: electron/index.html
	mkdir -p $$(dirname $@)
	cp $< $@

# mdlive 'executable' for launching the web server from cli
dist/$(BUILD_TYPE)/web/bin/mdlive: server/bin/mdlive
	mkdir -p $$(dirname $@)
	cp $< $@

dist/$(BUILD_TYPE)/tests/electron/test-update: \
		webpack/webpack.electron.tests.js \
		client/tests/*.js \
		server/tests/*.js
	webpack --config=$< --bail
	touch $@
