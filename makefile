
all: web app

pkg: md-live.tar
clean:
	rm -rf dist

.PHONY: lint bundle-web bundle-app

lint:
	eslint client server

web bundle-web: \
	dist/server.js \
	dist/public/js/client.js \
	dist/public/js/client.lib.js \
	dist/bin/mdlive \
	dist/public/css/default.css \
	\
	dist/public/css/markdown-document.css \
	dist/public/css/structured-document.css \

app bundle-app: \
	dist/electron/package.json \
	dist/electron/main.js \
	\
	dist/electron/assets/index.html \
	\
	dist/electron/assets/css/default.css \
	dist/electron/assets/css/markdown-document.css \
	dist/electron/assets/css/structured-document.css \
	\
	dist/electron/assets/js/client.lib.js \
	dist/electron/assets/js/client.js \


DIRECTORIES=\
	dist \
	dist/bin \
	dist/electron \
	dist/electron/assets \
	dist/public/css \
	dist/electron/assets/css \

$(DIRECTORIES):
	mkdir -p $@

#######
# CSS #
#######

dist/public/css/%.css: webpack/webpack.style.js client/css/%.scss
	webpack --config=$<

dist/electron/assets/css/%.css: webpack/webpack.style.js client/css/%.scss | dist/electron/assets
	webpack --config=$< --output-path='dist/electron/assets/css'

##################
# Client Bundles #
###################

dist/public/js/client.js: \
		webpack/webpack.web.client.js \
		dist/clientlib-manifest.json \
		client/js/*.js \
		client/js/templates/*.handlebars
	webpack --config=$<

dist/clientlib-manifest.json dist/public/js/client.lib.js: \
		webpack/webpack.web.clientlib.js
	webpack --config=$<

dist/electron/assets/js/client.js: \
		webpack/webpack.electron.client.js\
		dist/electron/assets/clientlib-manifest.json \
		client/js/*.js \
		client/js/templates/*.handlebars | dist/electron/assets
	webpack -d --config=$< --output-path='dist/electron/assets/js'

dist/electron/assets/clientlib-manifest.json dist/electron/assets/js/client.lib.js: \
		webpack/webpack.electron.clientlib.js | dist/electron/assets
	webpack --config=$< --output-path='dist/electron/assets/js'

dist/server.js: webpack/webpack.web.server.js \
		server/*.js \
		server/views/*.handlebars \
		server/document-types/*.js \
		server/document-types/*.handlebars
	webpack --config=$<

dist/electron/main.js: webpack/webpack.electron.js electron/*.js
	webpack --config=$<



dist/bin/mdlive: server/bin/mdlive | dist/bin
	cp server/bin/mdlive dist/bin/mdlive

watch: bundle-web
	webpack --watch -d

md-live.tar: bundle-web dist/package.json dist/README.md
	find dist | grep '\.map$$' | xargs rm -f
	cd dist && tar -c -f ../$@ .


dist/electron/assets/index.html: electron/index.html | dist/electron/assets/
	cp $< $@

dist/electron/%: electron/% | dist/electron/
	cp $< $@

dist/README.md: README.md | dist/
	cp $< $@

dist/package.json: package.json | dist/
	cp $< $@
