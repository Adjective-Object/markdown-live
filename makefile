
all: bundle
dist: md-live.tar
clean:
	rm -rf dist

bundle: \
	dist/server.js \
	dist/public/js/client.js \
	dist/public/js/client.lib.js \
	dist/bin/mdlive \
	dist/public/css/default.css \
	\
	dist/public/css/markdown-document.css \
	dist/public/css/structured-document.css \
	\
	dist/public/img/chevron-light.svg \
	dist/public/img/chevron.svg \
	dist/public/img/sun.svg \
	dist/public/img/moon.svg \

dist/public/css/%.css: webpack/webpack.style.js client/css/%.scss
	webpack --config=$<

dist/public/img/%.svg: client/img/%.svg dist/public/img/
	cp $< $@ 

dist/public/js/client.js: webpack/webpack.client.js \
		client/js/*.js \
		client/js/templates/*.handlebars
	webpack --config=$<

dist/public/js/client.lib.js: webpack/webpack.clientlib.js
	webpack --config=$<

dist/server.js: webpack/webpack.server.js \
		server/*.js \
		server/views/*.handlebars \
		server/document-types/*.js \
		server/document-types/*.handlebars

	webpack --config=$<

dist/bin/mdlive: server/bin/mdlive
	mkdir -p dist/bin
	cp server/bin/mdlive dist/bin/mdlive

dist/public/img/:
	mkdir -p $@

watch: bundle
	webpack --watch -d

md-live.tar: bundle
	tar -c -f md-live.tar dist
