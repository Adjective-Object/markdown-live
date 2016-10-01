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


#####################
# User Target Rules #
#####################

.PHONY: \
	all clean lint fixlint lintfix\
	web watch-web prod-web phony-web\
	app watch-app prod-app phony-app\
	prod-pkg

all: pkg
clean:
	rm -rf dist

pkg: \
	dist/$(BUILD_TYPE)/md-live-linux-x64 \
	dist/$(BUILD_TYPE)/pkg/md-live.tar

lint:
	eslint client server electron

fixlint lintfix:
	eslint --fix client server electron

web: dist/$(BUILD_TYPE)/web/server.js

app: dist/$(BUILD_TYPE)/electron/main.js

# Setting environment variables is hard, so we have these convenicne aliases
# for watching during dev and making prod builds

watch-web:
	WEBPACK_APPLICATION_FLAGS=--watch make phony-web

watch-app:
	WEBPACK_APPLICATION_FLAGS=--watch make phony-app

prod-web:
	MD_LIVE_BUILD=prod make web

prod-app:
	MD_LIVE_BUILD=prod make app

prod-pkg:
	MD_LIVE_BUILD=prod make pkg

##########################
# Packaging Applications #
##########################

# As with the application below, we only track the build status of the linux
# package, and assume the remainder of them are produced as side-effects.
dist/$(BUILD_TYPE)/md-live-linux-x64: \
		dist/$(BUILD_TYPE)/electron/main.js \
		dist/$(BUILD_TYPE)/electron/package.json \
		dist/$(BUILD_TYPE)/electron/README.md
	mkdir -p $$(dirname $@)
	electron-packager dist/$(BUILD_TYPE)/electron \
		--all \
		--out=dist/$(BUILD_TYPE) \
		--overwrite

dist/$(BUILD_TYPE)/pkg/md-live.tar: \
		dist/$(BUILD_TYPE)/web/server.js \
		dist/$(BUILD_TYPE)/web/package.json \
		dist/$(BUILD_TYPE)/web/README.md
	mkdir -p $$(dirname $@)
	cd dist/$(BUILD_TYPE) && tar -c -f pkg/md-live.tar web


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
		dist/$(BUILD_TYPE)/electron/package.json \
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

# html index used by electron
dist/$(BUILD_TYPE)/electron/assets/index.html: electron/index.html
	mkdir -p $$(dirname $@)
	cp $< $@

# mdlive 'executable' for launching the web server from cli
dist/$(BUILD_TYPE)/web/bin/mdlive: server/bin/mdlive
	mkdir -p $$(dirname $@)
	cp $< $@
