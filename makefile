
all: web app

pkg: md-live.tar
clean:
	rm -rf dist

.PHONY: lint bundle-web bundle-app

WEBPACK_FLAGS=
SYFFIX=
ifeq ($(MD_LIVE_BUILD),dev)
	WEBPACK_FLAGS=-d
	SUFFIX=-dev
endif

lint:
	eslint client server

web bundle-web: \
	dist/web$(SUFFIX)/README.md \
	dist/web$(SUFFIX)/package.json \
	\
	dist/web$(SUFFIX)/server.js \
	dist/web$(SUFFIX)/public/js/client.js \
	dist/web$(SUFFIX)/public/js/client.lib.js \
	dist/web$(SUFFIX)/bin/mdlive \
	dist/web$(SUFFIX)/public/css/default.css \
	\
	dist/web$(SUFFIX)/public/css/markdown-document.css \
	dist/web$(SUFFIX)/public/css/structured-document.css \

app bundle-app: \
	dist/electron$(SUFFIX)/package.json \
	dist/electron$(SUFFIX)/main.js \
	\
	dist/electron$(SUFFIX)/assets/index.html \
	\
	dist/electron$(SUFFIX)/assets/css/default.css \
	dist/electron$(SUFFIX)/assets/css/markdown-document.css \
	dist/electron$(SUFFIX)/assets/css/structured-document.css \
	\
	dist/electron$(SUFFIX)/assets/js/client.lib.js \
	dist/electron$(SUFFIX)/assets/js/client.js \


DIRECTORIES=\
	dist \
	dist/web$(SUFFIX)/bin \
	dist/web$(SUFFIX) \
	dist/electron$(SUFFIX) \
	dist/electron$(SUFFIX)/assets \
	dist/web$(SUFFIX)public/css \
	dist/electron$(SUFFIX)/assets/css \

$(DIRECTORIES):
	mkdir -p $@


##############
# Web Client #
##############

dist/web$(SUFFIX)/README.md: README.md | dist/web$(SUFFIX)/
	cp $< $@

dist/web$(SUFFIX)/package.json: package.json | dist/web$(SUFFIX)/
	cp $< $@

dist/web$(SUFFIX)/public/css/%.css: webpack/webpack.style.js client/css/%.scss
	webpack $(WEBPACK_FLAGS) --config=$< --output-path $$(dirname $@)

dist/web$(SUFFIX)/public/js/client.js: \
		webpack/webpack.web.client.js \
		dist/web$(SUFFIX)/clientlib-manifest.json \
		client/js/*.js \
		client/js/templates/*.handlebars
	webpack $(WEBPACK_FLAGS) --config=$< --output-path $$(dirname $@)

dist/web$(SUFFIX)/clientlib-manifest.json dist/web$(SUFFIX)/public/js/client.lib.js: \
		webpack/webpack.web.clientlib.js
	webpack $(WEBPACK_FLAGS) --config=$< --output-path $$(dirname $@)

dist/web$(SUFFIX)/server.js: webpack/webpack.web.server.js \
		server/*.js \
		server/views/*.handlebars \
		server/document-types/*.js \
		server/document-types/*.handlebars
	webpack $(WEBPACK_FLAGS) --config=$< --output-path $$(dirname $@)

dist/web$(SUFFIX)/bin/mdlive: server/bin/mdlive | dist/web$(SUFFIX)/bin
	cp $< $@


############
# Electron #
############

dist/electron$(SUFFIX)/assets/js/client.js: \
		webpack/webpack.electron.client.js\
		dist/electron$(SUFFIX)/assets/clientlib-manifest.json \
		client/js/*.js \
		client/js/templates/*.handlebars | dist/electron$(SUFFIX)/assets
	webpack $(WEBPACK_FLAGS) --config=$< --output-path $$(dirname $@)

dist/electron$(SUFFIX)/assets/clientlib-manifest.json dist/electron$(SUFFIX)/assets/js/client.lib.js: \
		webpack/webpack.electron.clientlib.js | dist/electron$(SUFFIX)/assets
	webpack $(WEBPACK_FLAGS) --config=$<  --output-path $$(dirname $@)

dist/electron$(SUFFIX)/main.js: webpack/webpack.electron.js electron/*.js
	webpack $(WEBPACK_FLAGS) --config=$< --output-path $$(dirname $@)

dist/electron$(SUFFIX)/assets/css/%.css: webpack/webpack.style.js client/css/%.scss | dist/electron$(SUFFIX)/assets
	webpack $(WEBPACK_FLAGS) --config=$< --output-path='dist/electron$(SUFFIX)/assets/css'

dist/electron$(SUFFIX)/assets/index.html: electron/index.html | dist/electron$(SUFFIX)/assets/
	cp $< $@

dist/electron$(SUFFIX)/%: electron/% | dist/electron$(SUFFIX)/
	cp $< $@


###################
# Output Packages #
###################

md-live.tar: bundle-web dist/package.json dist/README.md
	find dist | grep '\.map$$' | xargs rm -f
	cd dist && tar -c -f ../$@ .
