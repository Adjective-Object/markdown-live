Prism = require('prismjs')
Gator = require('gator')
io = require('socket.io-client')
mdTemplate = require('./markdown.handlebars')
Stapes = require('stapes')
domready = require('domready')
_ = require('underscore')

Template = this.Template || {}
Template.markdown = mdTemplate,

function() {
    "use strict";

    // mdlive singleton
    var App = function() {
        return this instanceof MarkdownLive ? void this.initialize() : new App
    };

    App.prototype = function() {
        console.log('declaring mdlive prototype');

        var socketClient = io.connect(Db.socket || "http://localhost"),
            Models = {},
            Controllers = {},
            Events = {};

        // Models logic
        Models.Files = Stapes.subclass({
            constructor: function() {
                console.log('construct Models')
                this.initialize();
                this.events();
            },

            initialize: function() {
                console.log('Models.initialize');

                var self = this;
                socketClient.on("initialize", function(files) {
                    console.log('socketClient evt initialize', files);

                    console.log('removing files')
                    self.remove();
                    console.log('selcting a file')
                    files[0].selected = true;
                    console.log('pushing files')
                    self.push(files);

                    console.log('AFTER SOCKETCLIENT INITIALIZATION', self);
                })
            },

            events: function() {
                var a = this;

                console.log('socket client initializing handlers');

                socketClient.on("data", function(b) {
                    console.log('socketClient data ' + b);
                    var c = a.find(b);
                    a.update(Models.id, function(a) {
                        return a.name = b.name, a.dir = b.dir, a.content = b.content, a.markdown = b.markdown, a
                    }), a.select(c)
                }),
                
                socketClient.on("rm", function(b) {
                    console.log('socketClient rm ' + b);
                    var c = a.find(b);
                    c && a.remove(Models.id)
                }),
                
                socketClient.on("push", function(b) {
                    console.log('socketClient push ' + b);
                    var c = a.find(b);
                    if (!c) {
                        var d = a.push(b),
                            c = a.find(d);
                        a.select(c)
                    }
                });
            },

            find: function(a) {
                return this.get(function(b) {
                    var c = "[object String]" === toString.call(a) ? a : a.path;
                    return b.path === c
                })
            },

            getActive: function() {
                return this.get(function(a) {
                    return a.selected
                })
            },

            unselect: function() {
                var a = this.getActive();
                a && this.update(
                    a.id,
                    function(a) {
                        return a.selected = null, a
                    },
                    !0)
            },

            select: function(a) {
                this.unselect();
                this.update(a.id, function(a) {
                    return a.selected = !0, a
                });
            }

        })

        Controllers.Files = Stapes.subclass({
            constructor: function() {
                console.log('construct App')

                this.model = {};
                this.model.files = Models.Files;

                this.element = {
                    markdown: document.getElementById("markdown")
                }

                this.view = new Events.Files(this.element)
                this.events();
            },

            events: function() {
                this.model.files.on({
                    change: function() {
                        console.log('this.model.files.on change');
                        this.render()
                    }
                }, this),
                
                this.view.on({
                    switchFile: function(a) {
                        console.log('this.view.on switchFile');
                        this.model.files.select(a)
                    }
                }, this)
            },

            render: function() {
                console.log('render Controller, model is', this.model.files);

                var directories = _.groupBy( this.model.files, function(a) {
                    console.log('groupby on dir', a, a.dir);
                    return a.dir
                });

                console.log(directories);

                var directoryHTML = Template.markdown({
                    dirs: directories,
                    current: this.model.files.getActive(),
                });

                this.element.markdown.innerHTML = directoryHTML,
                Prism.highlightAll()


            }
        }),
        
        // runtime event handlers
        Events.Files = Stapes.subclass({
            constructor: function(a) {
                this.element = a;
                this.events();
            },

            events: function() {

                var self = this;
                Gator(document).on("click", "[data-file]", function(e) {
                    e.preventDefault(),
                    self.emit("switchFile", {
                        id: this.dataset.file
                    })
                })

                Gator(document).on("click", "#toggle-collapse", function(e) {
                    e.preventDefault();
                    // TODO move this to Model
                    document.getElementById('content')
                            .classList.toggle('collapsed')
                })
            }
        });

        // utility functions
        var util = {
            has: function(obj, prop) {
                return null !== obj && hasOwnProperty.call(obj, prop)
            },

            each: function(obj, callback) {
                for (var key in obj) callback.call(null, key, obj[key])
            }
        };

        return {
            constructor: App,

            initialize: function() {
                console.log('init');
                this.models();
                this.controllers();
            },

            models: function() {
                console.log('initializing models')

                // iterate over application components and initialize each one
                util.each(Models, function(id) {
                    console.log('initialize model (' + id + ')');
                    console.log(Models[id]);
                    Models[id] = new Models[id]()
                    console.log(Models[id]);
                })

                console.log(Models);
            },

            controllers: function() {
                console.log('initializing controllers')
                util.each(Controllers, function(id) {
                    console.log('initialize controller (' + id + ')');
                    new Controllers[id]()
                })
            }
        }

    }();

    window.MarkdownLive = App
}()

domready(function() {
    "use strict";
    console.log('domready');

    new MarkdownLive();
});
