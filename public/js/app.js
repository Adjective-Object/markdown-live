/*
 *  ____  _                           _
 * / ___|| |_ __ _ _ __   ___  ___   (_)___  (*)
 * \___ \| __/ _` | '_ \ / _ \/ __|  | / __|
 *  ___) | || (_| | |_) |  __/\__ \_ | \__ \
 * |____/ \__\__,_| .__/ \___||___(_)/ |___/
 *                |_|              |__/
 *
 * (*) the Javascript MVC microframework that does just enough
 *
 * (c) Hay Kranen < hay@bykr.org >
 * Released under the terms of the MIT license
 * < http://en.wikipedia.org/wiki/MIT_License >
 *
 * Stapes.js : http://hay.github.com/stapes
 * @license
 *
 */
! function() {
    "use strict";
    var a = "0.8.1",
        b = 1;
    if (!Object.create) var c = function() {};
    var d = Array.prototype.slice,
        e = {
            attributes: {},
            eventHandlers: {
                "-1": {}
            },
            guid: -1,
            addEvent: function(a) {
                e.eventHandlers[a.guid][a.type] || (e.eventHandlers[a.guid][a.type] = []);
                var b = {},
                    c = ["guid", "handler", "scope", "type"];
                for (var d in c) {
                    var f = c[d];
                    b[f] = a[f]
                }
                e.eventHandlers[a.guid][a.type].push(b)
            },
            addEventHandler: function(a, b, c) {
                var d, f = {};
                "string" === e.typeOf(a) ? (d = c || !1, f[a] = b) : (d = b || !1, f = a);
                for (var g in f)
                    for (var h = f[g], i = g.split(" "), j = 0, k = i.length; k > j; j++) {
                        var l = i[j],
                            m = {
                                guid: this._guid || this._.guid,
                                handler: h,
                                scope: d,
                                type: l
                            };
                        e.addEvent.call(this, m)
                    }
            },
            addGuid: function(a, c) {
                (!a._guid || c) && (a._guid = b++, e.attributes[a._guid] = {}, e.eventHandlers[a._guid] = {})
            },
            attr: function(a) {
                return e.attributes[a]
            },
            clone: function(a) {
                var b, c = e.typeOf(a);
                switch (c) {
                    case "object":
                        b = e.extend({}, a);
                        break;
                    case "array":
                        b = a.slice(0)
                }
                return b
            },
            create: function(a) {
                return Object.create ? Object.create(a) : (c.prototype = a, new c)
            },
            createSubclass: function(a, b) {
                function c() {
                    if (!(this instanceof c)) throw new Error("Please use 'new' when initializing Stapes classes");
                    this.on && e.addGuid(this, !0), g.apply(this, arguments)
                }
                a = a || {}, b = b || !1;
                var d = a.superclass.prototype,
                    g = e.has(a, "constructor") ? a.constructor : function() {};
                b && e.extend(d, f), c.prototype = e.create(d), c.prototype.constructor = c;
                var h = {
                    extend: function() {
                        return e.extendThis.apply(this, arguments)
                    },
                    parent: d,
                    proto: function() {
                        return e.extendThis.apply(this.prototype, arguments)
                    },
                    subclass: function(a) {
                        return a = a || {}, a.superclass = this, e.createSubclass(a)
                    }
                };
                e.extend(c, h);
                for (var i in a) {
                    var j = "constructor" !== i && "superclass" !== i;
                    j && (c.prototype[i] = a[i])
                }
                return c
            },
            emitEvents: function(a, b, c, f) {
                c = c || !1, f = f || this._guid;
                for (var g = d.call(e.eventHandlers[f][a]), h = 0, i = g.length; i > h; h++) {
                    var j = e.extend({}, g[h]),
                        k = j.scope ? j.scope : this;
                    c && (j.type = c), j.scope = k, j.handler.call(j.scope, b, j)
                }
            },
            extend: function() {
                for (var a = d.call(arguments), b = a.shift(), c = 0, e = a.length; e > c; c++) {
                    var f = a[c];
                    for (var g in f) b[g] = f[g]
                }
                return b
            },
            extendThis: function() {
                var a = d.call(arguments);
                return a.unshift(this), e.extend.apply(this, a)
            },
            has: function(a, b) {
                return null != a && hasOwnProperty.call(a, b)
            },
            hasId: function(a) {
                return a === Object(a) && e.has(a, "id") ? a.id : e.makeUuid()
            },
            makeUuid: function() {
                return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(a) {
                    var b = 16 * Math.random() | 0,
                        c = "x" == a ? b : 3 & b | 8;
                    return c.toString(16)
                })
            },
            removeAttribute: function(a, b) {
                b = b || !1;
                for (var c = e.trim(a).split(" "), d = {}, f = 0, g = c.length; g > f; f++) {
                    var h = e.trim(c[f]);
                    h && (d.key = h, d.oldValue = e.attr(this._guid)[h], delete e.attr(this._guid)[h], b || (this.emit("change", h), this.emit("change:" + h), this.emit("mutate", d), this.emit("mutate:" + h, d), this.emit("remove", h), this.emit("remove:" + h)), delete d.oldValue)
                }
            },
            removeEventHandler: function(a, b) {
                var c = e.eventHandlers[this._guid];
                if (a && b) {
                    if (c = c[a], !c) return;
                    for (var d, f = 0, g = c.length; g > f; f++) d = c[f].handler, d && d === b && (c.splice(f--, 1), g--)
                } else a ? delete c[a] : e.eventHandlers[this._guid] = {}
            },
            setAttribute: function(a, b, c) {
                c = c || !1;
                var d = this.has(a),
                    f = e.attr(this._guid)[a];
                if (b !== f && (e.attr(this._guid)[a] = b, !c)) {
                    this.emit("change", a), this.emit("change:" + a, b);
                    var g = {
                        key: a,
                        newValue: b,
                        oldValue: f || null
                    };
                    this.emit("mutate", g), this.emit("mutate:" + a, g);
                    var h = d ? "update" : "create";
                    this.emit(h, a), this.emit(h + ":" + a, b)
                }
            },
            trim: function(a) {
                return a.replace(/^\s\s*/, "").replace(/\s\s*$/, "")
            },
            typeOf: function(a) {
                return null === a || "undefined" == typeof a ? String(a) : Object.prototype.toString.call(a).replace(/\[object |\]/g, "").toLowerCase()
            },
            updateAttribute: function(a, b, c) {
                var d = this.get(a),
                    f = e.typeOf(d);
                ("object" === f || "array" === f) && (d = e.clone(d));
                var g = b.call(this, d, a);
                e.setAttribute.call(this, a, g, c || !1)
            }
        },
        f = {
            emit: function(a, b) {
                b = "undefined" === e.typeOf(b) ? null : b;
                for (var c = a.split(" "), d = e.emitEvents, f = e.eventHandlers, g = f[-1], h = f[this._guid], i = "number" === e.typeOf(this._guid), j = 0, k = c.length; k > j; j++) {
                    var l = c[j];
                    g.all && d.call(this, "all", b, l, -1), g[l] && d.call(this, l, b, l, -1), i && (h.all && d.call(this, "all", b, l), h[l] && d.call(this, l, b))
                }
            },
            off: function() {
                e.removeEventHandler.apply(this, arguments)
            },
            on: function() {
                e.addEventHandler.apply(this, arguments)
            }
        };
    e.Module = function() {}, e.Module.prototype = {
        countBy: function(a) {
            if (!a || "function" !== e.typeOf(a)) return {};
            var b = {};
            return this.each(function(b, c) {
                var d = a.call(this, b, c);
                e.has(arr, d) ? arr[d] ++ : arr[d] = 1
            }), b
        },
        each: function(a, b) {
            var c = e.attr(this._guid);
            for (var d in c) a.call(b || this, c[d], d)
        },
        extend: function() {
            return e.extendThis.apply(this, arguments)
        },
        filter: function(a) {
            var b = [],
                c = e.attr(this._guid);
            for (var d in c) {
                var f = c[d];
                a.call(this, f, d) && ("object" !== e.typeOf(f) || f.id || (f.id = d), b.push(f))
            }
            return b
        },
        get: function(a) {
            if ("string" === e.typeOf(a)) {
                if (arguments.length > 1) {
                    for (var b = {}, c = 0, d = arguments.length; d > c; c++) {
                        var f = arguments[c];
                        b[f] = this.get(f)
                    }
                    return b
                }
                return this.has(a) ? e.attr(this._guid)[a] : null
            }
            if ("function" == typeof a) {
                var g = this.filter(a);
                return g.length ? g[0] : null
            }
        },
        getAll: function() {
            return e.clone(e.attr(this._guid))
        },
        getAllAsArray: function() {
            var a = [],
                b = e.attr(this._guid);
            for (var c in b) {
                var d = b[c];
                "object" !== e.typeOf(d) || d.id || (d.id = c), a.push(d)
            }
            return a
        },
        groupBy: function(a) {
            if (!a || "function" !== e.typeOf(a)) return {};
            var b = {};
            return this.each(function(c, d) {
                var f = a.call(this, c, d);
                "object" !== e.typeOf(c) || c.id || (c.id = d), e.has(b, f) ? b[f].push(c) : b[f] = [c]
            }), b
        },
        has: function(a) {
            return "undefined" !== e.typeOf(e.attr(this._guid)[a])
        },
        keys: function() {
            if (Object.keys) return Object.keys(e.attr(this._guid));
            var a = [];
            return this.each(function(b, c) {
                c && a.push(c)
            }), a
        },
        map: function(a, b) {
            var c = [];
            return this.each(function(d, e) {
                c.push(a.call(b || this, d, e))
            }, b || this), c
        },
        pluck: function(a) {
            return this.map(function(b) {
                return b[a]
            })
        },
        push: function(a, b) {
            if ("array" === e.typeOf(a))
                for (var c = 0, d = a.length; d > c; c++) {
                    var f = e.hasId(a[c]);
                    e.setAttribute.call(this, f, a[c], b || !1)
                } else {
                    var f = e.hasId(a);
                    e.setAttribute.call(this, f, a, b || !1)
                }
            return "array" === e.typeOf(a) ? this : f
        },
        remove: function(a, b) {
            return "undefined" === e.typeOf(a) ? (e.attributes[this._guid] = {}, this.emit("change remove")) : "function" === e.typeOf(a) ? this.each(function(c, d) {
                a(c) && e.removeAttribute.call(this, d, b)
            }) : e.removeAttribute.call(this, a, b || !1), this
        },
        set: function(a, b, c) {
            if ("object" === e.typeOf(a))
                for (var d in a) e.setAttribute.call(this, d, a[d], b || !1);
            else e.setAttribute.call(this, a, b, c || !1);
            return this
        },
        size: function() {
            var a = e.attr(this._guid);
            return a.length === +a.length ? a.length : this.keys().length
        },
        sortBy: function(a) {
            if (!a || "function" !== e.typeOf(a)) return [];
            var b = this.map(function(b, c) {
                    return {
                        value: b,
                        key: c,
                        criteria: a.call(this, b, c)
                    }
                }).sort(function(a, b) {
                    var c = a.criteria,
                        d = b.criteria;
                    if (c !== d) {
                        if (c > d || void 0 === c) return 1;
                        if (d > c || void 0 === d) return -1
                    }
                    return a.index - b.index
                }),
                c = [];
            for (var d in b) {
                var f = b[d],
                    g = e.has(f, "key") ? {
                        key: f.key,
                        value: f.value
                    } : f.value;
                c.push(g)
            }
            return c
        },
        update: function(a, b, c) {
            return "string" === e.typeOf(a) ? e.updateAttribute.call(this, a, b, c || !1) : "function" === e.typeOf(a) && this.each(function(b, c) {
                e.updateAttribute.call(this, c, a)
            }), this
        }
    };
    var g = {
        _: e,
        extend: function() {
            return e.extendThis.apply(e.Module.prototype, arguments)
        },
        mixinEvents: function(a) {
            return a = a || {}, e.addGuid(a), e.extend(a, f)
        },
        on: function() {
            e.addEventHandler.apply(this, arguments)
        },
        subclass: function(a, b) {
            return b = b || !1, a = a || {}, a.superclass = b ? function() {} : e.Module, e.createSubclass(a, !b)
        },
        version: a
    };
    "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = g), exports.Stapes = g) : "function" == typeof define && define.amd ? define(function() {
        return g
    }) : window.Stapes = g
}(),
/**
 * Copyright 2014 Craig Campbell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * GATOR.JS
 * Simple Event Delegation
 * @license
 * @version 1.2.3
 *
 * Compatible with IE 9+, FF 3.6+, Safari 5+, Chrome
 *
 * Include legacy.js for compatibility with older browsers
 *
 *             .-._   _ _ _ _ _ _ _ _
 *  .-''-.__.-'00  '-' ' ' ' ' ' ' ' '-.
 * '.___ '    .   .--_'-' '-' '-' _'-' '._
 *  V: V 'vv-'   '_   '.       .'  _..' '.'.
 *    '=.____.=_.--'   :_.__.__:_   '.   : :
 *            (((____.-'        '-.  /   : :
 *                              (((-'\ .' /
 *                            _____..'  .'
 *                           '-._____.-'
 */
function() {
    function a(a, b, c) {
        var d = "blur" == b || "focus" == b;
        a.element.addEventListener(b, c, d)
    }

    function b(a) {
        a.preventDefault(), a.stopPropagation()
    }

    function c(a) {
        return j ? j : j = a.matches ? a.matches : a.webkitMatchesSelector ? a.webkitMatchesSelector : a.mozMatchesSelector ? a.mozMatchesSelector : a.msMatchesSelector ? a.msMatchesSelector : a.oMatchesSelector ? a.oMatchesSelector : i.matchesSelector
    }

    function d(a, b, e) {
        if ("_root" == b) return e;
        if (a !== e) return c(a).call(a, b) ? a : a.parentNode ? (k++, d(a.parentNode, b, e)) : void 0
    }

    function e(a, b, c, d) {
        m[a.id] || (m[a.id] = {}), m[a.id][b] || (m[a.id][b] = {}), m[a.id][b][c] || (m[a.id][b][c] = []), m[a.id][b][c].push(d)
    }

    function f(a, b, c, d) {
        if (m[a.id])
            if (b) {
                if (!d && !c) return void(m[a.id][b] = {});
                if (!d) return void delete m[a.id][b][c];
                if (m[a.id][b][c])
                    for (var e = 0; e < m[a.id][b][c].length; e++)
                        if (m[a.id][b][c][e] === d) {
                            m[a.id][b][c].splice(e, 1);
                            break
                        }
            } else
                for (var f in m[a.id]) m[a.id].hasOwnProperty(f) && (m[a.id][f] = {})
    }

    function g(a, b, c) {
        if (m[a][c]) {
            var e, f, g = b.target || b.srcElement,
                h = {},
                j = 0,
                l = 0;
            k = 0;
            for (e in m[a][c]) m[a][c].hasOwnProperty(e) && (f = d(g, e, n[a].element), f && i.matchesEvent(c, n[a].element, f, "_root" == e, b) && (k++, m[a][c][e].match = f, h[k] = m[a][c][e]));
            for (b.stopPropagation = function() {
                    b.cancelBubble = !0
                }, j = 0; k >= j; j++)
                if (h[j])
                    for (l = 0; l < h[j].length; l++) {
                        if (h[j][l].call(h[j].match, b) === !1) return void i.cancel(b);
                        if (b.cancelBubble) return
                    }
        }
    }

    function h(a, b, c, d) {
        function h(a) {
            return function(b) {
                g(k, b, a)
            }
        }
        if (this.element) {
            a instanceof Array || (a = [a]), c || "function" != typeof b || (c = b, b = "_root");
            var j, k = this.id;
            for (j = 0; j < a.length; j++) d ? f(this, a[j], b, c) : (m[k] && m[k][a[j]] || i.addEvent(this, a[j], h(a[j])), e(this, a[j], b, c));
            return this
        }
    }

    function i(a, b) {
        if (!(this instanceof i)) {
            for (var c in n)
                if (n[c].element === a) return n[c];
            return l++, n[l] = new i(a, l), n[l]
        }
        this.element = a, this.id = b
    }
    var j, k = 0,
        l = 0,
        m = {},
        n = {};
    i.prototype.on = function(a, b, c) {
        return h.call(this, a, b, c)
    }, i.prototype.off = function(a, b, c) {
        return h.call(this, a, b, c, !0)
    }, i.matchesSelector = function() {}, i.cancel = b, i.addEvent = a, i.matchesEvent = function() {
        return !0
    }, window.Gator = i
}(),
/*!
 * domready (c) Dustin Diaz 2014 - License MIT
 * @license
 */
! function(a, b) {
    "undefined" != typeof module ? module.exports = b() : "function" == typeof define && "object" == typeof define.amd ? define(b) : this[a] = b()
}("domready", function() {
    var a, b = [],
        c = document,
        d = c.documentElement.doScroll,
        e = "DOMContentLoaded",
        f = (d ? /^loaded|^c/ : /^loaded|^i|^c/).test(c.readyState);
    return f || c.addEventListener(e, a = function() {
            for (c.removeEventListener(e, a), f = 1; a = b.shift();) a()
        }),
        function(a) {
            f ? a() : b.push(a)
        }
});
/*!

handlebars v1.3.0

Copyright (C) 2011 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
@license
*/
var Handlebars = function() {
    var a = function() {
            "use strict";

            function a(a) {
                this.string = a
            }
            var b;
            return a.prototype.toString = function() {
                return "" + this.string
            }, b = a
        }(),
        b = function(a) {
            "use strict";

            function b(a) {
                return h[a] || "&amp;"
            }

            function c(a, b) {
                for (var c in b) Object.prototype.hasOwnProperty.call(b, c) && (a[c] = b[c])
            }

            function d(a) {
                return a instanceof g ? a.toString() : a || 0 === a ? (a = "" + a, j.test(a) ? a.replace(i, b) : a) : ""
            }

            function e(a) {
                return a || 0 === a ? m(a) && 0 === a.length ? !0 : !1 : !0
            }
            var f = {},
                g = a,
                h = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#x27;",
                    "`": "&#x60;"
                },
                i = /[&<>"'`]/g,
                j = /[&<>"'`]/;
            f.extend = c;
            var k = Object.prototype.toString;
            f.toString = k;
            var l = function(a) {
                return "function" == typeof a
            };
            l(/x/) && (l = function(a) {
                return "function" == typeof a && "[object Function]" === k.call(a)
            });
            var l;
            f.isFunction = l;
            var m = Array.isArray || function(a) {
                return a && "object" == typeof a ? "[object Array]" === k.call(a) : !1
            };
            return f.isArray = m, f.escapeExpression = d, f.isEmpty = e, f
        }(a),
        c = function() {
            "use strict";

            function a(a, b) {
                var d;
                b && b.firstLine && (d = b.firstLine, a += " - " + d + ":" + b.firstColumn);
                for (var e = Error.prototype.constructor.call(this, a), f = 0; f < c.length; f++) this[c[f]] = e[c[f]];
                d && (this.lineNumber = d, this.column = b.firstColumn)
            }
            var b, c = ["description", "fileName", "lineNumber", "message", "name", "number", "stack"];
            return a.prototype = new Error, b = a
        }(),
        d = function(a, b) {
            "use strict";

            function c(a, b) {
                this.helpers = a || {}, this.partials = b || {}, d(this)
            }

            function d(a) {
                a.registerHelper("helperMissing", function(a) {
                    if (2 === arguments.length) return void 0;
                    throw new h("Missing helper: '" + a + "'")
                }), a.registerHelper("blockHelperMissing", function(b, c) {
                    var d = c.inverse || function() {},
                        e = c.fn;
                    return m(b) && (b = b.call(this)), b === !0 ? e(this) : b === !1 || null == b ? d(this) : l(b) ? b.length > 0 ? a.helpers.each(b, c) : d(this) : e(b)
                }), a.registerHelper("each", function(a, b) {
                    var c, d = b.fn,
                        e = b.inverse,
                        f = 0,
                        g = "";
                    if (m(a) && (a = a.call(this)), b.data && (c = q(b.data)), a && "object" == typeof a)
                        if (l(a))
                            for (var h = a.length; h > f; f++) c && (c.index = f, c.first = 0 === f, c.last = f === a.length - 1), g += d(a[f], {
                                data: c
                            });
                        else
                            for (var i in a) a.hasOwnProperty(i) && (c && (c.key = i, c.index = f, c.first = 0 === f), g += d(a[i], {
                                data: c
                            }), f++);
                    return 0 === f && (g = e(this)), g
                }), a.registerHelper("if", function(a, b) {
                    return m(a) && (a = a.call(this)), !b.hash.includeZero && !a || g.isEmpty(a) ? b.inverse(this) : b.fn(this)
                }), a.registerHelper("unless", function(b, c) {
                    return a.helpers["if"].call(this, b, {
                        fn: c.inverse,
                        inverse: c.fn,
                        hash: c.hash
                    })
                }), a.registerHelper("with", function(a, b) {
                    return m(a) && (a = a.call(this)), g.isEmpty(a) ? void 0 : b.fn(a)
                }), a.registerHelper("log", function(b, c) {
                    var d = c.data && null != c.data.level ? parseInt(c.data.level, 10) : 1;
                    a.log(d, b)
                })
            }

            function e(a, b) {
                p.log(a, b)
            }
            var f = {},
                g = a,
                h = b,
                i = "1.3.0";
            f.VERSION = i;
            var j = 4;
            f.COMPILER_REVISION = j;
            var k = {
                1: "<= 1.0.rc.2",
                2: "== 1.0.0-rc.3",
                3: "== 1.0.0-rc.4",
                4: ">= 1.0.0"
            };
            f.REVISION_CHANGES = k;
            var l = g.isArray,
                m = g.isFunction,
                n = g.toString,
                o = "[object Object]";
            f.HandlebarsEnvironment = c, c.prototype = {
                constructor: c,
                logger: p,
                log: e,
                registerHelper: function(a, b, c) {
                    if (n.call(a) === o) {
                        if (c || b) throw new h("Arg not supported with multiple helpers");
                        g.extend(this.helpers, a)
                    } else c && (b.not = c), this.helpers[a] = b
                },
                registerPartial: function(a, b) {
                    n.call(a) === o ? g.extend(this.partials, a) : this.partials[a] = b
                }
            };
            var p = {
                methodMap: {
                    0: "debug",
                    1: "info",
                    2: "warn",
                    3: "error"
                },
                DEBUG: 0,
                INFO: 1,
                WARN: 2,
                ERROR: 3,
                level: 3,
                log: function(a, b) {
                    if (p.level <= a) {
                        var c = p.methodMap[a];
                        "undefined" != typeof console && console[c] && console[c].call(console, b)
                    }
                }
            };
            f.logger = p, f.log = e;
            var q = function(a) {
                var b = {};
                return g.extend(b, a), b
            };
            return f.createFrame = q, f
        }(b, c),
        e = function(a, b, c) {
            "use strict";

            function d(a) {
                var b = a && a[0] || 1,
                    c = m;
                if (b !== c) {
                    if (c > b) {
                        var d = n[c],
                            e = n[b];
                        throw new l("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version (" + d + ") or downgrade your runtime to an older version (" + e + ").")
                    }
                    throw new l("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version (" + a[1] + ").")
                }
            }

            function e(a, b) {
                if (!b) throw new l("No environment passed to template");
                var c = function(a, c, d, e, f, g) {
                        var h = b.VM.invokePartial.apply(this, arguments);
                        if (null != h) return h;
                        if (b.compile) {
                            var i = {
                                helpers: e,
                                partials: f,
                                data: g
                            };
                            return f[c] = b.compile(a, {
                                data: void 0 !== g
                            }, b), f[c](d, i)
                        }
                        throw new l("The partial " + c + " could not be compiled when running in runtime-only mode")
                    },
                    d = {
                        escapeExpression: k.escapeExpression,
                        invokePartial: c,
                        programs: [],
                        program: function(a, b, c) {
                            var d = this.programs[a];
                            return c ? d = g(a, b, c) : d || (d = this.programs[a] = g(a, b)), d
                        },
                        merge: function(a, b) {
                            var c = a || b;
                            return a && b && a !== b && (c = {}, k.extend(c, b), k.extend(c, a)), c
                        },
                        programWithDepth: b.VM.programWithDepth,
                        noop: b.VM.noop,
                        compilerInfo: null
                    };
                return function(c, e) {
                    e = e || {};
                    var f, g, h = e.partial ? e : b;
                    e.partial || (f = e.helpers, g = e.partials);
                    var i = a.call(d, h, c, f, g, e.data);
                    return e.partial || b.VM.checkRevision(d.compilerInfo), i
                }
            }

            function f(a, b, c) {
                var d = Array.prototype.slice.call(arguments, 3),
                    e = function(a, e) {
                        return e = e || {}, b.apply(this, [a, e.data || c].concat(d))
                    };
                return e.program = a, e.depth = d.length, e
            }

            function g(a, b, c) {
                var d = function(a, d) {
                    return d = d || {}, b(a, d.data || c)
                };
                return d.program = a, d.depth = 0, d
            }

            function h(a, b, c, d, e, f) {
                var g = {
                    partial: !0,
                    helpers: d,
                    partials: e,
                    data: f
                };
                if (void 0 === a) throw new l("The partial " + b + " could not be found");
                return a instanceof Function ? a(c, g) : void 0
            }

            function i() {
                return ""
            }
            var j = {},
                k = a,
                l = b,
                m = c.COMPILER_REVISION,
                n = c.REVISION_CHANGES;
            return j.checkRevision = d, j.template = e, j.programWithDepth = f, j.program = g, j.invokePartial = h, j.noop = i, j
        }(b, c, d),
        f = function(a, b, c, d, e) {
            "use strict";
            var f, g = a,
                h = b,
                i = c,
                j = d,
                k = e,
                l = function() {
                    var a = new g.HandlebarsEnvironment;
                    return j.extend(a, g), a.SafeString = h, a.Exception = i, a.Utils = j, a.VM = k, a.template = function(b) {
                        return k.template(b, a)
                    }, a
                },
                m = l();
            return m.create = l, f = m
        }(d, a, c, b, e);
    return f
}();
/*
 * socket.io - http://socket.io/
 * MIT license
 * @license
 */
! function(a) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = a();
    else if ("function" == typeof define && define.amd) define([], a);
    else {
        var b;
        "undefined" != typeof window ? b = window : "undefined" != typeof global ? b = global : "undefined" != typeof self && (b = self), b.io = a()
    }
}(function() {
    var a;
    return function b(a, c, d) {
        function e(g, h) {
            if (!c[g]) {
                if (!a[g]) {
                    var i = "function" == typeof require && require;
                    if (!h && i) return i(g, !0);
                    if (f) return f(g, !0);
                    throw new Error("Cannot find module '" + g + "'")
                }
                var j = c[g] = {
                    exports: {}
                };
                a[g][0].call(j.exports, function(b) {
                    var c = a[g][1][b];
                    return e(c ? c : b)
                }, j, j.exports, b, a, c, d)
            }
            return c[g].exports
        }
        for (var f = "function" == typeof require && require, g = 0; g < d.length; g++) e(d[g]);
        return e
    }({
        1: [function(a, b) {
            b.exports = a("./lib/")
        }, {
            "./lib/": 2
        }],
        2: [function(a, b, c) {
            function d(a, b) {
                "object" == typeof a && (b = a, a = void 0), b = b || {};
                var c, d = e(a),
                    f = d.source,
                    j = d.id;
                return b.forceNew || b["force new connection"] || !1 === b.multiplex ? (h("ignoring socket cache for %s", f), c = g(f, b)) : (i[j] || (h("new io instance for %s", f), i[j] = g(f, b)), c = i[j]), c.socket(d.path)
            }
            var e = a("./url"),
                f = a("socket.io-parser"),
                g = a("./manager"),
                h = a("debug")("socket.io-client");
            b.exports = c = d;
            var i = c.managers = {};
            c.protocol = f.protocol, c.connect = d, c.Manager = a("./manager"), c.Socket = a("./socket")
        }, {
            "./manager": 3,
            "./socket": 5,
            "./url": 6,
            debug: 9,
            "socket.io-parser": 43
        }],
        3: [function(a, b) {
            function c(a, b) {
                return this instanceof c ? (a && "object" == typeof a && (b = a, a = void 0), b = b || {}, b.path = b.path || "/socket.io", this.nsps = {}, this.subs = [], this.opts = b, this.reconnection(b.reconnection !== !1), this.reconnectionAttempts(b.reconnectionAttempts || 1 / 0), this.reconnectionDelay(b.reconnectionDelay || 1e3), this.reconnectionDelayMax(b.reconnectionDelayMax || 5e3), this.timeout(null == b.timeout ? 2e4 : b.timeout), this.readyState = "closed", this.uri = a, this.connected = [], this.attempts = 0, this.encoding = !1, this.packetBuffer = [], this.encoder = new g.Encoder, this.decoder = new g.Decoder, this.autoConnect = b.autoConnect !== !1, void(this.autoConnect && this.open())) : new c(a, b)
            }
            var d = (a("./url"), a("engine.io-client")),
                e = a("./socket"),
                f = a("component-emitter"),
                g = a("socket.io-parser"),
                h = a("./on"),
                i = a("component-bind"),
                j = (a("object-component"), a("debug")("socket.io-client:manager")),
                k = a("indexof");
            b.exports = c, c.prototype.emitAll = function() {
                this.emit.apply(this, arguments);
                for (var a in this.nsps) this.nsps[a].emit.apply(this.nsps[a], arguments)
            }, f(c.prototype), c.prototype.reconnection = function(a) {
                return arguments.length ? (this._reconnection = !!a, this) : this._reconnection
            }, c.prototype.reconnectionAttempts = function(a) {
                return arguments.length ? (this._reconnectionAttempts = a, this) : this._reconnectionAttempts
            }, c.prototype.reconnectionDelay = function(a) {
                return arguments.length ? (this._reconnectionDelay = a, this) : this._reconnectionDelay
            }, c.prototype.reconnectionDelayMax = function(a) {
                return arguments.length ? (this._reconnectionDelayMax = a, this) : this._reconnectionDelayMax
            }, c.prototype.timeout = function(a) {
                return arguments.length ? (this._timeout = a, this) : this._timeout
            }, c.prototype.maybeReconnectOnOpen = function() {
                this.openReconnect || this.reconnecting || !this._reconnection || 0 !== this.attempts || (this.openReconnect = !0, this.reconnect())
            }, c.prototype.open = c.prototype.connect = function(a) {
                if (j("readyState %s", this.readyState), ~this.readyState.indexOf("open")) return this;
                j("opening %s", this.uri), this.engine = d(this.uri, this.opts);
                var b = this.engine,
                    c = this;
                this.readyState = "opening", this.skipReconnect = !1;
                var e = h(b, "open", function() {
                        c.onopen(), a && a()
                    }),
                    f = h(b, "error", function(b) {
                        if (j("connect_error"), c.cleanup(), c.readyState = "closed", c.emitAll("connect_error", b), a) {
                            var d = new Error("Connection error");
                            d.data = b, a(d)
                        }
                        c.maybeReconnectOnOpen()
                    });
                if (!1 !== this._timeout) {
                    var g = this._timeout;
                    j("connect attempt will timeout after %d", g);
                    var i = setTimeout(function() {
                        j("connect attempt timed out after %d", g), e.destroy(), b.close(), b.emit("error", "timeout"), c.emitAll("connect_timeout", g)
                    }, g);
                    this.subs.push({
                        destroy: function() {
                            clearTimeout(i)
                        }
                    })
                }
                return this.subs.push(e), this.subs.push(f), this
            }, c.prototype.onopen = function() {
                j("open"), this.cleanup(), this.readyState = "open", this.emit("open");
                var a = this.engine;
                this.subs.push(h(a, "data", i(this, "ondata"))), this.subs.push(h(this.decoder, "decoded", i(this, "ondecoded"))), this.subs.push(h(a, "error", i(this, "onerror"))), this.subs.push(h(a, "close", i(this, "onclose")))
            }, c.prototype.ondata = function(a) {
                this.decoder.add(a)
            }, c.prototype.ondecoded = function(a) {
                this.emit("packet", a)
            }, c.prototype.onerror = function(a) {
                j("error", a), this.emitAll("error", a)
            }, c.prototype.socket = function(a) {
                var b = this.nsps[a];
                if (!b) {
                    b = new e(this, a), this.nsps[a] = b;
                    var c = this;
                    b.on("connect", function() {
                        ~k(c.connected, b) || c.connected.push(b)
                    })
                }
                return b
            }, c.prototype.destroy = function(a) {
                var b = k(this.connected, a);
                ~b && this.connected.splice(b, 1), this.connected.length || this.close()
            }, c.prototype.packet = function(a) {
                j("writing packet %j", a);
                var b = this;
                b.encoding ? b.packetBuffer.push(a) : (b.encoding = !0, this.encoder.encode(a, function(a) {
                    for (var c = 0; c < a.length; c++) b.engine.write(a[c]);
                    b.encoding = !1, b.processPacketQueue()
                }))
            }, c.prototype.processPacketQueue = function() {
                if (this.packetBuffer.length > 0 && !this.encoding) {
                    var a = this.packetBuffer.shift();
                    this.packet(a)
                }
            }, c.prototype.cleanup = function() {
                for (var a; a = this.subs.shift();) a.destroy();
                this.packetBuffer = [], this.encoding = !1, this.decoder.destroy()
            }, c.prototype.close = c.prototype.disconnect = function() {
                this.skipReconnect = !0, this.readyState = "closed", this.engine && this.engine.close()
            }, c.prototype.onclose = function(a) {
                j("close"), this.cleanup(), this.readyState = "closed", this.emit("close", a), this._reconnection && !this.skipReconnect && this.reconnect()
            }, c.prototype.reconnect = function() {
                if (this.reconnecting || this.skipReconnect) return this;
                var a = this;
                if (this.attempts++, this.attempts > this._reconnectionAttempts) j("reconnect failed"), this.emitAll("reconnect_failed"), this.reconnecting = !1;
                else {
                    var b = this.attempts * this.reconnectionDelay();
                    b = Math.min(b, this.reconnectionDelayMax()), j("will wait %dms before reconnect attempt", b), this.reconnecting = !0;
                    var c = setTimeout(function() {
                        a.skipReconnect || (j("attempting reconnect"), a.emitAll("reconnect_attempt", a.attempts), a.emitAll("reconnecting", a.attempts), a.skipReconnect || a.open(function(b) {
                            b ? (j("reconnect attempt error"), a.reconnecting = !1, a.reconnect(), a.emitAll("reconnect_error", b.data)) : (j("reconnect success"), a.onreconnect())
                        }))
                    }, b);
                    this.subs.push({
                        destroy: function() {
                            clearTimeout(c)
                        }
                    })
                }
            }, c.prototype.onreconnect = function() {
                var a = this.attempts;
                this.attempts = 0, this.reconnecting = !1, this.emitAll("reconnect", a)
            }
        }, {
            "./on": 4,
            "./socket": 5,
            "./url": 6,
            "component-bind": 7,
            "component-emitter": 8,
            debug: 9,
            "engine.io-client": 10,
            indexof: 39,
            "object-component": 40,
            "socket.io-parser": 43
        }],
        4: [function(a, b) {
            function c(a, b, c) {
                return a.on(b, c), {
                    destroy: function() {
                        a.removeListener(b, c)
                    }
                }
            }
            b.exports = c
        }, {}],
        5: [function(a, b, c) {
            function d(a, b) {
                this.io = a, this.nsp = b, this.json = this, this.ids = 0, this.acks = {}, this.io.autoConnect && this.open(), this.receiveBuffer = [], this.sendBuffer = [], this.connected = !1, this.disconnected = !0
            }
            var e = a("socket.io-parser"),
                f = a("component-emitter"),
                g = a("to-array"),
                h = a("./on"),
                i = a("component-bind"),
                j = a("debug")("socket.io-client:socket"),
                k = a("has-binary");
            b.exports = c = d;
            var l = {
                    connect: 1,
                    connect_error: 1,
                    connect_timeout: 1,
                    disconnect: 1,
                    error: 1,
                    reconnect: 1,
                    reconnect_attempt: 1,
                    reconnect_failed: 1,
                    reconnect_error: 1,
                    reconnecting: 1
                },
                m = f.prototype.emit;
            f(d.prototype), d.prototype.subEvents = function() {
                if (!this.subs) {
                    var a = this.io;
                    this.subs = [h(a, "open", i(this, "onopen")), h(a, "packet", i(this, "onpacket")), h(a, "close", i(this, "onclose"))]
                }
            }, d.prototype.open = d.prototype.connect = function() {
                return this.connected ? this : (this.subEvents(), this.io.open(), "open" == this.io.readyState && this.onopen(), this)
            }, d.prototype.send = function() {
                var a = g(arguments);
                return a.unshift("message"), this.emit.apply(this, a), this
            }, d.prototype.emit = function(a) {
                if (l.hasOwnProperty(a)) return m.apply(this, arguments), this;
                var b = g(arguments),
                    c = e.EVENT;
                k(b) && (c = e.BINARY_EVENT);
                var d = {
                    type: c,
                    data: b
                };
                return "function" == typeof b[b.length - 1] && (j("emitting packet with ack id %d", this.ids), this.acks[this.ids] = b.pop(), d.id = this.ids++), this.connected ? this.packet(d) : this.sendBuffer.push(d), this
            }, d.prototype.packet = function(a) {
                a.nsp = this.nsp, this.io.packet(a)
            }, d.prototype.onopen = function() {
                j("transport is open - connecting"), "/" != this.nsp && this.packet({
                    type: e.CONNECT
                })
            }, d.prototype.onclose = function(a) {
                j("close (%s)", a), this.connected = !1, this.disconnected = !0, this.emit("disconnect", a)
            }, d.prototype.onpacket = function(a) {
                if (a.nsp == this.nsp) switch (a.type) {
                    case e.CONNECT:
                        this.onconnect();
                        break;
                    case e.EVENT:
                        this.onevent(a);
                        break;
                    case e.BINARY_EVENT:
                        this.onevent(a);
                        break;
                    case e.ACK:
                        this.onack(a);
                        break;
                    case e.BINARY_ACK:
                        this.onack(a);
                        break;
                    case e.DISCONNECT:
                        this.ondisconnect();
                        break;
                    case e.ERROR:
                        this.emit("error", a.data)
                }
            }, d.prototype.onevent = function(a) {
                var b = a.data || [];
                j("emitting event %j", b), null != a.id && (j("attaching ack callback to event"), b.push(this.ack(a.id))), this.connected ? m.apply(this, b) : this.receiveBuffer.push(b)
            }, d.prototype.ack = function(a) {
                var b = this,
                    c = !1;
                return function() {
                    if (!c) {
                        c = !0;
                        var d = g(arguments);
                        j("sending ack %j", d);
                        var f = k(d) ? e.BINARY_ACK : e.ACK;
                        b.packet({
                            type: f,
                            id: a,
                            data: d
                        })
                    }
                }
            }, d.prototype.onack = function(a) {
                j("calling ack %s with %j", a.id, a.data);
                var b = this.acks[a.id];
                b.apply(this, a.data), delete this.acks[a.id]
            }, d.prototype.onconnect = function() {
                this.connected = !0, this.disconnected = !1, this.emit("connect"), this.emitBuffered()
            }, d.prototype.emitBuffered = function() {
                var a;
                for (a = 0; a < this.receiveBuffer.length; a++) m.apply(this, this.receiveBuffer[a]);
                for (this.receiveBuffer = [], a = 0; a < this.sendBuffer.length; a++) this.packet(this.sendBuffer[a]);
                this.sendBuffer = []
            }, d.prototype.ondisconnect = function() {
                j("server disconnect (%s)", this.nsp), this.destroy(), this.onclose("io server disconnect")
            }, d.prototype.destroy = function() {
                if (this.subs) {
                    for (var a = 0; a < this.subs.length; a++) this.subs[a].destroy();
                    this.subs = null
                }
                this.io.destroy(this)
            }, d.prototype.close = d.prototype.disconnect = function() {
                return this.connected && (j("performing disconnect (%s)", this.nsp), this.packet({
                    type: e.DISCONNECT
                })), this.destroy(), this.connected && this.onclose("io client disconnect"), this
            }
        }, {
            "./on": 4,
            "component-bind": 7,
            "component-emitter": 8,
            debug: 9,
            "has-binary": 35,
            "socket.io-parser": 43,
            "to-array": 47
        }],
        6: [function(a, b) {
            (function(c) {
                function d(a, b) {
                    var d = a,
                        b = b || c.location;
                    return null == a && (a = b.protocol + "//" + b.hostname), "string" == typeof a && ("/" == a.charAt(0) && (a = "/" == a.charAt(1) ? b.protocol + a : b.hostname + a), /^(https?|wss?):\/\//.test(a) || (f("protocol-less url %s", a), a = "undefined" != typeof b ? b.protocol + "//" + a : "https://" + a), f("parse %s", a), d = e(a)), d.port || (/^(http|ws)$/.test(d.protocol) ? d.port = "80" : /^(http|ws)s$/.test(d.protocol) && (d.port = "443")), d.path = d.path || "/", d.id = d.protocol + "://" + d.host + ":" + d.port, d.href = d.protocol + "://" + d.host + (b && b.port == d.port ? "" : ":" + d.port), d
                }
                var e = a("parseuri"),
                    f = a("debug")("socket.io-client:url");
                b.exports = d
            }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {
            debug: 9,
            parseuri: 41
        }],
        7: [function(a, b) {
            var c = [].slice;
            b.exports = function(a, b) {
                if ("string" == typeof b && (b = a[b]), "function" != typeof b) throw new Error("bind() requires a function");
                var d = c.call(arguments, 2);
                return function() {
                    return b.apply(a, d.concat(c.call(arguments)))
                }
            }
        }, {}],
        8: [function(a, b) {
            function c(a) {
                return a ? d(a) : void 0
            }

            function d(a) {
                for (var b in c.prototype) a[b] = c.prototype[b];
                return a
            }
            b.exports = c, c.prototype.on = c.prototype.addEventListener = function(a, b) {
                return this._callbacks = this._callbacks || {}, (this._callbacks[a] = this._callbacks[a] || []).push(b), this
            }, c.prototype.once = function(a, b) {
                function c() {
                    d.off(a, c), b.apply(this, arguments)
                }
                var d = this;
                return this._callbacks = this._callbacks || {}, c.fn = b, this.on(a, c), this
            }, c.prototype.off = c.prototype.removeListener = c.prototype.removeAllListeners = c.prototype.removeEventListener = function(a, b) {
                if (this._callbacks = this._callbacks || {}, 0 == arguments.length) return this._callbacks = {}, this;
                var c = this._callbacks[a];
                if (!c) return this;
                if (1 == arguments.length) return delete this._callbacks[a], this;
                for (var d, e = 0; e < c.length; e++)
                    if (d = c[e], d === b || d.fn === b) {
                        c.splice(e, 1);
                        break
                    }
                return this
            }, c.prototype.emit = function(a) {
                this._callbacks = this._callbacks || {};
                var b = [].slice.call(arguments, 1),
                    c = this._callbacks[a];
                if (c) {
                    c = c.slice(0);
                    for (var d = 0, e = c.length; e > d; ++d) c[d].apply(this, b)
                }
                return this
            }, c.prototype.listeners = function(a) {
                return this._callbacks = this._callbacks || {}, this._callbacks[a] || []
            }, c.prototype.hasListeners = function(a) {
                return !!this.listeners(a).length
            }
        }, {}],
        9: [function(a, b) {
            function c(a) {
                return c.enabled(a) ? function(b) {
                    b = d(b);
                    var e = new Date,
                        f = e - (c[a] || e);
                    c[a] = e, b = a + " " + b + " +" + c.humanize(f), window.console && console.log && Function.prototype.apply.call(console.log, console, arguments)
                } : function() {}
            }

            function d(a) {
                return a instanceof Error ? a.stack || a.message : a
            }
            b.exports = c, c.names = [], c.skips = [], c.enable = function(a) {
                try {
                    localStorage.debug = a
                } catch (b) {}
                for (var d = (a || "").split(/[\s,]+/), e = d.length, f = 0; e > f; f++) a = d[f].replace("*", ".*?"), "-" === a[0] ? c.skips.push(new RegExp("^" + a.substr(1) + "$")) : c.names.push(new RegExp("^" + a + "$"))
            }, c.disable = function() {
                c.enable("")
            }, c.humanize = function(a) {
                var b = 1e3,
                    c = 6e4,
                    d = 60 * c;
                return a >= d ? (a / d).toFixed(1) + "h" : a >= c ? (a / c).toFixed(1) + "m" : a >= b ? (a / b | 0) + "s" : a + "ms"
            }, c.enabled = function(a) {
                for (var b = 0, d = c.skips.length; d > b; b++)
                    if (c.skips[b].test(a)) return !1;
                for (var b = 0, d = c.names.length; d > b; b++)
                    if (c.names[b].test(a)) return !0;
                return !1
            };
            try {
                window.localStorage && c.enable(localStorage.debug)
            } catch (e) {}
        }, {}],
        10: [function(a, b) {
            b.exports = a("./lib/")
        }, {
            "./lib/": 11
        }],
        11: [function(a, b) {
            b.exports = a("./socket"), b.exports.parser = a("engine.io-parser")
        }, {
            "./socket": 12,
            "engine.io-parser": 24
        }],
        12: [function(a, b) {
            (function(c) {
                function d(a, b) {
                    if (!(this instanceof d)) return new d(a, b);
                    if (b = b || {}, a && "object" == typeof a && (b = a, a = null), a && (a = k(a), b.host = a.host, b.secure = "https" == a.protocol || "wss" == a.protocol, b.port = a.port, a.query && (b.query = a.query)), this.secure = null != b.secure ? b.secure : c.location && "https:" == location.protocol, b.host) {
                        var e = b.host.split(":");
                        b.hostname = e.shift(), e.length && (b.port = e.pop())
                    }
                    this.agent = b.agent || !1, this.hostname = b.hostname || (c.location ? location.hostname : "localhost"), this.port = b.port || (c.location && location.port ? location.port : this.secure ? 443 : 80), this.query = b.query || {}, "string" == typeof this.query && (this.query = m.decode(this.query)), this.upgrade = !1 !== b.upgrade, this.path = (b.path || "/engine.io").replace(/\/$/, "") + "/", this.forceJSONP = !!b.forceJSONP, this.jsonp = !1 !== b.jsonp, this.forceBase64 = !!b.forceBase64, this.enablesXDR = !!b.enablesXDR, this.timestampParam = b.timestampParam || "t", this.timestampRequests = b.timestampRequests, this.transports = b.transports || ["polling", "websocket"], this.readyState = "", this.writeBuffer = [], this.callbackBuffer = [], this.policyPort = b.policyPort || 843, this.rememberUpgrade = b.rememberUpgrade || !1, this.open(), this.binaryType = null, this.onlyBinaryUpgrades = b.onlyBinaryUpgrades
                }

                function e(a) {
                    var b = {};
                    for (var c in a) a.hasOwnProperty(c) && (b[c] = a[c]);
                    return b
                }
                var f = a("./transports"),
                    g = a("component-emitter"),
                    h = a("debug")("engine.io-client:socket"),
                    i = a("indexof"),
                    j = a("engine.io-parser"),
                    k = a("parseuri"),
                    l = a("parsejson"),
                    m = a("parseqs");
                b.exports = d, d.priorWebsocketSuccess = !1, g(d.prototype), d.protocol = j.protocol, d.Socket = d, d.Transport = a("./transport"), d.transports = a("./transports"), d.parser = a("engine.io-parser"), d.prototype.createTransport = function(a) {
                    h('creating transport "%s"', a);
                    var b = e(this.query);
                    b.EIO = j.protocol, b.transport = a, this.id && (b.sid = this.id);
                    var c = new f[a]({
                        agent: this.agent,
                        hostname: this.hostname,
                        port: this.port,
                        secure: this.secure,
                        path: this.path,
                        query: b,
                        forceJSONP: this.forceJSONP,
                        jsonp: this.jsonp,
                        forceBase64: this.forceBase64,
                        enablesXDR: this.enablesXDR,
                        timestampRequests: this.timestampRequests,
                        timestampParam: this.timestampParam,
                        policyPort: this.policyPort,
                        socket: this
                    });
                    return c
                }, d.prototype.open = function() {
                    var a;
                    if (this.rememberUpgrade && d.priorWebsocketSuccess && -1 != this.transports.indexOf("websocket")) a = "websocket";
                    else {
                        if (0 == this.transports.length) {
                            var b = this;
                            return void setTimeout(function() {
                                b.emit("error", "No transports available")
                            }, 0)
                        }
                        a = this.transports[0]
                    }
                    this.readyState = "opening";
                    var a;
                    try {
                        a = this.createTransport(a)
                    } catch (c) {
                        return this.transports.shift(), void this.open()
                    }
                    a.open(), this.setTransport(a)
                }, d.prototype.setTransport = function(a) {
                    h("setting transport %s", a.name);
                    var b = this;
                    this.transport && (h("clearing existing transport %s", this.transport.name), this.transport.removeAllListeners()), this.transport = a, a.on("drain", function() {
                        b.onDrain()
                    }).on("packet", function(a) {
                        b.onPacket(a)
                    }).on("error", function(a) {
                        b.onError(a)
                    }).on("close", function() {
                        b.onClose("transport close")
                    })
                }, d.prototype.probe = function(a) {
                    function b() {
                        if (m.onlyBinaryUpgrades) {
                            var b = !this.supportsBinary && m.transport.supportsBinary;
                            l = l || b
                        }
                        l || (h('probe transport "%s" opened', a), k.send([{
                            type: "ping",
                            data: "probe"
                        }]), k.once("packet", function(b) {
                            if (!l)
                                if ("pong" == b.type && "probe" == b.data) {
                                    if (h('probe transport "%s" pong', a), m.upgrading = !0, m.emit("upgrading", k), !k) return;
                                    d.priorWebsocketSuccess = "websocket" == k.name, h('pausing current transport "%s"', m.transport.name), m.transport.pause(function() {
                                        l || "closed" != m.readyState && (h("changing transport and sending upgrade packet"), j(), m.setTransport(k), k.send([{
                                            type: "upgrade"
                                        }]), m.emit("upgrade", k), k = null, m.upgrading = !1, m.flush())
                                    })
                                } else {
                                    h('probe transport "%s" failed', a);
                                    var c = new Error("probe error");
                                    c.transport = k.name, m.emit("upgradeError", c)
                                }
                        }))
                    }

                    function c() {
                        l || (l = !0, j(), k.close(), k = null)
                    }

                    function e(b) {
                        var d = new Error("probe error: " + b);
                        d.transport = k.name, c(), h('probe transport "%s" failed because of error: %s', a, b), m.emit("upgradeError", d)
                    }

                    function f() {
                        e("transport closed")
                    }

                    function g() {
                        e("socket closed")
                    }

                    function i(a) {
                        k && a.name != k.name && (h('"%s" works - aborting "%s"', a.name, k.name), c())
                    }

                    function j() {
                        k.removeListener("open", b), k.removeListener("error", e), k.removeListener("close", f), m.removeListener("close", g), m.removeListener("upgrading", i)
                    }
                    h('probing transport "%s"', a);
                    var k = this.createTransport(a, {
                            probe: 1
                        }),
                        l = !1,
                        m = this;
                    d.priorWebsocketSuccess = !1, k.once("open", b), k.once("error", e), k.once("close", f), this.once("close", g), this.once("upgrading", i), k.open()
                }, d.prototype.onOpen = function() {
                    if (h("socket open"), this.readyState = "open", d.priorWebsocketSuccess = "websocket" == this.transport.name, this.emit("open"), this.flush(), "open" == this.readyState && this.upgrade && this.transport.pause) {
                        h("starting upgrade probes");
                        for (var a = 0, b = this.upgrades.length; b > a; a++) this.probe(this.upgrades[a])
                    }
                }, d.prototype.onPacket = function(a) {
                    if ("opening" == this.readyState || "open" == this.readyState) switch (h('socket receive: type "%s", data "%s"', a.type, a.data), this.emit("packet", a), this.emit("heartbeat"), a.type) {
                        case "open":
                            this.onHandshake(l(a.data));
                            break;
                        case "pong":
                            this.setPing();
                            break;
                        case "error":
                            var b = new Error("server error");
                            b.code = a.data, this.emit("error", b);
                            break;
                        case "message":
                            this.emit("data", a.data), this.emit("message", a.data)
                    } else h('packet received with socket readyState "%s"', this.readyState)
                }, d.prototype.onHandshake = function(a) {
                    this.emit("handshake", a), this.id = a.sid, this.transport.query.sid = a.sid, this.upgrades = this.filterUpgrades(a.upgrades), this.pingInterval = a.pingInterval, this.pingTimeout = a.pingTimeout, this.onOpen(), "closed" != this.readyState && (this.setPing(), this.removeListener("heartbeat", this.onHeartbeat), this.on("heartbeat", this.onHeartbeat))
                }, d.prototype.onHeartbeat = function(a) {
                    clearTimeout(this.pingTimeoutTimer);
                    var b = this;
                    b.pingTimeoutTimer = setTimeout(function() {
                        "closed" != b.readyState && b.onClose("ping timeout")
                    }, a || b.pingInterval + b.pingTimeout)
                }, d.prototype.setPing = function() {
                    var a = this;
                    clearTimeout(a.pingIntervalTimer), a.pingIntervalTimer = setTimeout(function() {
                        h("writing ping packet - expecting pong within %sms", a.pingTimeout), a.ping(), a.onHeartbeat(a.pingTimeout)
                    }, a.pingInterval)
                }, d.prototype.ping = function() {
                    this.sendPacket("ping")
                }, d.prototype.onDrain = function() {
                    for (var a = 0; a < this.prevBufferLen; a++) this.callbackBuffer[a] && this.callbackBuffer[a]();
                    this.writeBuffer.splice(0, this.prevBufferLen), this.callbackBuffer.splice(0, this.prevBufferLen), this.prevBufferLen = 0, 0 == this.writeBuffer.length ? this.emit("drain") : this.flush()
                }, d.prototype.flush = function() {
                    "closed" != this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length && (h("flushing %d packets in socket", this.writeBuffer.length), this.transport.send(this.writeBuffer), this.prevBufferLen = this.writeBuffer.length, this.emit("flush"))
                }, d.prototype.write = d.prototype.send = function(a, b) {
                    return this.sendPacket("message", a, b), this
                }, d.prototype.sendPacket = function(a, b, c) {
                    if ("closing" != this.readyState && "closed" != this.readyState) {
                        var d = {
                            type: a,
                            data: b
                        };
                        this.emit("packetCreate", d), this.writeBuffer.push(d), this.callbackBuffer.push(c), this.flush()
                    }
                }, d.prototype.close = function() {
                    function a() {
                        d.onClose("forced close"), h("socket closing - telling transport to close"), d.transport.close()
                    }

                    function b() {
                        d.removeListener("upgrade", b), d.removeListener("upgradeError", b), a()
                    }

                    function c() {
                        d.once("upgrade", b), d.once("upgradeError", b)
                    }
                    if ("opening" == this.readyState || "open" == this.readyState) {
                        this.readyState = "closing";
                        var d = this;
                        this.writeBuffer.length ? this.once("drain", function() {
                            this.upgrading ? c() : a()
                        }) : this.upgrading ? c() : a()
                    }
                    return this
                }, d.prototype.onError = function(a) {
                    h("socket error %j", a), d.priorWebsocketSuccess = !1, this.emit("error", a), this.onClose("transport error", a)
                }, d.prototype.onClose = function(a, b) {
                    if ("opening" == this.readyState || "open" == this.readyState || "closing" == this.readyState) {
                        h('socket close with reason: "%s"', a);
                        var c = this;
                        clearTimeout(this.pingIntervalTimer), clearTimeout(this.pingTimeoutTimer), setTimeout(function() {
                            c.writeBuffer = [], c.callbackBuffer = [], c.prevBufferLen = 0
                        }, 0), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), this.readyState = "closed", this.id = null, this.emit("close", a, b)
                    }
                }, d.prototype.filterUpgrades = function(a) {
                    for (var b = [], c = 0, d = a.length; d > c; c++) ~i(this.transports, a[c]) && b.push(a[c]);
                    return b
                }
            }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {
            "./transport": 13,
            "./transports": 14,
            "component-emitter": 8,
            debug: 21,
            "engine.io-parser": 24,
            indexof: 39,
            parsejson: 31,
            parseqs: 32,
            parseuri: 33
        }],
        13: [function(a, b) {
            function c(a) {
                this.path = a.path, this.hostname = a.hostname, this.port = a.port, this.secure = a.secure, this.query = a.query, this.timestampParam = a.timestampParam, this.timestampRequests = a.timestampRequests, this.readyState = "", this.agent = a.agent || !1, this.socket = a.socket, this.enablesXDR = a.enablesXDR
            }
            var d = a("engine.io-parser"),
                e = a("component-emitter");
            b.exports = c, e(c.prototype), c.timestamps = 0, c.prototype.onError = function(a, b) {
                var c = new Error(a);
                return c.type = "TransportError", c.description = b, this.emit("error", c), this
            }, c.prototype.open = function() {
                return ("closed" == this.readyState || "" == this.readyState) && (this.readyState = "opening", this.doOpen()), this
            }, c.prototype.close = function() {
                return ("opening" == this.readyState || "open" == this.readyState) && (this.doClose(), this.onClose()), this
            }, c.prototype.send = function(a) {
                if ("open" != this.readyState) throw new Error("Transport not open");
                this.write(a)
            }, c.prototype.onOpen = function() {
                this.readyState = "open", this.writable = !0, this.emit("open")
            }, c.prototype.onData = function(a) {
                var b = d.decodePacket(a, this.socket.binaryType);
                this.onPacket(b)
            }, c.prototype.onPacket = function(a) {
                this.emit("packet", a)
            }, c.prototype.onClose = function() {
                this.readyState = "closed", this.emit("close")
            }
        }, {
            "component-emitter": 8,
            "engine.io-parser": 24
        }],
        14: [function(a, b, c) {
            (function(b) {
                function d(a) {
                    var c, d = !1,
                        h = !1,
                        i = !1 !== a.jsonp;
                    if (b.location) {
                        var j = "https:" == location.protocol,
                            k = location.port;
                        k || (k = j ? 443 : 80), d = a.hostname != location.hostname || k != a.port, h = a.secure != j
                    }
                    if (a.xdomain = d, a.xscheme = h, c = new e(a), "open" in c && !a.forceJSONP) return new f(a);
                    if (!i) throw new Error("JSONP disabled");
                    return new g(a)
                }
                var e = a("xmlhttprequest"),
                    f = a("./polling-xhr"),
                    g = a("./polling-jsonp"),
                    h = a("./websocket");
                c.polling = d, c.websocket = h
            }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {
            "./polling-jsonp": 15,
            "./polling-xhr": 16,
            "./websocket": 18,
            xmlhttprequest: 19
        }],
        15: [function(a, b) {
            (function(c) {
                function d() {}

                function e(a) {
                    f.call(this, a), this.query = this.query || {}, h || (c.___eio || (c.___eio = []), h = c.___eio), this.index = h.length;
                    var b = this;
                    h.push(function(a) {
                        b.onData(a)
                    }), this.query.j = this.index, c.document && c.addEventListener && c.addEventListener("beforeunload", function() {
                        b.script && (b.script.onerror = d)
                    }, !1)
                }
                var f = a("./polling"),
                    g = a("component-inherit");
                b.exports = e;
                var h, i = /\n/g,
                    j = /\\n/g;
                g(e, f), e.prototype.supportsBinary = !1, e.prototype.doClose = function() {
                    this.script && (this.script.parentNode.removeChild(this.script), this.script = null), this.form && (this.form.parentNode.removeChild(this.form), this.form = null, this.iframe = null), f.prototype.doClose.call(this)
                }, e.prototype.doPoll = function() {
                    var a = this,
                        b = document.createElement("script");
                    this.script && (this.script.parentNode.removeChild(this.script), this.script = null), b.async = !0, b.src = this.uri(), b.onerror = function(b) {
                        a.onError("jsonp poll error", b)
                    };
                    var c = document.getElementsByTagName("script")[0];
                    c.parentNode.insertBefore(b, c), this.script = b;
                    var d = "undefined" != typeof navigator && /gecko/i.test(navigator.userAgent);
                    d && setTimeout(function() {
                        var a = document.createElement("iframe");
                        document.body.appendChild(a), document.body.removeChild(a)
                    }, 100)
                }, e.prototype.doWrite = function(a, b) {
                    function c() {
                        d(), b()
                    }

                    function d() {
                        if (e.iframe) try {
                            e.form.removeChild(e.iframe)
                        } catch (a) {
                            e.onError("jsonp polling iframe removal error", a)
                        }
                        try {
                            var b = '<iframe src="javascript:0" name="' + e.iframeId + '">';
                            f = document.createElement(b)
                        } catch (a) {
                            f = document.createElement("iframe"), f.name = e.iframeId, f.src = "javascript:0"
                        }
                        f.id = e.iframeId, e.form.appendChild(f), e.iframe = f
                    }
                    var e = this;
                    if (!this.form) {
                        var f, g = document.createElement("form"),
                            h = document.createElement("textarea"),
                            k = this.iframeId = "eio_iframe_" + this.index;
                        g.className = "socketio", g.style.position = "absolute", g.style.top = "-1000px", g.style.left = "-1000px", g.target = k, g.method = "POST", g.setAttribute("accept-charset", "utf-8"), h.name = "d", g.appendChild(h), document.body.appendChild(g), this.form = g, this.area = h
                    }
                    this.form.action = this.uri(), d(), a = a.replace(j, "\\\n"), this.area.value = a.replace(i, "\\n");
                    try {
                        this.form.submit()
                    } catch (l) {}
                    this.iframe.attachEvent ? this.iframe.onreadystatechange = function() {
                        "complete" == e.iframe.readyState && c()
                    } : this.iframe.onload = c
                }
            }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {
            "./polling": 17,
            "component-inherit": 20
        }],
        16: [function(a, b) {
            (function(c) {
                function d() {}

                function e(a) {
                    if (i.call(this, a), c.location) {
                        var b = "https:" == location.protocol,
                            d = location.port;
                        d || (d = b ? 443 : 80), this.xd = a.hostname != c.location.hostname || d != a.port, this.xs = a.secure != b
                    }
                }

                function f(a) {
                    this.method = a.method || "GET", this.uri = a.uri, this.xd = !!a.xd, this.xs = !!a.xs, this.async = !1 !== a.async, this.data = void 0 != a.data ? a.data : null, this.agent = a.agent, this.isBinary = a.isBinary, this.supportsBinary = a.supportsBinary, this.enablesXDR = a.enablesXDR, this.create()
                }

                function g() {
                    for (var a in f.requests) f.requests.hasOwnProperty(a) && f.requests[a].abort()
                }
                var h = a("xmlhttprequest"),
                    i = a("./polling"),
                    j = a("component-emitter"),
                    k = a("component-inherit"),
                    l = a("debug")("engine.io-client:polling-xhr");
                b.exports = e, b.exports.Request = f, k(e, i), e.prototype.supportsBinary = !0, e.prototype.request = function(a) {
                    return a = a || {}, a.uri = this.uri(), a.xd = this.xd, a.xs = this.xs, a.agent = this.agent || !1, a.supportsBinary = this.supportsBinary, a.enablesXDR = this.enablesXDR, new f(a)
                }, e.prototype.doWrite = function(a, b) {
                    var c = "string" != typeof a && void 0 !== a,
                        d = this.request({
                            method: "POST",
                            data: a,
                            isBinary: c
                        }),
                        e = this;
                    d.on("success", b), d.on("error", function(a) {
                        e.onError("xhr post error", a)
                    }), this.sendXhr = d
                }, e.prototype.doPoll = function() {
                    l("xhr poll");
                    var a = this.request(),
                        b = this;
                    a.on("data", function(a) {
                        b.onData(a)
                    }), a.on("error", function(a) {
                        b.onError("xhr poll error", a)
                    }), this.pollXhr = a
                }, j(f.prototype), f.prototype.create = function() {
                    var a = this.xhr = new h({
                            agent: this.agent,
                            xdomain: this.xd,
                            xscheme: this.xs,
                            enablesXDR: this.enablesXDR
                        }),
                        b = this;
                    try {
                        if (l("xhr open %s: %s", this.method, this.uri), a.open(this.method, this.uri, this.async), this.supportsBinary && (a.responseType = "arraybuffer"), "POST" == this.method) try {
                            this.isBinary ? a.setRequestHeader("Content-type", "application/octet-stream") : a.setRequestHeader("Content-type", "text/plain;charset=UTF-8")
                        } catch (d) {}
                        "withCredentials" in a && (a.withCredentials = !0), this.hasXDR() ? (a.onload = function() {
                            b.onLoad()
                        }, a.onerror = function() {
                            b.onError(a.responseText)
                        }) : a.onreadystatechange = function() {
                            4 == a.readyState && (200 == a.status || 1223 == a.status ? b.onLoad() : setTimeout(function() {
                                b.onError(a.status)
                            }, 0))
                        }, l("xhr data %s", this.data), a.send(this.data)
                    } catch (d) {
                        return void setTimeout(function() {
                            b.onError(d)
                        }, 0)
                    }
                    c.document && (this.index = f.requestsCount++, f.requests[this.index] = this)
                }, f.prototype.onSuccess = function() {
                    this.emit("success"), this.cleanup()
                }, f.prototype.onData = function(a) {
                    this.emit("data", a), this.onSuccess()
                }, f.prototype.onError = function(a) {
                    this.emit("error", a), this.cleanup()
                }, f.prototype.cleanup = function() {
                    if ("undefined" != typeof this.xhr && null !== this.xhr) {
                        this.hasXDR() ? this.xhr.onload = this.xhr.onerror = d : this.xhr.onreadystatechange = d;
                        try {
                            this.xhr.abort()
                        } catch (a) {}
                        c.document && delete f.requests[this.index], this.xhr = null
                    }
                }, f.prototype.onLoad = function() {
                    var a;
                    try {
                        var b;
                        try {
                            b = this.xhr.getResponseHeader("Content-Type").split(";")[0]
                        } catch (c) {}
                        a = "application/octet-stream" === b ? this.xhr.response : this.supportsBinary ? "ok" : this.xhr.responseText
                    } catch (c) {
                        this.onError(c)
                    }
                    null != a && this.onData(a)
                }, f.prototype.hasXDR = function() {
                    return "undefined" != typeof c.XDomainRequest && !this.xs && this.enablesXDR
                }, f.prototype.abort = function() {
                    this.cleanup()
                }, c.document && (f.requestsCount = 0, f.requests = {}, c.attachEvent ? c.attachEvent("onunload", g) : c.addEventListener && c.addEventListener("beforeunload", g, !1))
            }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {
            "./polling": 17,
            "component-emitter": 8,
            "component-inherit": 20,
            debug: 21,
            xmlhttprequest: 19
        }],
        17: [function(a, b) {
            function c(a) {
                var b = a && a.forceBase64;
                (!i || b) && (this.supportsBinary = !1), d.call(this, a)
            }
            var d = a("../transport"),
                e = a("parseqs"),
                f = a("engine.io-parser"),
                g = a("component-inherit"),
                h = a("debug")("engine.io-client:polling");
            b.exports = c;
            var i = function() {
                var b = a("xmlhttprequest"),
                    c = new b({
                        xdomain: !1
                    });
                return null != c.responseType
            }();
            g(c, d), c.prototype.name = "polling", c.prototype.doOpen = function() {
                this.poll()
            }, c.prototype.pause = function(a) {
                function b() {
                    h("paused"), c.readyState = "paused", a()
                }
                var c = this;
                if (this.readyState = "pausing", this.polling || !this.writable) {
                    var d = 0;
                    this.polling && (h("we are currently polling - waiting to pause"), d++, this.once("pollComplete", function() {
                        h("pre-pause polling complete"), --d || b()
                    })), this.writable || (h("we are currently writing - waiting to pause"), d++, this.once("drain", function() {
                        h("pre-pause writing complete"), --d || b()
                    }))
                } else b()
            }, c.prototype.poll = function() {
                h("polling"), this.polling = !0, this.doPoll(), this.emit("poll")
            }, c.prototype.onData = function(a) {
                var b = this;
                h("polling got data %s", a);
                var c = function(a) {
                    return "opening" == b.readyState && b.onOpen(), "close" == a.type ? (b.onClose(), !1) : void b.onPacket(a)
                };
                f.decodePayload(a, this.socket.binaryType, c), "closed" != this.readyState && (this.polling = !1, this.emit("pollComplete"), "open" == this.readyState ? this.poll() : h('ignoring poll - transport state "%s"', this.readyState))
            }, c.prototype.doClose = function() {
                function a() {
                    h("writing close packet"), b.write([{
                        type: "close"
                    }])
                }
                var b = this;
                "open" == this.readyState ? (h("transport open - closing"), a()) : (h("transport not open - deferring close"), this.once("open", a))
            }, c.prototype.write = function(a) {
                var b = this;
                this.writable = !1;
                var c = function() {
                        b.writable = !0, b.emit("drain")
                    },
                    b = this;
                f.encodePayload(a, this.supportsBinary, function(a) {
                    b.doWrite(a, c)
                })
            }, c.prototype.uri = function() {
                var a = this.query || {},
                    b = this.secure ? "https" : "http",
                    c = "";
                return !1 !== this.timestampRequests && (a[this.timestampParam] = +new Date + "-" + d.timestamps++), this.supportsBinary || a.sid || (a.b64 = 1), a = e.encode(a), this.port && ("https" == b && 443 != this.port || "http" == b && 80 != this.port) && (c = ":" + this.port), a.length && (a = "?" + a), b + "://" + this.hostname + c + this.path + a
            }
        }, {
            "../transport": 13,
            "component-inherit": 20,
            debug: 21,
            "engine.io-parser": 24,
            parseqs: 32,
            xmlhttprequest: 19
        }],
        18: [function(a, b) {
            function c(a) {
                var b = a && a.forceBase64;
                b && (this.supportsBinary = !1), d.call(this, a)
            }
            var d = a("../transport"),
                e = a("engine.io-parser"),
                f = a("parseqs"),
                g = a("component-inherit"),
                h = a("debug")("engine.io-client:websocket"),
                i = a("ws");
            b.exports = c, g(c, d), c.prototype.name = "websocket", c.prototype.supportsBinary = !0, c.prototype.doOpen = function() {
                if (this.check()) {
                    var a = this.uri(),
                        b = void 0,
                        c = {
                            agent: this.agent
                        };
                    this.ws = new i(a, b, c), void 0 === this.ws.binaryType && (this.supportsBinary = !1), this.ws.binaryType = "arraybuffer", this.addEventListeners()
                }
            }, c.prototype.addEventListeners = function() {
                var a = this;
                this.ws.onopen = function() {
                    a.onOpen()
                }, this.ws.onclose = function() {
                    a.onClose()
                }, this.ws.onmessage = function(b) {
                    a.onData(b.data)
                }, this.ws.onerror = function(b) {
                    a.onError("websocket error", b)
                }
            }, "undefined" != typeof navigator && /iPad|iPhone|iPod/i.test(navigator.userAgent) && (c.prototype.onData = function(a) {
                var b = this;
                setTimeout(function() {
                    d.prototype.onData.call(b, a)
                }, 0)
            }), c.prototype.write = function(a) {
                function b() {
                    c.writable = !0, c.emit("drain")
                }
                var c = this;
                this.writable = !1;
                for (var d = 0, f = a.length; f > d; d++) e.encodePacket(a[d], this.supportsBinary, function(a) {
                    try {
                        c.ws.send(a)
                    } catch (b) {
                        h("websocket closed before onclose event")
                    }
                });
                setTimeout(b, 0)
            }, c.prototype.onClose = function() {
                d.prototype.onClose.call(this)
            }, c.prototype.doClose = function() {
                "undefined" != typeof this.ws && this.ws.close()
            }, c.prototype.uri = function() {
                var a = this.query || {},
                    b = this.secure ? "wss" : "ws",
                    c = "";
                return this.port && ("wss" == b && 443 != this.port || "ws" == b && 80 != this.port) && (c = ":" + this.port), this.timestampRequests && (a[this.timestampParam] = +new Date), this.supportsBinary || (a.b64 = 1), a = f.encode(a), a.length && (a = "?" + a), b + "://" + this.hostname + c + this.path + a
            }, c.prototype.check = function() {
                return !(!i || "__initialize" in i && this.name === c.prototype.name)
            }
        }, {
            "../transport": 13,
            "component-inherit": 20,
            debug: 21,
            "engine.io-parser": 24,
            parseqs: 32,
            ws: 34
        }],
        19: [function(a, b) {
            var c = a("has-cors");
            b.exports = function(a) {
                var b = a.xdomain,
                    d = a.xscheme,
                    e = a.enablesXDR;
                try {
                    if ("undefined" != typeof XMLHttpRequest && (!b || c)) return new XMLHttpRequest
                } catch (f) {}
                try {
                    if ("undefined" != typeof XDomainRequest && !d && e) return new XDomainRequest
                } catch (f) {}
                if (!b) try {
                    return new ActiveXObject("Microsoft.XMLHTTP")
                } catch (f) {}
            }
        }, {
            "has-cors": 37
        }],
        20: [function(a, b) {
            b.exports = function(a, b) {
                var c = function() {};
                c.prototype = b.prototype, a.prototype = new c, a.prototype.constructor = a
            }
        }, {}],
        21: [function(a, b, c) {
            function d() {
                return "WebkitAppearance" in document.documentElement.style || window.console && (console.firebug || console.exception && console.table) || navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31
            }

            function e() {
                var a = arguments,
                    b = this.useColors;
                if (a[0] = (b ? "%c" : "") + this.namespace + (b ? " %c" : " ") + a[0] + (b ? "%c " : " ") + "+" + c.humanize(this.diff), !b) return a;
                var d = "color: " + this.color;
                a = [a[0], d, "color: inherit"].concat(Array.prototype.slice.call(a, 1));
                var e = 0,
                    f = 0;
                return a[0].replace(/%[a-z%]/g, function(a) {
                    "%" !== a && (e++, "%c" === a && (f = e))
                }), a.splice(f, 0, d), a
            }

            function f() {
                return "object" == typeof console && "function" == typeof console.log && Function.prototype.apply.call(console.log, console, arguments)
            }

            function g(a) {
                try {
                    null == a ? localStorage.removeItem("debug") : localStorage.debug = a
                } catch (b) {}
            }

            function h() {
                var a;
                try {
                    a = localStorage.debug
                } catch (b) {}
                return a
            }
            c = b.exports = a("./debug"), c.log = f, c.formatArgs = e, c.save = g, c.load = h, c.useColors = d, c.colors = ["lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson"], c.formatters.j = function(a) {
                return JSON.stringify(a)
            }, c.enable(h())
        }, {
            "./debug": 22
        }],
        22: [function(a, b, c) {
            function d() {
                return c.colors[k++ % c.colors.length]
            }

            function e(a) {
                function b() {}

                function e() {
                    var a = e,
                        b = +new Date,
                        f = b - (j || b);
                    a.diff = f, a.prev = j, a.curr = b, j = b, null == a.useColors && (a.useColors = c.useColors()), null == a.color && a.useColors && (a.color = d());
                    var g = Array.prototype.slice.call(arguments);
                    g[0] = c.coerce(g[0]), "string" != typeof g[0] && (g = ["%o"].concat(g));
                    var h = 0;
                    g[0] = g[0].replace(/%([a-z%])/g, function(b, d) {
                        if ("%" === b) return b;
                        h++;
                        var e = c.formatters[d];
                        if ("function" == typeof e) {
                            var f = g[h];
                            b = e.call(a, f), g.splice(h, 1), h--
                        }
                        return b
                    }), "function" == typeof c.formatArgs && (g = c.formatArgs.apply(a, g));
                    var i = e.log || c.log || console.log.bind(console);
                    i.apply(a, g)
                }
                b.enabled = !1, e.enabled = !0;
                var f = c.enabled(a) ? e : b;
                return f.namespace = a, f
            }

            function f(a) {
                c.save(a);
                for (var b = (a || "").split(/[\s,]+/), d = b.length, e = 0; d > e; e++) b[e] && (a = b[e].replace(/\*/g, ".*?"), "-" === a[0] ? c.skips.push(new RegExp("^" + a.substr(1) + "$")) : c.names.push(new RegExp("^" + a + "$")))
            }

            function g() {
                c.enable("")
            }

            function h(a) {
                var b, d;
                for (b = 0, d = c.skips.length; d > b; b++)
                    if (c.skips[b].test(a)) return !1;
                for (b = 0, d = c.names.length; d > b; b++)
                    if (c.names[b].test(a)) return !0;
                return !1
            }

            function i(a) {
                return a instanceof Error ? a.stack || a.message : a
            }
            c = b.exports = e, c.coerce = i, c.disable = g, c.enable = f, c.enabled = h, c.humanize = a("ms"), c.names = [], c.skips = [], c.formatters = {};
            var j, k = 0
        }, {
            ms: 23
        }],
        23: [function(a, b) {
            function c(a) {
                var b = /^((?:\d+)?\.?\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(a);
                if (b) {
                    var c = parseFloat(b[1]),
                        d = (b[2] || "ms").toLowerCase();
                    switch (d) {
                        case "years":
                        case "year":
                        case "y":
                            return c * k;
                        case "days":
                        case "day":
                        case "d":
                            return c * j;
                        case "hours":
                        case "hour":
                        case "h":
                            return c * i;
                        case "minutes":
                        case "minute":
                        case "m":
                            return c * h;
                        case "seconds":
                        case "second":
                        case "s":
                            return c * g;
                        case "ms":
                            return c
                    }
                }
            }

            function d(a) {
                return a >= j ? Math.round(a / j) + "d" : a >= i ? Math.round(a / i) + "h" : a >= h ? Math.round(a / h) + "m" : a >= g ? Math.round(a / g) + "s" : a + "ms"
            }

            function e(a) {
                return f(a, j, "day") || f(a, i, "hour") || f(a, h, "minute") || f(a, g, "second") || a + " ms"
            }

            function f(a, b, c) {
                return b > a ? void 0 : 1.5 * b > a ? Math.floor(a / b) + " " + c : Math.ceil(a / b) + " " + c + "s"
            }
            var g = 1e3,
                h = 60 * g,
                i = 60 * h,
                j = 24 * i,
                k = 365.25 * j;
            b.exports = function(a, b) {
                return b = b || {}, "string" == typeof a ? c(a) : b.long ? e(a) : d(a)
            }
        }, {}],
        24: [function(a, b, c) {
            (function(b) {
                function d(a, b, d) {
                    if (!b) return c.encodeBase64Packet(a, d);
                    var e = a.data,
                        f = new Uint8Array(e),
                        g = new Uint8Array(1 + e.byteLength);
                    g[0] = n[a.type];
                    for (var h = 0; h < f.length; h++) g[h + 1] = f[h];
                    return d(g.buffer)
                }

                function e(a, b, d) {
                    if (!b) return c.encodeBase64Packet(a, d);
                    var e = new FileReader;
                    return e.onload = function() {
                        a.data = e.result, c.encodePacket(a, b, !0, d)
                    }, e.readAsArrayBuffer(a.data)
                }

                function f(a, b, d) {
                    if (!b) return c.encodeBase64Packet(a, d);
                    if (m) return e(a, b, d);
                    var f = new Uint8Array(1);
                    f[0] = n[a.type];
                    var g = new q([f.buffer, a.data]);
                    return d(g)
                }

                function g(a, b, c) {
                    for (var d = new Array(a.length), e = k(a.length, c), f = function(a, c, e) {
                            b(c, function(b, c) {
                                d[a] = c, e(b, d)
                            })
                        }, g = 0; g < a.length; g++) f(g, a[g], e)
                }
                var h = a("./keys"),
                    i = a("arraybuffer.slice"),
                    j = a("base64-arraybuffer"),
                    k = a("after"),
                    l = a("utf8"),
                    m = navigator.userAgent.match(/Android/i);
                c.protocol = 3;
                var n = c.packets = {
                        open: 0,
                        close: 1,
                        ping: 2,
                        pong: 3,
                        message: 4,
                        upgrade: 5,
                        noop: 6
                    },
                    o = h(n),
                    p = {
                        type: "error",
                        data: "parser error"
                    },
                    q = a("blob");
                c.encodePacket = function(a, c, e, g) {
                    "function" == typeof c && (g = c, c = !1), "function" == typeof e && (g = e, e = null);
                    var h = void 0 === a.data ? void 0 : a.data.buffer || a.data;
                    if (b.ArrayBuffer && h instanceof ArrayBuffer) return d(a, c, g);
                    if (q && h instanceof b.Blob) return f(a, c, g);
                    var i = n[a.type];
                    return void 0 !== a.data && (i += e ? l.encode(String(a.data)) : String(a.data)), g("" + i)
                }, c.encodeBase64Packet = function(a, d) {
                    var e = "b" + c.packets[a.type];
                    if (q && a.data instanceof q) {
                        var f = new FileReader;
                        return f.onload = function() {
                            var a = f.result.split(",")[1];
                            d(e + a)
                        }, f.readAsDataURL(a.data)
                    }
                    var g;
                    try {
                        g = String.fromCharCode.apply(null, new Uint8Array(a.data))
                    } catch (h) {
                        for (var i = new Uint8Array(a.data), j = new Array(i.length), k = 0; k < i.length; k++) j[k] = i[k];
                        g = String.fromCharCode.apply(null, j)
                    }
                    return e += b.btoa(g), d(e)
                }, c.decodePacket = function(a, b, d) {
                    if ("string" == typeof a || void 0 === a) {
                        if ("b" == a.charAt(0)) return c.decodeBase64Packet(a.substr(1), b);
                        if (d) try {
                            a = l.decode(a)
                        } catch (e) {
                            return p
                        }
                        var f = a.charAt(0);
                        return Number(f) == f && o[f] ? a.length > 1 ? {
                            type: o[f],
                            data: a.substring(1)
                        } : {
                            type: o[f]
                        } : p
                    }
                    var g = new Uint8Array(a),
                        f = g[0],
                        h = i(a, 1);
                    return q && "blob" === b && (h = new q([h])), {
                        type: o[f],
                        data: h
                    }
                }, c.decodeBase64Packet = function(a, c) {
                    var d = o[a.charAt(0)];
                    if (!b.ArrayBuffer) return {
                        type: d,
                        data: {
                            base64: !0,
                            data: a.substr(1)
                        }
                    };
                    var e = j.decode(a.substr(1));
                    return "blob" === c && q && (e = new q([e])), {
                        type: d,
                        data: e
                    }
                }, c.encodePayload = function(a, b, d) {
                    function e(a) {
                        return a.length + ":" + a
                    }

                    function f(a, d) {
                        c.encodePacket(a, b, !0, function(a) {
                            d(null, e(a))
                        })
                    }
                    return "function" == typeof b && (d = b, b = null), b ? q && !m ? c.encodePayloadAsBlob(a, d) : c.encodePayloadAsArrayBuffer(a, d) : a.length ? void g(a, f, function(a, b) {
                        return d(b.join(""))
                    }) : d("0:")
                }, c.decodePayload = function(a, b, d) {
                    if ("string" != typeof a) return c.decodePayloadAsBinary(a, b, d);
                    "function" == typeof b && (d = b, b = null);
                    var e;
                    if ("" == a) return d(p, 0, 1);
                    for (var f, g, h = "", i = 0, j = a.length; j > i; i++) {
                        var k = a.charAt(i);
                        if (":" != k) h += k;
                        else {
                            if ("" == h || h != (f = Number(h))) return d(p, 0, 1);
                            if (g = a.substr(i + 1, f), h != g.length) return d(p, 0, 1);
                            if (g.length) {
                                if (e = c.decodePacket(g, b, !0), p.type == e.type && p.data == e.data) return d(p, 0, 1);
                                var l = d(e, i + f, j);
                                if (!1 === l) return
                            }
                            i += f, h = ""
                        }
                    }
                    return "" != h ? d(p, 0, 1) : void 0
                }, c.encodePayloadAsArrayBuffer = function(a, b) {
                    function d(a, b) {
                        c.encodePacket(a, !0, !0, function(a) {
                            return b(null, a)
                        })
                    }
                    return a.length ? void g(a, d, function(a, c) {
                        var d = c.reduce(function(a, b) {
                                var c;
                                return c = "string" == typeof b ? b.length : b.byteLength, a + c.toString().length + c + 2
                            }, 0),
                            e = new Uint8Array(d),
                            f = 0;
                        return c.forEach(function(a) {
                            var b = "string" == typeof a,
                                c = a;
                            if (b) {
                                for (var d = new Uint8Array(a.length), g = 0; g < a.length; g++) d[g] = a.charCodeAt(g);
                                c = d.buffer
                            }
                            e[f++] = b ? 0 : 1;
                            for (var h = c.byteLength.toString(), g = 0; g < h.length; g++) e[f++] = parseInt(h[g]);
                            e[f++] = 255;
                            for (var d = new Uint8Array(c), g = 0; g < d.length; g++) e[f++] = d[g]
                        }), b(e.buffer)
                    }) : b(new ArrayBuffer(0))
                }, c.encodePayloadAsBlob = function(a, b) {
                    function d(a, b) {
                        c.encodePacket(a, !0, !0, function(a) {
                            var c = new Uint8Array(1);
                            if (c[0] = 1, "string" == typeof a) {
                                for (var d = new Uint8Array(a.length), e = 0; e < a.length; e++) d[e] = a.charCodeAt(e);
                                a = d.buffer, c[0] = 0
                            }
                            for (var f = a instanceof ArrayBuffer ? a.byteLength : a.size, g = f.toString(), h = new Uint8Array(g.length + 1), e = 0; e < g.length; e++) h[e] = parseInt(g[e]);
                            if (h[g.length] = 255, q) {
                                var i = new q([c.buffer, h.buffer, a]);
                                b(null, i)
                            }
                        })
                    }
                    g(a, d, function(a, c) {
                        return b(new q(c))
                    })
                }, c.decodePayloadAsBinary = function(a, b, d) {
                    "function" == typeof b && (d = b, b = null);
                    for (var e = a, f = [], g = !1; e.byteLength > 0;) {
                        for (var h = new Uint8Array(e), j = 0 === h[0], k = "", l = 1; 255 != h[l]; l++) {
                            if (k.length > 310) {
                                g = !0;
                                break
                            }
                            k += h[l]
                        }
                        if (g) return d(p, 0, 1);
                        e = i(e, 2 + k.length), k = parseInt(k);
                        var m = i(e, 0, k);
                        if (j) try {
                            m = String.fromCharCode.apply(null, new Uint8Array(m))
                        } catch (n) {
                            var o = new Uint8Array(m);
                            m = "";
                            for (var l = 0; l < o.length; l++) m += String.fromCharCode(o[l])
                        }
                        f.push(m), e = i(e, k)
                    }
                    var q = f.length;
                    f.forEach(function(a, e) {
                        d(c.decodePacket(a, b, !0), e, q)
                    })
                }
            }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {
            "./keys": 25,
            after: 26,
            "arraybuffer.slice": 27,
            "base64-arraybuffer": 28,
            blob: 29,
            utf8: 30
        }],
        25: [function(a, b) {
            b.exports = Object.keys || function(a) {
                var b = [],
                    c = Object.prototype.hasOwnProperty;
                for (var d in a) c.call(a, d) && b.push(d);
                return b
            }
        }, {}],
        26: [function(a, b) {
            function c(a, b, c) {
                function e(a, d) {
                    if (e.count <= 0) throw new Error("after called too many times");
                    --e.count, a ? (f = !0, b(a), b = c) : 0 !== e.count || f || b(null, d)
                }
                var f = !1;
                return c = c || d, e.count = a, 0 === a ? b() : e
            }

            function d() {}
            b.exports = c
        }, {}],
        27: [function(a, b) {
            b.exports = function(a, b, c) {
                var d = a.byteLength;
                if (b = b || 0, c = c || d, a.slice) return a.slice(b, c);
                if (0 > b && (b += d), 0 > c && (c += d), c > d && (c = d), b >= d || b >= c || 0 === d) return new ArrayBuffer(0);
                for (var e = new Uint8Array(a), f = new Uint8Array(c - b), g = b, h = 0; c > g; g++, h++) f[h] = e[g];
                return f.buffer
            }
        }, {}],
        28: [function(a, b, c) {
            ! function(a) {
                "use strict";
                c.encode = function(b) {
                    var c, d = new Uint8Array(b),
                        e = d.length,
                        f = "";
                    for (c = 0; e > c; c += 3) f += a[d[c] >> 2], f += a[(3 & d[c]) << 4 | d[c + 1] >> 4], f += a[(15 & d[c + 1]) << 2 | d[c + 2] >> 6], f += a[63 & d[c + 2]];
                    return e % 3 === 2 ? f = f.substring(0, f.length - 1) + "=" : e % 3 === 1 && (f = f.substring(0, f.length - 2) + "=="), f
                }, c.decode = function(b) {
                    var c, d, e, f, g, h = .75 * b.length,
                        i = b.length,
                        j = 0;
                    "=" === b[b.length - 1] && (h--, "=" === b[b.length - 2] && h--);
                    var k = new ArrayBuffer(h),
                        l = new Uint8Array(k);
                    for (c = 0; i > c; c += 4) d = a.indexOf(b[c]), e = a.indexOf(b[c + 1]), f = a.indexOf(b[c + 2]), g = a.indexOf(b[c + 3]), l[j++] = d << 2 | e >> 4, l[j++] = (15 & e) << 4 | f >> 2, l[j++] = (3 & f) << 6 | 63 & g;
                    return k
                }
            }("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")
        }, {}],
        29: [function(a, b) {
            (function(a) {
                function c(a, b) {
                    b = b || {};
                    for (var c = new d, e = 0; e < a.length; e++) c.append(a[e]);
                    return b.type ? c.getBlob(b.type) : c.getBlob()
                }
                var d = a.BlobBuilder || a.WebKitBlobBuilder || a.MSBlobBuilder || a.MozBlobBuilder,
                    e = function() {
                        try {
                            var a = new Blob(["hi"]);
                            return 2 == a.size
                        } catch (b) {
                            return !1
                        }
                    }(),
                    f = d && d.prototype.append && d.prototype.getBlob;
                b.exports = function() {
                    return e ? a.Blob : f ? c : void 0
                }()
            }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {}],
        30: [function(b, c, d) {
            (function(b) {
                ! function(e) {
                    function f(a) {
                        for (var b, c, d = [], e = 0, f = a.length; f > e;) b = a.charCodeAt(e++), b >= 55296 && 56319 >= b && f > e ? (c = a.charCodeAt(e++), 56320 == (64512 & c) ? d.push(((1023 & b) << 10) + (1023 & c) + 65536) : (d.push(b), e--)) : d.push(b);
                        return d
                    }

                    function g(a) {
                        for (var b, c = a.length, d = -1, e = ""; ++d < c;) b = a[d], b > 65535 && (b -= 65536, e += t(b >>> 10 & 1023 | 55296), b = 56320 | 1023 & b), e += t(b);
                        return e
                    }

                    function h(a, b) {
                        return t(a >> b & 63 | 128)
                    }

                    function i(a) {
                        if (0 == (4294967168 & a)) return t(a);
                        var b = "";
                        return 0 == (4294965248 & a) ? b = t(a >> 6 & 31 | 192) : 0 == (4294901760 & a) ? (b = t(a >> 12 & 15 | 224), b += h(a, 6)) : 0 == (4292870144 & a) && (b = t(a >> 18 & 7 | 240), b += h(a, 12), b += h(a, 6)), b += t(63 & a | 128)
                    }

                    function j(a) {
                        for (var b, c = f(a), d = c.length, e = -1, g = ""; ++e < d;) b = c[e], g += i(b);
                        return g
                    }

                    function k() {
                        if (s >= r) throw Error("Invalid byte index");
                        var a = 255 & q[s];
                        if (s++, 128 == (192 & a)) return 63 & a;
                        throw Error("Invalid continuation byte")
                    }

                    function l() {
                        var a, b, c, d, e;
                        if (s > r) throw Error("Invalid byte index");
                        if (s == r) return !1;
                        if (a = 255 & q[s], s++, 0 == (128 & a)) return a;
                        if (192 == (224 & a)) {
                            var b = k();
                            if (e = (31 & a) << 6 | b, e >= 128) return e;
                            throw Error("Invalid continuation byte")
                        }
                        if (224 == (240 & a)) {
                            if (b = k(), c = k(), e = (15 & a) << 12 | b << 6 | c, e >= 2048) return e;
                            throw Error("Invalid continuation byte")
                        }
                        if (240 == (248 & a) && (b = k(), c = k(), d = k(), e = (15 & a) << 18 | b << 12 | c << 6 | d, e >= 65536 && 1114111 >= e)) return e;
                        throw Error("Invalid UTF-8 detected")
                    }

                    function m(a) {
                        q = f(a), r = q.length, s = 0;
                        for (var b, c = [];
                            (b = l()) !== !1;) c.push(b);
                        return g(c)
                    }
                    var n = "object" == typeof d && d,
                        o = "object" == typeof c && c && c.exports == n && c,
                        p = "object" == typeof b && b;
                    (p.global === p || p.window === p) && (e = p);
                    var q, r, s, t = String.fromCharCode,
                        u = {
                            version: "2.0.0",
                            encode: j,
                            decode: m
                        };
                    if ("function" == typeof a && "object" == typeof a.amd && a.amd) a(function() {
                        return u
                    });
                    else if (n && !n.nodeType)
                        if (o) o.exports = u;
                        else {
                            var v = {},
                                w = v.hasOwnProperty;
                            for (var x in u) w.call(u, x) && (n[x] = u[x])
                        } else e.utf8 = u
                }(this)
            }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {}],
        31: [function(a, b) {
            (function(a) {
                var c = /^[\],:{}\s]*$/,
                    d = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                    e = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                    f = /(?:^|:|,)(?:\s*\[)+/g,
                    g = /^\s+/,
                    h = /\s+$/;
                b.exports = function(b) {
                    return "string" == typeof b && b ? (b = b.replace(g, "").replace(h, ""), a.JSON && JSON.parse ? JSON.parse(b) : c.test(b.replace(d, "@").replace(e, "]").replace(f, "")) ? new Function("return " + b)() : void 0) : null
                }
            }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {}],
        32: [function(a, b, c) {
            c.encode = function(a) {
                var b = "";
                for (var c in a) a.hasOwnProperty(c) && (b.length && (b += "&"), b += encodeURIComponent(c) + "=" + encodeURIComponent(a[c]));
                return b
            }, c.decode = function(a) {
                for (var b = {}, c = a.split("&"), d = 0, e = c.length; e > d; d++) {
                    var f = c[d].split("=");
                    b[decodeURIComponent(f[0])] = decodeURIComponent(f[1])
                }
                return b
            }
        }, {}],
        33: [function(a, b) {
            var c = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
                d = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
            b.exports = function(a) {
                var b = a,
                    e = a.indexOf("["),
                    f = a.indexOf("]"); - 1 != e && -1 != f && (a = a.substring(0, e) + a.substring(e, f).replace(/:/g, ";") + a.substring(f, a.length));
                for (var g = c.exec(a || ""), h = {}, i = 14; i--;) h[d[i]] = g[i] || "";
                return -1 != e && -1 != f && (h.source = b, h.host = h.host.substring(1, h.host.length - 1).replace(/;/g, ":"), h.authority = h.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), h.ipv6uri = !0), h
            }
        }, {}],
        34: [function(a, b) {
            function c(a, b) {
                var c;
                return c = b ? new e(a, b) : new e(a)
            }
            var d = function() {
                    return this
                }(),
                e = d.WebSocket || d.MozWebSocket;
            b.exports = e ? c : null, e && (c.prototype = e.prototype)
        }, {}],
        35: [function(a, b) {
            (function(c) {
                function d(a) {
                    function b(a) {
                        if (!a) return !1;
                        if (c.Buffer && c.Buffer.isBuffer(a) || c.ArrayBuffer && a instanceof ArrayBuffer || c.Blob && a instanceof Blob || c.File && a instanceof File) return !0;
                        if (e(a)) {
                            for (var d = 0; d < a.length; d++)
                                if (b(a[d])) return !0
                        } else if (a && "object" == typeof a) {
                            a.toJSON && (a = a.toJSON());
                            for (var f in a)
                                if (a.hasOwnProperty(f) && b(a[f])) return !0
                        }
                        return !1
                    }
                    return b(a)
                }
                var e = a("isarray");
                b.exports = d
            }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {
            isarray: 36
        }],
        36: [function(a, b) {
            b.exports = Array.isArray || function(a) {
                return "[object Array]" == Object.prototype.toString.call(a)
            }
        }, {}],
        37: [function(a, b) {
            var c = a("global");
            try {
                b.exports = "XMLHttpRequest" in c && "withCredentials" in new c.XMLHttpRequest
            } catch (d) {
                b.exports = !1
            }
        }, {
            global: 38
        }],
        38: [function(a, b) {
            b.exports = function() {
                return this
            }()
        }, {}],
        39: [function(a, b) {
            var c = [].indexOf;
            b.exports = function(a, b) {
                if (c) return a.indexOf(b);
                for (var d = 0; d < a.length; ++d)
                    if (a[d] === b) return d;
                return -1
            }
        }, {}],
        40: [function(a, b, c) {
            var d = Object.prototype.hasOwnProperty;
            c.keys = Object.keys || function(a) {
                var b = [];
                for (var c in a) d.call(a, c) && b.push(c);
                return b
            }, c.values = function(a) {
                var b = [];
                for (var c in a) d.call(a, c) && b.push(a[c]);
                return b
            }, c.merge = function(a, b) {
                for (var c in b) d.call(b, c) && (a[c] = b[c]);
                return a
            }, c.length = function(a) {
                return c.keys(a).length
            }, c.isEmpty = function(a) {
                return 0 == c.length(a)
            }
        }, {}],
        41: [function(a, b) {
            var c = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
                d = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
            b.exports = function(a) {
                for (var b = c.exec(a || ""), e = {}, f = 14; f--;) e[d[f]] = b[f] || "";
                return e
            }
        }, {}],
        42: [function(a, b, c) {
            (function(b) {
                var d = a("isarray"),
                    e = a("./is-buffer");
                c.deconstructPacket = function(a) {
                    function b(a) {
                        if (!a) return a;
                        if (e(a)) {
                            var f = {
                                _placeholder: !0,
                                num: c.length
                            };
                            return c.push(a), f
                        }
                        if (d(a)) {
                            for (var g = new Array(a.length), h = 0; h < a.length; h++) g[h] = b(a[h]);
                            return g
                        }
                        if ("object" == typeof a && !(a instanceof Date)) {
                            var g = {};
                            for (var i in a) g[i] = b(a[i]);
                            return g
                        }
                        return a
                    }
                    var c = [],
                        f = a.data,
                        g = a;
                    return g.data = b(f), g.attachments = c.length, {
                        packet: g,
                        buffers: c
                    }
                }, c.reconstructPacket = function(a, b) {
                    function c(a) {
                        if (a && a._placeholder) {
                            var e = b[a.num];
                            return e
                        }
                        if (d(a)) {
                            for (var f = 0; f < a.length; f++) a[f] = c(a[f]);
                            return a
                        }
                        if (a && "object" == typeof a) {
                            for (var g in a) a[g] = c(a[g]);
                            return a
                        }
                        return a
                    }
                    return a.data = c(a.data), a.attachments = void 0, a
                }, c.removeBlobs = function(a, c) {
                    function f(a, i, j) {
                        if (!a) return a;
                        if (b.Blob && a instanceof Blob || b.File && a instanceof File) {
                            g++;
                            var k = new FileReader;
                            k.onload = function() {
                                j ? j[i] = this.result : h = this.result, --g || c(h)
                            }, k.readAsArrayBuffer(a)
                        } else if (d(a))
                            for (var l = 0; l < a.length; l++) f(a[l], l, a);
                        else if (a && "object" == typeof a && !e(a))
                            for (var m in a) f(a[m], m, a)
                    }
                    var g = 0,
                        h = a;
                    f(h), g || c(h)
                }
            }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {
            "./is-buffer": 44,
            isarray: 45
        }],
        43: [function(a, b, c) {
            function d() {}

            function e(a) {
                var b = "",
                    d = !1;
                return b += a.type, (c.BINARY_EVENT == a.type || c.BINARY_ACK == a.type) && (b += a.attachments, b += "-"), a.nsp && "/" != a.nsp && (d = !0, b += a.nsp), null != a.id && (d && (b += ",", d = !1), b += a.id), null != a.data && (d && (b += ","), b += l.stringify(a.data)), k("encoded %j as %s", a, b), b
            }

            function f(a, b) {
                function c(a) {
                    var c = n.deconstructPacket(a),
                        d = e(c.packet),
                        f = c.buffers;
                    f.unshift(d), b(f)
                }
                n.removeBlobs(a, c)
            }

            function g() {
                this.reconstructor = null
            }

            function h(a) {
                var b = {},
                    d = 0;
                if (b.type = Number(a.charAt(0)), null == c.types[b.type]) return j();
                if (c.BINARY_EVENT == b.type || c.BINARY_ACK == b.type) {
                    for (b.attachments = "";
                        "-" != a.charAt(++d);) b.attachments += a.charAt(d);
                    b.attachments = Number(b.attachments)
                }
                if ("/" == a.charAt(d + 1))
                    for (b.nsp = ""; ++d;) {
                        var e = a.charAt(d);
                        if ("," == e) break;
                        if (b.nsp += e, d + 1 == a.length) break
                    } else b.nsp = "/";
                var f = a.charAt(d + 1);
                if ("" != f && Number(f) == f) {
                    for (b.id = ""; ++d;) {
                        var e = a.charAt(d);
                        if (null == e || Number(e) != e) {
                            --d;
                            break
                        }
                        if (b.id += a.charAt(d), d + 1 == a.length) break
                    }
                    b.id = Number(b.id)
                }
                if (a.charAt(++d)) try {
                    b.data = l.parse(a.substr(d))
                } catch (g) {
                    return j()
                }
                return k("decoded %s as %j", a, b), b
            }

            function i(a) {
                this.reconPack = a, this.buffers = []
            }

            function j() {
                return {
                    type: c.ERROR,
                    data: "parser error"
                }
            }
            var k = a("debug")("socket.io-parser"),
                l = a("json3"),
                m = (a("isarray"), a("component-emitter")),
                n = a("./binary"),
                o = a("./is-buffer");
            c.protocol = 4, c.types = ["CONNECT", "DISCONNECT", "EVENT", "BINARY_EVENT", "ACK", "BINARY_ACK", "ERROR"], c.CONNECT = 0, c.DISCONNECT = 1, c.EVENT = 2, c.ACK = 3, c.ERROR = 4, c.BINARY_EVENT = 5, c.BINARY_ACK = 6, c.Encoder = d, c.Decoder = g, d.prototype.encode = function(a, b) {
                if (k("encoding packet %j", a), c.BINARY_EVENT == a.type || c.BINARY_ACK == a.type) f(a, b);
                else {
                    var d = e(a);
                    b([d])
                }
            }, m(g.prototype), g.prototype.add = function(a) {
                var b;
                if ("string" == typeof a) b = h(a), c.BINARY_EVENT == b.type || c.BINARY_ACK == b.type ? (this.reconstructor = new i(b), 0 == this.reconstructor.reconPack.attachments && this.emit("decoded", b)) : this.emit("decoded", b);
                else {
                    if (!o(a) && !a.base64) throw new Error("Unknown type: " + a);
                    if (!this.reconstructor) throw new Error("got binary data when not reconstructing a packet");
                    b = this.reconstructor.takeBinaryData(a), b && (this.reconstructor = null, this.emit("decoded", b))
                }
            }, g.prototype.destroy = function() {
                this.reconstructor && this.reconstructor.finishedReconstruction()
            }, i.prototype.takeBinaryData = function(a) {
                if (this.buffers.push(a), this.buffers.length == this.reconPack.attachments) {
                    var b = n.reconstructPacket(this.reconPack, this.buffers);
                    return this.finishedReconstruction(), b
                }
                return null
            }, i.prototype.finishedReconstruction = function() {
                this.reconPack = null, this.buffers = []
            }
        }, {
            "./binary": 42,
            "./is-buffer": 44,
            "component-emitter": 8,
            debug: 9,
            isarray: 45,
            json3: 46
        }],
        44: [function(a, b) {
            (function(a) {
                function c(b) {
                    return a.Buffer && a.Buffer.isBuffer(b) || a.ArrayBuffer && b instanceof ArrayBuffer
                }
                b.exports = c
            }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
        }, {}],
        45: [function(a, b) {
            b.exports = a(36)
        }, {}],
        46: [function(b, c, d) {
            ! function(b) {
                function c(a) {
                    if (c[a] !== g) return c[a];
                    var b;
                    if ("bug-string-char-index" == a) b = "a" != "a" [0];
                    else if ("json" == a) b = c("json-stringify") && c("json-parse");
                    else {
                        var d, e = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
                        if ("json-stringify" == a) {
                            var f = k.stringify,
                                i = "function" == typeof f && l;
                            if (i) {
                                (d = function() {
                                    return 1
                                }).toJSON = d;
                                try {
                                    i = "0" === f(0) && "0" === f(new Number) && '""' == f(new String) && f(h) === g && f(g) === g && f() === g && "1" === f(d) && "[1]" == f([d]) && "[null]" == f([g]) && "null" == f(null) && "[null,null,null]" == f([g, h, null]) && f({
                                        a: [d, !0, !1, null, "\x00\b\n\f\r	"]
                                    }) == e && "1" === f(null, d) && "[\n 1,\n 2\n]" == f([1, 2], null, 1) && '"-271821-04-20T00:00:00.000Z"' == f(new Date(-864e13)) && '"+275760-09-13T00:00:00.000Z"' == f(new Date(864e13)) && '"-000001-01-01T00:00:00.000Z"' == f(new Date(-621987552e5)) && '"1969-12-31T23:59:59.999Z"' == f(new Date(-1))
                                } catch (j) {
                                    i = !1
                                }
                            }
                            b = i
                        }
                        if ("json-parse" == a) {
                            var m = k.parse;
                            if ("function" == typeof m) try {
                                if (0 === m("0") && !m(!1)) {
                                    d = m(e);
                                    var n = 5 == d.a.length && 1 === d.a[0];
                                    if (n) {
                                        try {
                                            n = !m('"	"')
                                        } catch (j) {}
                                        if (n) try {
                                            n = 1 !== m("01")
                                        } catch (j) {}
                                        if (n) try {
                                            n = 1 !== m("1.")
                                        } catch (j) {}
                                    }
                                }
                            } catch (j) {
                                n = !1
                            }
                            b = n
                        }
                    }
                    return c[a] = !!b
                }
                var e, f, g, h = {}.toString,
                    i = "function" == typeof a && a.amd,
                    j = "object" == typeof JSON && JSON,
                    k = "object" == typeof d && d && !d.nodeType && d;
                k && j ? (k.stringify = j.stringify, k.parse = j.parse) : k = b.JSON = j || {};
                var l = new Date(-0xc782b5b800cec);
                try {
                    l = -109252 == l.getUTCFullYear() && 0 === l.getUTCMonth() && 1 === l.getUTCDate() && 10 == l.getUTCHours() && 37 == l.getUTCMinutes() && 6 == l.getUTCSeconds() && 708 == l.getUTCMilliseconds()
                } catch (m) {}
                if (!c("json")) {
                    var n = "[object Function]",
                        o = "[object Date]",
                        p = "[object Number]",
                        q = "[object String]",
                        r = "[object Array]",
                        s = "[object Boolean]",
                        t = c("bug-string-char-index");
                    if (!l) var u = Math.floor,
                        v = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
                        w = function(a, b) {
                            return v[b] + 365 * (a - 1970) + u((a - 1969 + (b = +(b > 1))) / 4) - u((a - 1901 + b) / 100) + u((a - 1601 + b) / 400)
                        };
                    (e = {}.hasOwnProperty) || (e = function(a) {
                        var b, c = {};
                        return (c.__proto__ = null, c.__proto__ = {
                            toString: 1
                        }, c).toString != h ? e = function(a) {
                            var b = this.__proto__,
                                c = a in (this.__proto__ = null, this);
                            return this.__proto__ = b, c
                        } : (b = c.constructor, e = function(a) {
                            var c = (this.constructor || b).prototype;
                            return a in this && !(a in c && this[a] === c[a])
                        }), c = null, e.call(this, a)
                    });
                    var x = {
                            "boolean": 1,
                            number: 1,
                            string: 1,
                            undefined: 1
                        },
                        y = function(a, b) {
                            var c = typeof a[b];
                            return "object" == c ? !!a[b] : !x[c]
                        };
                    if (f = function(a, b) {
                            var c, d, g, i = 0;
                            (c = function() {
                                this.valueOf = 0
                            }).prototype.valueOf = 0, d = new c;
                            for (g in d) e.call(d, g) && i++;
                            return c = d = null, i ? f = 2 == i ? function(a, b) {
                                var c, d = {},
                                    f = h.call(a) == n;
                                for (c in a) f && "prototype" == c || e.call(d, c) || !(d[c] = 1) || !e.call(a, c) || b(c)
                            } : function(a, b) {
                                var c, d, f = h.call(a) == n;
                                for (c in a) f && "prototype" == c || !e.call(a, c) || (d = "constructor" === c) || b(c);
                                (d || e.call(a, c = "constructor")) && b(c)
                            } : (d = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"], f = function(a, b) {
                                var c, f, g = h.call(a) == n,
                                    i = !g && "function" != typeof a.constructor && y(a, "hasOwnProperty") ? a.hasOwnProperty : e;
                                for (c in a) g && "prototype" == c || !i.call(a, c) || b(c);
                                for (f = d.length; c = d[--f]; i.call(a, c) && b(c));
                            }), f(a, b)
                        }, !c("json-stringify")) {
                        var z = {
                                92: "\\\\",
                                34: '\\"',
                                8: "\\b",
                                12: "\\f",
                                10: "\\n",
                                13: "\\r",
                                9: "\\t"
                            },
                            A = "000000",
                            B = function(a, b) {
                                return (A + (b || 0)).slice(-a)
                            },
                            C = "\\u00",
                            D = function(a) {
                                var b, c = '"',
                                    d = 0,
                                    e = a.length,
                                    f = e > 10 && t;
                                for (f && (b = a.split("")); e > d; d++) {
                                    var g = a.charCodeAt(d);
                                    switch (g) {
                                        case 8:
                                        case 9:
                                        case 10:
                                        case 12:
                                        case 13:
                                        case 34:
                                        case 92:
                                            c += z[g];
                                            break;
                                        default:
                                            if (32 > g) {
                                                c += C + B(2, g.toString(16));
                                                break
                                            }
                                            c += f ? b[d] : t ? a.charAt(d) : a[d]
                                    }
                                }
                                return c + '"'
                            },
                            E = function(a, b, c, d, i, j, k) {
                                var l, m, n, t, v, x, y, z, A, C, F, G, H, I, J, K;
                                try {
                                    l = b[a]
                                } catch (L) {}
                                if ("object" == typeof l && l)
                                    if (m = h.call(l), m != o || e.call(l, "toJSON")) "function" == typeof l.toJSON && (m != p && m != q && m != r || e.call(l, "toJSON")) && (l = l.toJSON(a));
                                    else if (l > -1 / 0 && 1 / 0 > l) {
                                    if (w) {
                                        for (v = u(l / 864e5), n = u(v / 365.2425) + 1970 - 1; w(n + 1, 0) <= v; n++);
                                        for (t = u((v - w(n, 0)) / 30.42); w(n, t + 1) <= v; t++);
                                        v = 1 + v - w(n, t), x = (l % 864e5 + 864e5) % 864e5, y = u(x / 36e5) % 24, z = u(x / 6e4) % 60, A = u(x / 1e3) % 60, C = x % 1e3
                                    } else n = l.getUTCFullYear(), t = l.getUTCMonth(), v = l.getUTCDate(), y = l.getUTCHours(), z = l.getUTCMinutes(), A = l.getUTCSeconds(), C = l.getUTCMilliseconds();
                                    l = (0 >= n || n >= 1e4 ? (0 > n ? "-" : "+") + B(6, 0 > n ? -n : n) : B(4, n)) + "-" + B(2, t + 1) + "-" + B(2, v) + "T" + B(2, y) + ":" + B(2, z) + ":" + B(2, A) + "." + B(3, C) + "Z"
                                } else l = null;
                                if (c && (l = c.call(b, a, l)), null === l) return "null";
                                if (m = h.call(l), m == s) return "" + l;
                                if (m == p) return l > -1 / 0 && 1 / 0 > l ? "" + l : "null";
                                if (m == q) return D("" + l);
                                if ("object" == typeof l) {
                                    for (I = k.length; I--;)
                                        if (k[I] === l) throw TypeError();
                                    if (k.push(l), F = [], J = j, j += i, m == r) {
                                        for (H = 0, I = l.length; I > H; H++) G = E(H, l, c, d, i, j, k), F.push(G === g ? "null" : G);
                                        K = F.length ? i ? "[\n" + j + F.join(",\n" + j) + "\n" + J + "]" : "[" + F.join(",") + "]" : "[]"
                                    } else f(d || l, function(a) {
                                        var b = E(a, l, c, d, i, j, k);
                                        b !== g && F.push(D(a) + ":" + (i ? " " : "") + b)
                                    }), K = F.length ? i ? "{\n" + j + F.join(",\n" + j) + "\n" + J + "}" : "{" + F.join(",") + "}" : "{}";
                                    return k.pop(), K
                                }
                            };
                        k.stringify = function(a, b, c) {
                            var d, e, f, g;
                            if ("function" == typeof b || "object" == typeof b && b)
                                if ((g = h.call(b)) == n) e = b;
                                else if (g == r) {
                                f = {};
                                for (var i, j = 0, k = b.length; k > j; i = b[j++], g = h.call(i), (g == q || g == p) && (f[i] = 1));
                            }
                            if (c)
                                if ((g = h.call(c)) == p) {
                                    if ((c -= c % 1) > 0)
                                        for (d = "", c > 10 && (c = 10); d.length < c; d += " ");
                                } else g == q && (d = c.length <= 10 ? c : c.slice(0, 10));
                            return E("", (i = {}, i[""] = a, i), e, f, d, "", [])
                        }
                    }
                    if (!c("json-parse")) {
                        var F, G, H = String.fromCharCode,
                            I = {
                                92: "\\",
                                34: '"',
                                47: "/",
                                98: "\b",
                                116: "	",
                                110: "\n",
                                102: "\f",
                                114: "\r"
                            },
                            J = function() {
                                throw F = G = null, SyntaxError()
                            },
                            K = function() {
                                for (var a, b, c, d, e, f = G, g = f.length; g > F;) switch (e = f.charCodeAt(F)) {
                                    case 9:
                                    case 10:
                                    case 13:
                                    case 32:
                                        F++;
                                        break;
                                    case 123:
                                    case 125:
                                    case 91:
                                    case 93:
                                    case 58:
                                    case 44:
                                        return a = t ? f.charAt(F) : f[F], F++, a;
                                    case 34:
                                        for (a = "@", F++; g > F;)
                                            if (e = f.charCodeAt(F), 32 > e) J();
                                            else if (92 == e) switch (e = f.charCodeAt(++F)) {
                                            case 92:
                                            case 34:
                                            case 47:
                                            case 98:
                                            case 116:
                                            case 110:
                                            case 102:
                                            case 114:
                                                a += I[e], F++;
                                                break;
                                            case 117:
                                                for (b = ++F, c = F + 4; c > F; F++) e = f.charCodeAt(F), e >= 48 && 57 >= e || e >= 97 && 102 >= e || e >= 65 && 70 >= e || J();
                                                a += H("0x" + f.slice(b, F));
                                                break;
                                            default:
                                                J()
                                        } else {
                                            if (34 == e) break;
                                            for (e = f.charCodeAt(F), b = F; e >= 32 && 92 != e && 34 != e;) e = f.charCodeAt(++F);
                                            a += f.slice(b, F)
                                        }
                                        if (34 == f.charCodeAt(F)) return F++, a;
                                        J();
                                    default:
                                        if (b = F, 45 == e && (d = !0, e = f.charCodeAt(++F)), e >= 48 && 57 >= e) {
                                            for (48 == e && (e = f.charCodeAt(F + 1), e >= 48 && 57 >= e) && J(), d = !1; g > F && (e = f.charCodeAt(F), e >= 48 && 57 >= e); F++);
                                            if (46 == f.charCodeAt(F)) {
                                                for (c = ++F; g > c && (e = f.charCodeAt(c), e >= 48 && 57 >= e); c++);
                                                c == F && J(), F = c
                                            }
                                            if (e = f.charCodeAt(F), 101 == e || 69 == e) {
                                                for (e = f.charCodeAt(++F), (43 == e || 45 == e) && F++, c = F; g > c && (e = f.charCodeAt(c), e >= 48 && 57 >= e); c++);
                                                c == F && J(), F = c
                                            }
                                            return +f.slice(b, F)
                                        }
                                        if (d && J(), "true" == f.slice(F, F + 4)) return F += 4, !0;
                                        if ("false" == f.slice(F, F + 5)) return F += 5, !1;
                                        if ("null" == f.slice(F, F + 4)) return F += 4, null;
                                        J()
                                }
                                return "$"
                            },
                            L = function(a) {
                                var b, c;
                                if ("$" == a && J(), "string" == typeof a) {
                                    if ("@" == (t ? a.charAt(0) : a[0])) return a.slice(1);
                                    if ("[" == a) {
                                        for (b = []; a = K(), "]" != a; c || (c = !0)) c && ("," == a ? (a = K(), "]" == a && J()) : J()), "," == a && J(), b.push(L(a));
                                        return b
                                    }
                                    if ("{" == a) {
                                        for (b = {}; a = K(), "}" != a; c || (c = !0)) c && ("," == a ? (a = K(), "}" == a && J()) : J()), ("," == a || "string" != typeof a || "@" != (t ? a.charAt(0) : a[0]) || ":" != K()) && J(), b[a.slice(1)] = L(K());
                                        return b
                                    }
                                    J()
                                }
                                return a
                            },
                            M = function(a, b, c) {
                                var d = N(a, b, c);
                                d === g ? delete a[b] : a[b] = d
                            },
                            N = function(a, b, c) {
                                var d, e = a[b];
                                if ("object" == typeof e && e)
                                    if (h.call(e) == r)
                                        for (d = e.length; d--;) M(e, d, c);
                                    else f(e, function(a) {
                                        M(e, a, c)
                                    });
                                return c.call(a, b, e)
                            };
                        k.parse = function(a, b) {
                            var c, d;
                            return F = 0, G = "" + a, c = L(K()), "$" != K() && J(), F = G = null, b && h.call(b) == n ? N((d = {}, d[""] = c, d), "", b) : c
                        }
                    }
                }
                i && a(function() {
                    return k
                })
            }(this)
        }, {}],
        47: [function(a, b) {
            function c(a, b) {
                var c = [];
                b = b || 0;
                for (var d = b || 0; d < a.length; d++) c[d - b] = a[d];
                return c
            }
            b.exports = c
        }, {}]
    }, {}, [1])(1)
}), self = "undefined" != typeof window ? window : "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope ? self : {};
/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 * @license
 */
var Prism = function() {
    var a = /\blang(?:uage)?-(?!\*)(\w+)\b/i,
        b = self.Prism = {
            util: {
                encode: function(a) {
                    return a instanceof c ? new c(a.type, b.util.encode(a.content), a.alias) : "Array" === b.util.type(a) ? a.map(b.util.encode) : a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ")
                },
                type: function(a) {
                    return Object.prototype.toString.call(a).match(/\[object (\w+)\]/)[1]
                },
                clone: function(a) {
                    var c = b.util.type(a);
                    switch (c) {
                        case "Object":
                            var d = {};
                            for (var e in a) a.hasOwnProperty(e) && (d[e] = b.util.clone(a[e]));
                            return d;
                        case "Array":
                            return a.slice()
                    }
                    return a
                }
            },
            languages: {
                extend: function(a, c) {
                    var d = b.util.clone(b.languages[a]);
                    for (var e in c) d[e] = c[e];
                    return d
                },
                insertBefore: function(a, c, d, e) {
                    e = e || b.languages;
                    var f = e[a];
                    if (2 == arguments.length) {
                        d = arguments[1];
                        for (var g in d) d.hasOwnProperty(g) && (f[g] = d[g]);
                        return f
                    }
                    var h = {};
                    for (var i in f)
                        if (f.hasOwnProperty(i)) {
                            if (i == c)
                                for (var g in d) d.hasOwnProperty(g) && (h[g] = d[g]);
                            h[i] = f[i]
                        }
                    return b.languages.DFS(b.languages, function(b, c) {
                        c === e[a] && b != a && (this[b] = h)
                    }), e[a] = h
                },
                DFS: function(a, c, d) {
                    for (var e in a) a.hasOwnProperty(e) && (c.call(a, e, a[e], d || e), "Object" === b.util.type(a[e]) ? b.languages.DFS(a[e], c) : "Array" === b.util.type(a[e]) && b.languages.DFS(a[e], c, e))
                }
            },
            highlightAll: function(a, c) {
                for (var d, e = document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'), f = 0; d = e[f++];) b.highlightElement(d, a === !0, c)
            },
            highlightElement: function(d, e, f) {
                for (var g, h, i = d; i && !a.test(i.className);) i = i.parentNode;
                if (i && (g = (i.className.match(a) || [, ""])[1], h = b.languages[g]), h) {
                    d.className = d.className.replace(a, "").replace(/\s+/g, " ") + " language-" + g, i = d.parentNode, /pre/i.test(i.nodeName) && (i.className = i.className.replace(a, "").replace(/\s+/g, " ") + " language-" + g);
                    var j = d.textContent;
                    if (j) {
                        var k = {
                            element: d,
                            language: g,
                            grammar: h,
                            code: j
                        };
                        if (b.hooks.run("before-highlight", k), e && self.Worker) {
                            var l = new Worker(b.filename);
                            l.onmessage = function(a) {
                                k.highlightedCode = c.stringify(JSON.parse(a.data), g), b.hooks.run("before-insert", k), k.element.innerHTML = k.highlightedCode, f && f.call(k.element), b.hooks.run("after-highlight", k)
                            }, l.postMessage(JSON.stringify({
                                language: k.language,
                                code: k.code
                            }))
                        } else k.highlightedCode = b.highlight(k.code, k.grammar, k.language), b.hooks.run("before-insert", k), k.element.innerHTML = k.highlightedCode, f && f.call(d), b.hooks.run("after-highlight", k)
                    }
                }
            },
            highlight: function(a, d, e) {
                var f = b.tokenize(a, d);
                return c.stringify(b.util.encode(f), e)
            },
            tokenize: function(a, c) {
                var d = b.Token,
                    e = [a],
                    f = c.rest;
                if (f) {
                    for (var g in f) c[g] = f[g];
                    delete c.rest
                }
                a: for (var g in c)
                    if (c.hasOwnProperty(g) && c[g]) {
                        var h = c[g];
                        h = "Array" === b.util.type(h) ? h : [h];
                        for (var i = 0; i < h.length; ++i) {
                            var j = h[i],
                                k = j.inside,
                                l = !!j.lookbehind,
                                m = 0,
                                n = j.alias;
                            j = j.pattern || j;
                            for (var o = 0; o < e.length; o++) {
                                var p = e[o];
                                if (e.length > a.length) break a;
                                if (!(p instanceof d)) {
                                    j.lastIndex = 0;
                                    var q = j.exec(p);
                                    if (q) {
                                        l && (m = q[1].length);
                                        var r = q.index - 1 + m,
                                            q = q[0].slice(m),
                                            s = q.length,
                                            t = r + s,
                                            u = p.slice(0, r + 1),
                                            v = p.slice(t + 1),
                                            w = [o, 1];
                                        u && w.push(u);
                                        var x = new d(g, k ? b.tokenize(q, k) : q, n);
                                        w.push(x), v && w.push(v), Array.prototype.splice.apply(e, w)
                                    }
                                }
                            }
                        }
                    }
                return e
            },
            hooks: {
                all: {},
                add: function(a, c) {
                    var d = b.hooks.all;
                    d[a] = d[a] || [], d[a].push(c)
                },
                run: function(a, c) {
                    var d = b.hooks.all[a];
                    if (d && d.length)
                        for (var e, f = 0; e = d[f++];) e(c)
                }
            }
        },
        c = b.Token = function(a, b, c) {
            this.type = a, this.content = b, this.alias = c
        };
    if (c.stringify = function(a, d, e) {
            if ("string" == typeof a) return a;
            if ("[object Array]" == Object.prototype.toString.call(a)) return a.map(function(b) {
                return c.stringify(b, d, a)
            }).join("");
            var f = {
                type: a.type,
                content: c.stringify(a.content, d, e),
                tag: "span",
                classes: ["token", a.type],
                attributes: {},
                language: d,
                parent: e
            };
            if ("comment" == f.type && (f.attributes.spellcheck = "true"), a.alias) {
                var g = "Array" === b.util.type(a.alias) ? a.alias : [a.alias];
                Array.prototype.push.apply(f.classes, g)
            }
            b.hooks.run("wrap", f);
            var h = "";
            for (var i in f.attributes) h += i + '="' + (f.attributes[i] || "") + '"';
            return "<" + f.tag + ' class="' + f.classes.join(" ") + '" ' + h + ">" + f.content + "</" + f.tag + ">"
        }, !self.document) return self.addEventListener ? (self.addEventListener("message", function(a) {
        var c = JSON.parse(a.data),
            d = c.language,
            e = c.code;
        self.postMessage(JSON.stringify(b.util.encode(b.tokenize(e, b.languages[d])))), self.close()
    }, !1), self.Prism) : self.Prism;
    var d = document.getElementsByTagName("script");
    return d = d[d.length - 1], d && (b.filename = d.src, document.addEventListener && !d.hasAttribute("data-manual") && document.addEventListener("DOMContentLoaded", b.highlightAll)), self.Prism
}();
"undefined" != typeof module && module.exports && (module.exports = Prism), Prism.languages.markup = {
    comment: /<!--[\w\W]*?-->/g,
    prolog: /<\?.+?\?>/,
    doctype: /<!DOCTYPE.+?>/,
    cdata: /<!\[CDATA\[[\w\W]*?]]>/i,
    tag: {
        pattern: /<\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+))?\s*)*\/?>/gi,
        inside: {
            tag: {
                pattern: /^<\/?[\w:-]+/i,
                inside: {
                    punctuation: /^<\/?/,
                    namespace: /^[\w-]+?:/
                }
            },
            "attr-value": {
                pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,
                inside: {
                    punctuation: /=|>|"/g
                }
            },
            punctuation: /\/?>/g,
            "attr-name": {
                pattern: /[\w:-]+/g,
                inside: {
                    namespace: /^[\w-]+?:/
                }
            }
        }
    },
    entity: /\&#?[\da-z]{1,8};/gi
}, Prism.hooks.add("wrap", function(a) {
    "entity" === a.type && (a.attributes.title = a.content.replace(/&amp;/, "&"))
}), Prism.languages.twig = {
    comment: /\{\#[\s\S]*?\#\}/g,
    tag: {
        pattern: /(\{\{[\s\S]*?\}\}|\{\%[\s\S]*?\%\})/g,
        inside: {
            ld: {
                pattern: /^(\{\{\-?|\{\%\-?\s*\w+)/,
                inside: {
                    punctuation: /^(\{\{|\{\%)\-?/,
                    keyword: /\w+/
                }
            },
            rd: {
                pattern: /\-?(\%\}|\}\})$/,
                inside: {
                    punctuation: /.*/
                }
            },
            string: {
                pattern: /("|')(\\?.)*?\1/g,
                inside: {
                    punctuation: /^('|")|('|")$/g
                }
            },
            keyword: /\b(if)\b/g,
            "boolean": /\b(true|false|null)\b/g,
            number: /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,
            operator: /==|=|\!=|<|>|>=|<=|\+|\-|~|\*|\/|\/\/|%|\*\*|\|/g,
            "space-operator": {
                pattern: /(\s)(\b(not|b\-and|b\-xor|b\-or|and|or|in|matches|starts with|ends with|is)\b|\?|:|\?\:)(?=\s)/g,
                lookbehind: !0,
                inside: {
                    operator: /.*/
                }
            },
            property: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g,
            punctuation: /\(|\)|\[\]|\[|\]|\{|\}|\:|\.|,/g
        }
    },
    other: {
        pattern: /[\s\S]*/,
        inside: Prism.languages.markup
    }
}, Prism.languages.css = {
    comment: /\/\*[\w\W]*?\*\//g,
    atrule: {
        pattern: /@[\w-]+?.*?(;|(?=\s*{))/gi,
        inside: {
            punctuation: /[;:]/g
        }
    },
    url: /url\((["']?).*?\1\)/gi,
    selector: /[^\{\}\s][^\{\};]*(?=\s*\{)/g,
    property: /(\b|\B)[\w-]+(?=\s*:)/gi,
    string: /("|')(\\?.)*?\1/g,
    important: /\B!important\b/gi,
    punctuation: /[\{\};:]/g,
    "function": /[-a-z0-9]+(?=\()/gi
}, Prism.languages.markup && (Prism.languages.insertBefore("markup", "tag", {
    style: {
        pattern: /<style[\w\W]*?>[\w\W]*?<\/style>/gi,
        inside: {
            tag: {
                pattern: /<style[\w\W]*?>|<\/style>/gi,
                inside: Prism.languages.markup.tag.inside
            },
            rest: Prism.languages.css
        },
        alias: "language-css"
    }
}), Prism.languages.insertBefore("inside", "attr-value", {
    "style-attr": {
        pattern: /\s*style=("|').+?\1/gi,
        inside: {
            "attr-name": {
                pattern: /^\s*style/gi,
                inside: Prism.languages.markup.tag.inside
            },
            punctuation: /^\s*=\s*['"]|['"]\s*$/,
            "attr-value": {
                pattern: /.+/gi,
                inside: Prism.languages.css
            }
        },
        alias: "language-css"
    }
}, Prism.languages.markup.tag)), Prism.languages.css.selector = {
    pattern: /[^\{\}\s][^\{\}]*(?=\s*\{)/g,
    inside: {
        "pseudo-element": /:(?:after|before|first-letter|first-line|selection)|::[-\w]+/g,
        "pseudo-class": /:[-\w]+(?:\(.*\))?/g,
        "class": /\.[-:\.\w]+/g,
        id: /#[-:\.\w]+/g
    }
}, Prism.languages.insertBefore("css", "ignore", {
    hexcode: /#[\da-f]{3,6}/gi,
    entity: /\\[\da-f]{1,8}/gi,
    number: /[\d%\.]+/g
}), Prism.languages.clike = {
    comment: [{
        pattern: /(^|[^\\])\/\*[\w\W]*?\*\//g,
        lookbehind: !0
    }, {
        pattern: /(^|[^\\:])\/\/.*?(\r?\n|$)/g,
        lookbehind: !0
    }],
    string: /("|')(\\?.)*?\1/g,
    "class-name": {
        pattern: /((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/gi,
        lookbehind: !0,
        inside: {
            punctuation: /(\.|\\)/
        }
    },
    keyword: /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,
    "boolean": /\b(true|false)\b/g,
    "function": {
        pattern: /[a-z0-9_]+\(/gi,
        inside: {
            punctuation: /\(/
        }
    },
    number: /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,
    operator: /[-+]{1,2}|!|<=?|>=?|={1,3}|&{1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,
    ignore: /&(lt|gt|amp);/gi,
    punctuation: /[{}[\];(),.:]/g
}, Prism.languages.javascript = Prism.languages.extend("clike", {
    keyword: /\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|function|get|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/g,
    number: /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?|NaN|-?Infinity)\b/g
}), Prism.languages.insertBefore("javascript", "keyword", {
    regex: {
        pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
        lookbehind: !0
    }
}), Prism.languages.markup && Prism.languages.insertBefore("markup", "tag", {
    script: {
        pattern: /<script[\w\W]*?>[\w\W]*?<\/script>/gi,
        inside: {
            tag: {
                pattern: /<script[\w\W]*?>|<\/script>/gi,
                inside: Prism.languages.markup.tag.inside
            },
            rest: Prism.languages.javascript
        },
        alias: "language-javascript"
    }
}), Prism.languages.java = Prism.languages.extend("clike", {
    keyword: /\b(abstract|continue|for|new|switch|assert|default|goto|package|synchronized|boolean|do|if|private|this|break|double|implements|protected|throw|byte|else|import|public|throws|case|enum|instanceof|return|transient|catch|extends|int|short|try|char|final|interface|static|void|class|finally|long|strictfp|volatile|const|float|native|super|while)\b/g,
    number: /\b0b[01]+\b|\b0x[\da-f]*\.?[\da-fp\-]+\b|\b\d*\.?\d+[e]?[\d]*[df]\b|\W\d*\.?\d+\b/gi,
    operator: {
        pattern: /(^|[^\.])(?:\+=|\+\+?|-=|--?|!=?|<{1,2}=?|>{1,3}=?|==?|&=|&&?|\|=|\|\|?|\?|\*=?|\/=?|%=?|\^=?|:|~)/gm,
        lookbehind: !0
    }
}), Prism.languages.php = Prism.languages.extend("clike", {
    keyword: /\b(and|or|xor|array|as|break|case|cfunction|class|const|continue|declare|default|die|do|else|elseif|enddeclare|endfor|endforeach|endif|endswitch|endwhile|extends|for|foreach|function|include|include_once|global|if|new|return|static|switch|use|require|require_once|var|while|abstract|interface|public|implements|private|protected|parent|throw|null|echo|print|trait|namespace|final|yield|goto|instanceof|finally|try|catch)\b/gi,
    constant: /\b[A-Z0-9_]{2,}\b/g,
    comment: {
        pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|(^|[^:])(\/\/|#).*?(\r?\n|$))/g,
        lookbehind: !0
    }
}), Prism.languages.insertBefore("php", "keyword", {
    delimiter: /(\?>|<\?php|<\?)/gi,
    variable: /(\$\w+)\b/gi,
    "package": {
        pattern: /(\\|namespace\s+|use\s+)[\w\\]+/g,
        lookbehind: !0,
        inside: {
            punctuation: /\\/
        }
    }
}), Prism.languages.insertBefore("php", "operator", {
    property: {
        pattern: /(->)[\w]+/g,
        lookbehind: !0
    }
}), Prism.languages.markup && (Prism.hooks.add("before-highlight", function(a) {
    "php" === a.language && (a.tokenStack = [], a.backupCode = a.code, a.code = a.code.replace(/(?:<\?php|<\?)[\w\W]*?(?:\?>)/gi, function(b) {
        return a.tokenStack.push(b), "{{{PHP" + a.tokenStack.length + "}}}"
    }))
}), Prism.hooks.add("before-insert", function(a) {
    "php" === a.language && (a.code = a.backupCode, delete a.backupCode)
}), Prism.hooks.add("after-highlight", function(a) {
    if ("php" === a.language) {
        for (var b, c = 0; b = a.tokenStack[c]; c++) a.highlightedCode = a.highlightedCode.replace("{{{PHP" + (c + 1) + "}}}", Prism.highlight(b, a.grammar, "php"));
        a.element.innerHTML = a.highlightedCode
    }
}), Prism.hooks.add("wrap", function(a) {
    "php" === a.language && "markup" === a.type && (a.content = a.content.replace(/(\{\{\{PHP[0-9]+\}\}\})/g, '<span class="token php">$1</span>'))
}), Prism.languages.insertBefore("php", "comment", {
    markup: {
        pattern: /<[^?]\/?(.*?)>/g,
        inside: Prism.languages.markup
    },
    php: /\{\{\{PHP[0-9]+\}\}\}/g
})), Prism.languages.insertBefore("php", "variable", {
    "this": /\$this/g,
    global: /\$_?(GLOBALS|SERVER|GET|POST|FILES|REQUEST|SESSION|ENV|COOKIE|HTTP_RAW_POST_DATA|argc|argv|php_errormsg|http_response_header)/g,
    scope: {
        pattern: /\b[\w\\]+::/g,
        inside: {
            keyword: /(static|self|parent)/,
            punctuation: /(::|\\)/
        }
    }
}), Prism.languages.coffeescript = Prism.languages.extend("javascript", {
    comment: [/([#]{3}\s*\r?\n(.*\s*\r*\n*)\s*?\r?\n[#]{3})/g, /(\s|^)([#]{1}[^#^\r^\n]{2,}?(\r?\n|$))/g],
    keyword: /\b(this|window|delete|class|extends|namespace|extend|ar|let|if|else|while|do|for|each|of|return|in|instanceof|new|with|typeof|try|catch|finally|null|undefined|break|continue)\b/g
}), Prism.languages.insertBefore("coffeescript", "keyword", {
    "function": {
        pattern: /[a-z|A-z]+\s*[:|=]\s*(\([.|a-z\s|,|:|{|}|\"|\'|=]*\))?\s*-&gt;/gi,
        inside: {
            "function-name": /[_?a-z-|A-Z-]+(\s*[:|=])| @[_?$?a-z-|A-Z-]+(\s*)| /g,
            operator: /[-+]{1,2}|!|=?&lt;|=?&gt;|={1,2}|(&amp;){1,2}|\|?\||\?|\*|\//g
        }
    },
    "attr-name": /[_?a-z-|A-Z-]+(\s*:)| @[_?$?a-z-|A-Z-]+(\s*)| /g
}), Prism.languages.scss = Prism.languages.extend("css", {
    comment: {
        pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*?(\r?\n|$))/g,
        lookbehind: !0
    },
    atrule: /@[\w-]+(?=\s+(\(|\{|;))/gi,
    url: /([-a-z]+-)*url(?=\()/gi,
    selector: /([^@;\{\}\(\)]?([^@;\{\}\(\)]|&|\#\{\$[-_\w]+\})+)(?=\s*\{(\}|\s|[^\}]+(:|\{)[^\}]+))/gm
}), Prism.languages.insertBefore("scss", "atrule", {
    keyword: /@(if|else if|else|for|each|while|import|extend|debug|warn|mixin|include|function|return|content)|(?=@for\s+\$[-_\w]+\s)+from/i
}), Prism.languages.insertBefore("scss", "property", {
    variable: /((\$[-_\w]+)|(#\{\$[-_\w]+\}))/i
}), Prism.languages.insertBefore("scss", "ignore", {
    placeholder: /%[-_\w]+/i,
    statement: /\B!(default|optional)\b/gi,
    "boolean": /\b(true|false)\b/g,
    "null": /\b(null)\b/g,
    operator: /\s+([-+]{1,2}|={1,2}|!=|\|?\||\?|\*|\/|\%)\s+/g
}), Prism.languages.bash = Prism.languages.extend("clike", {
    comment: {
        pattern: /(^|[^"{\\])(#.*?(\r?\n|$))/g,
        lookbehind: !0
    },
    string: {
        pattern: /("|')(\\?[\s\S])*?\1/g,
        inside: {
            property: /\$([a-zA-Z0-9_#\?\-\*!@]+|\{[^\}]+\})/g
        }
    },
    keyword: /\b(if|then|else|elif|fi|for|break|continue|while|in|case|function|select|do|done|until|echo|exit|return|set|declare)\b/g
}), Prism.languages.insertBefore("bash", "keyword", {
    property: /\$([a-zA-Z0-9_#\?\-\*!@]+|\{[^}]+\})/g
}), Prism.languages.insertBefore("bash", "comment", {
    important: /(^#!\s*\/bin\/bash)|(^#!\s*\/bin\/sh)/g
}), Prism.languages.c = Prism.languages.extend("clike", {
    string: /("|')([^\n\\\1]|\\.|\\\r*\n)*?\1/g,
    keyword: /\b(asm|typeof|inline|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while)\b/g,
    operator: /[-+]{1,2}|!=?|<{1,2}=?|>{1,2}=?|\->|={1,2}|\^|~|%|&{1,2}|\|?\||\?|\*|\//g
}), Prism.languages.insertBefore("c", "string", {
    property: {
        pattern: /((^|\n)\s*)#\s*[a-z]+([^\n\\]|\\.|\\\r*\n)*/gi,
        lookbehind: !0,
        inside: {
            string: {
                pattern: /(#\s*include\s*)(<.+?>|("|')(\\?.)+?\3)/g,
                lookbehind: !0
            }
        }
    }
}), delete Prism.languages.c["class-name"], delete Prism.languages.c["boolean"], Prism.languages.cpp = Prism.languages.extend("c", {
    keyword: /\b(alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|class|compl|const|constexpr|const_cast|continue|decltype|default|delete|delete\[\]|do|double|dynamic_cast|else|enum|explicit|export|extern|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|new\[\]|noexcept|nullptr|operator|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/g,
    "boolean": /\b(true|false)\b/g,
    operator: /[-+]{1,2}|!=?|<{1,2}=?|>{1,2}=?|\->|:{1,2}|={1,2}|\^|~|%|&{1,2}|\|?\||\?|\*|\/|\b(and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/g
}), Prism.languages.insertBefore("cpp", "keyword", {
    "class-name": {
        pattern: /(class\s+)[a-z0-9_]+/gi,
        lookbehind: !0
    }
}), Prism.languages.python = {
    comment: {
        pattern: /(^|[^\\])#.*?(\r?\n|$)/g,
        lookbehind: !0
    },
    string: /"""[\s\S]+?"""|("|')(\\?.)*?\1/g,
    keyword: /\b(as|assert|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|pass|print|raise|return|try|while|with|yield)\b/g,
    "boolean": /\b(True|False)\b/g,
    number: /\b-?(0x)?\d*\.?[\da-f]+\b/g,
    operator: /[-+]{1,2}|=?&lt;|=?&gt;|!|={1,2}|(&){1,2}|(&amp;){1,2}|\|?\||\?|\*|\/|~|\^|%|\b(or|and|not)\b/g,
    ignore: /&(lt|gt|amp);/gi,
    punctuation: /[{}[\];(),.:]/g
}, Prism.languages.sql = {
    comment: {
        pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|((--)|(\/\/)|#).*?(\r?\n|$))/g,
        lookbehind: !0
    },
    string: {
        pattern: /(^|[^@])("|')(\\?[\s\S])*?\2/g,
        lookbehind: !0
    },
    variable: /@[\w.$]+|@("|'|`)(\\?[\s\S])+?\1/g,
    "function": /\b(?:COUNT|SUM|AVG|MIN|MAX|FIRST|LAST|UCASE|LCASE|MID|LEN|ROUND|NOW|FORMAT)(?=\s*\()/gi,
    keyword: /\b(?:ACTION|ADD|AFTER|ALGORITHM|ALTER|ANALYZE|APPLY|AS|ASC|AUTHORIZATION|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADE|CASCADED|CASE|CHAIN|CHAR VARYING|CHARACTER VARYING|CHECK|CHECKPOINT|CLOSE|CLUSTERED|COALESCE|COLUMN|COLUMNS|COMMENT|COMMIT|COMMITTED|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS|CONTAINSTABLE|CONTINUE|CONVERT|CREATE|CROSS|CURRENT|CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP|CURRENT_USER|CURSOR|DATA|DATABASE|DATABASES|DATETIME|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE|DOUBLE PRECISION|DROP|DUMMY|DUMP|DUMPFILE|DUPLICATE KEY|ELSE|ENABLE|ENCLOSED BY|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPE|ESCAPED BY|EXCEPT|EXEC|EXECUTE|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR|FOR EACH ROW|FORCE|FOREIGN|FREETEXT|FREETEXTTABLE|FROM|FULL|FUNCTION|GEOMETRY|GEOMETRYCOLLECTION|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|IDENTITY|IDENTITY_INSERT|IDENTITYCOL|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTO|INVOKER|ISOLATION LEVEL|JOIN|KEY|KEYS|KILL|LANGUAGE SQL|LAST|LEFT|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONGBLOB|LONGTEXT|MATCH|MATCHED|MEDIUMBLOB|MEDIUMINT|MEDIUMTEXT|MERGE|MIDDLEINT|MODIFIES SQL DATA|MODIFY|MULTILINESTRING|MULTIPOINT|MULTIPOLYGON|NATIONAL|NATIONAL CHAR VARYING|NATIONAL CHARACTER|NATIONAL CHARACTER VARYING|NATIONAL VARCHAR|NATURAL|NCHAR|NCHAR VARCHAR|NEXT|NO|NO SQL|NOCHECK|NOCYCLE|NONCLUSTERED|NULLIF|NUMERIC|OF|OFF|OFFSETS|ON|OPEN|OPENDATASOURCE|OPENQUERY|OPENROWSET|OPTIMIZE|OPTION|OPTIONALLY|ORDER|OUT|OUTER|OUTFILE|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREV|PRIMARY|PRINT|PRIVILEGES|PROC|PROCEDURE|PUBLIC|PURGE|QUICK|RAISERROR|READ|READS SQL DATA|READTEXT|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEATABLE|REPLICATION|REQUIRE|RESTORE|RESTRICT|RETURN|RETURNS|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROWCOUNT|ROWGUIDCOL|ROWS?|RTREE|RULE|SAVE|SAVEPOINT|SCHEMA|SELECT|SERIAL|SERIALIZABLE|SESSION|SESSION_USER|SET|SETUSER|SHARE MODE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|START|STARTING BY|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLE|TABLES|TABLESPACE|TEMP(?:ORARY)?|TEMPTABLE|TERMINATED BY|TEXT|TEXTSIZE|THEN|TIMESTAMP|TINYBLOB|TINYINT|TINYTEXT|TO|TOP|TRAN|TRANSACTION|TRANSACTIONS|TRIGGER|TRUNCATE|TSEQUAL|TYPE|TYPES|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNPIVOT|UPDATE|UPDATETEXT|USAGE|USE|USER|USING|VALUE|VALUES|VARBINARY|VARCHAR|VARCHARACTER|VARYING|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH|WITH ROLLUP|WITHIN|WORK|WRITE|WRITETEXT)\b/gi,
    "boolean": /\b(?:TRUE|FALSE|NULL)\b/gi,
    number: /\b-?(0x)?\d*\.?[\da-f]+\b/g,
    operator: /\b(?:ALL|AND|ANY|BETWEEN|EXISTS|IN|LIKE|NOT|OR|IS|UNIQUE|CHARACTER SET|COLLATE|DIV|OFFSET|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b|[-+]{1}|!|[=<>]{1,2}|(&){1,2}|\|?\||\?|\*|\//gi,
    punctuation: /[;[\]()`,.]/g
}, Prism.languages.groovy = Prism.languages.extend("clike", {
    keyword: /\b(as|def|in|abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|trait|transient|try|void|volatile|while)\b/g,
    string: /("""|''')[\W\w]*?\1|("|'|\/)[\W\w]*?\2|(\$\/)(\$\/\$|[\W\w])*?\/\$/g,
    number: /\b0b[01_]+\b|\b0x[\da-f_]+(\.[\da-f_p\-]+)?\b|\b[\d_]+(\.[\d_]+[e]?[\d]*)?[glidf]\b|[\d_]+(\.[\d_]+)?\b/gi,
    operator: {
        pattern: /(^|[^.])(={0,2}~|\?\.|\*?\.@|\.&|\.{1,2}(?!\.)|\.{2}<?(?=\w)|->|\?:|[-+]{1,2}|!|<=>|>{1,3}|<{1,2}|={1,2}|&{1,2}|\|{1,2}|\?|\*{1,2}|\/|\^|%)/g,
        lookbehind: !0
    },
    punctuation: /\.+|[{}[\];(),:$]/g
}), Prism.languages.insertBefore("groovy", "punctuation", {
    "spock-block": /\b(setup|given|when|then|and|cleanup|expect|where):/g
}), Prism.languages.insertBefore("groovy", "function", {
    annotation: {
        pattern: /(^|[^.])@\w+/,
        lookbehind: !0
    }
}), Prism.hooks.add("wrap", function(a) {
    if ("groovy" === a.language && "string" === a.type) {
        var b = a.content[0];
        if ("'" != b) {
            var c = /([^\\])(\$(\{.*?\}|[\w\.]+))/;
            "$" === b && (c = /([^\$])(\$(\{.*?\}|[\w\.]+))/), a.content = Prism.highlight(a.content, {
                expression: {
                    pattern: c,
                    lookbehind: !0,
                    inside: Prism.languages.groovy
                }
            }), a.classes.push("/" === b ? "regex" : "gstring")
        }
    }
}), Prism.languages.http = {
    "request-line": {
        pattern: /^(POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\b\shttps?:\/\/\S+\sHTTP\/[0-9.]+/g,
        inside: {
            property: /^\b(POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\b/g,
            "attr-name": /:\w+/g
        }
    },
    "response-status": {
        pattern: /^HTTP\/1.[01] [0-9]+.*/g,
        inside: {
            property: /[0-9]+[A-Z\s-]+$/gi
        }
    },
    keyword: /^[\w-]+:(?=.+)/gm
};
var httpLanguages = {
    "application/json": Prism.languages.javascript,
    "application/xml": Prism.languages.markup,
    "text/xml": Prism.languages.markup,
    "text/html": Prism.languages.markup
};
for (var contentType in httpLanguages)
    if (httpLanguages[contentType]) {
        var options = {};
        options[contentType] = {
            pattern: new RegExp("(content-type:\\s*" + contentType + "[\\w\\W]*?)\\n\\n[\\w\\W]*", "gi"),
            lookbehind: !0,
            inside: {
                rest: httpLanguages[contentType]
            }
        }, Prism.languages.insertBefore("http", "keyword", options)
    }
Prism.languages.ruby = Prism.languages.extend("clike", {
        comment: /#[^\r\n]*(\r?\n|$)/g,
        keyword: /\b(alias|and|BEGIN|begin|break|case|class|def|define_method|defined|do|each|else|elsif|END|end|ensure|false|for|if|in|module|new|next|nil|not|or|raise|redo|require|rescue|retry|return|self|super|then|throw|true|undef|unless|until|when|while|yield)\b/g,
        builtin: /\b(Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Stat|File|Fixnum|Fload|Hash|Integer|IO|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|String|Struct|TMS|Symbol|ThreadGroup|Thread|Time|TrueClass)\b/,
        constant: /\b[A-Z][a-zA-Z_0-9]*[?!]?\b/g
    }), Prism.languages.insertBefore("ruby", "keyword", {
        regex: {
            pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
            lookbehind: !0
        },
        variable: /[@$]+\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g,
        symbol: /:\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g
    }), Prism.languages.rip = {
        comment: /#[^\r\n]*(\r?\n|$)/g,
        keyword: /(?:=>|->)|\b(?:class|if|else|switch|case|return|exit|try|catch|finally|raise)\b/g,
        builtin: /\b(@|System)\b/g,
        "boolean": /\b(true|false)\b/g,
        date: /\b\d{4}-\d{2}-\d{2}\b/g,
        time: /\b\d{2}:\d{2}:\d{2}\b/g,
        datetime: /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\b/g,
        number: /[+-]?(?:(?:\d+\.\d+)|(?:\d+))/g,
        character: /\B`[^\s\`\'",.:;#\/\\()<>\[\]{}]\b/g,
        regex: {
            pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/(?=\s*($|[\r\n,.;})]))/g,
            lookbehind: !0
        },
        symbol: /:[^\d\s\`\'",.:;#\/\\()<>\[\]{}][^\s\`\'",.:;#\/\\()<>\[\]{}]*/g,
        string: /("|')(\\?.)*?\1/g,
        punctuation: /(?:\.{2,3})|[\`,.:;=\/\\()<>\[\]{}]/,
        reference: /[^\d\s\`\'",.:;#\/\\()<>\[\]{}][^\s\`\'",.:;#\/\\()<>\[\]{}]*/g
    }, Prism.languages.gherkin = {
        comment: {
            pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|((#)|(\/\/)).*?(\r?\n|$))/g,
            lookbehind: !0
        },
        string: /("|')(\\?.)*?\1/g,
        atrule: /\b(And|Given|When|Then|In order to|As an|I want to|As a)\b/g,
        keyword: /\b(Scenario Outline|Scenario|Feature|Background|Story)\b/g
    }, Prism.languages.csharp = Prism.languages.extend("clike", {
        keyword: /\b(abstract|as|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while|add|alias|ascending|async|await|descending|dynamic|from|get|global|group|into|join|let|orderby|partial|remove|select|set|value|var|where|yield)\b/g,
        string: /@?("|')(\\?.)*?\1/g,
        preprocessor: /^\s*#.*/gm,
        number: /\b-?(0x)?\d*\.?\d+\b/g
    }), Prism.languages.go = Prism.languages.extend("clike", {
        keyword: /\b(break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go(to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/g,
        builtin: /\b(bool|byte|complex(64|128)|error|float(32|64)|rune|string|u?int(8|16|32|64|)|uintptr|append|cap|close|complex|copy|delete|imag|len|make|new|panic|print(ln)?|real|recover)\b/g,
        "boolean": /\b(_|iota|nil|true|false)\b/g,
        operator: /([(){}\[\]]|[*\/%^!]=?|\+[=+]?|-[>=-]?|\|[=|]?|>[=>]?|<(<|[=-])?|==?|&(&|=|^=?)?|\.(\.\.)?|[,;]|:=?)/g,
        number: /\b(-?(0x[a-f\d]+|(\d+\.?\d*|\.\d+)(e[-+]?\d+)?)i?)\b/gi,
        string: /("|'|`)(\\?.|\r|\n)*?\1/g
    }), delete Prism.languages.go["class-name"], Prism.languages.nsis = {
        comment: {
            pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|(^|[^:])(#|;).*?(\r?\n|$))/g,
            lookbehind: !0
        },
        string: /("|')(\\?.)*?\1/g,
        keyword: /\b(Abort|Add(BrandingImage|Size)|AdvSplash|Allow(RootDirInstall|SkipFiles)|AutoCloseWindow|Banner|BG(Font|Gradient|Image)|BrandingText|BringToFront|Call(\b|InstDLL)|Caption|ChangeUI|CheckBitmap|ClearErrors|CompletedText|ComponentText|CopyFiles|CRCCheck|Create(Directory|Font|ShortCut)|Delete(\b|INISec|INIStr|RegKey|RegValue)|Detail(Print|sButtonText)|Dialer|Dir(Text|Var|Verify)|EnableWindow|Enum(RegKey|RegValue)|Exch|Exec(\b|Shell|Wait)|ExpandEnvStrings|File(\b|BufSize|Close|ErrorText|Open|Read|ReadByte|ReadUTF16LE|ReadWord|WriteUTF16LE|Seek|Write|WriteByte|WriteWord)|Find(Close|First|Next|Window)|FlushINI|Get(CurInstType|CurrentAddress|DlgItem|DLLVersion|DLLVersionLocal|ErrorLevel|FileTime|FileTimeLocal|FullPathName|Function(\b|Address|End)|InstDirError|LabelAddress|TempFileName)|Goto|HideWindow|Icon|If(Abort|Errors|FileExists|RebootFlag|Silent)|InitPluginsDir|Install(ButtonText|Colors|Dir|DirRegKey)|InstProgressFlags|Inst(Type|TypeGetText|TypeSetText)|Int(Cmp|CmpU|Fmt|Op)|IsWindow|Lang(DLL|String)|License(BkColor|Data|ForceSelection|LangString|Text)|LoadLanguageFile|LockWindow|Log(Set|Text)|Manifest(DPIAware|SupportedOS)|Math|MessageBox|MiscButtonText|Name|Nop|ns(Dialogs|Exec)|NSISdl|OutFile|Page(\b|Callbacks)|Pop|Push|Quit|Read(EnvStr|INIStr|RegDWORD|RegStr)|Reboot|RegDLL|Rename|RequestExecutionLevel|ReserveFile|Return|RMDir|SearchPath|Section(\b|End|GetFlags|GetInstTypes|GetSize|GetText|Group|In|SetFlags|SetInstTypes|SetSize|SetText)|SendMessage|Set(AutoClose|BrandingImage|Compress|Compressor|CompressorDictSize|CtlColors|CurInstType|DatablockOptimize|DateSave|DetailsPrint|DetailsView|ErrorLevel|Errors|FileAttributes|Font|OutPath|Overwrite|PluginUnload|RebootFlag|RegView|ShellVarContext|Silent)|Show(InstDetails|UninstDetails|Window)|Silent(Install|UnInstall)|Sleep|SpaceTexts|Splash|StartMenu|Str(Cmp|CmpS|Cpy|Len)|SubCaption|System|Unicode|Uninstall(ButtonText|Caption|Icon|SubCaption|Text)|UninstPage|UnRegDLL|UserInfo|Var|VI(AddVersionKey|FileVersion|ProductVersion)|VPatch|WindowIcon|WriteINIStr|WriteRegBin|WriteRegDWORD|WriteRegExpandStr|Write(RegStr|Uninstaller)|XPStyle)\b/g,
        property: /\b(admin|all|auto|both|colored|false|force|hide|highest|lastused|leave|listonly|none|normal|notset|off|on|open|print|show|silent|silentlog|smooth|textonly|true|user|ARCHIVE|FILE_(ATTRIBUTE_ARCHIVE|ATTRIBUTE_NORMAL|ATTRIBUTE_OFFLINE|ATTRIBUTE_READONLY|ATTRIBUTE_SYSTEM|ATTRIBUTE_TEMPORARY)|HK(CR|CU|DD|LM|PD|U)|HKEY_(CLASSES_ROOT|CURRENT_CONFIG|CURRENT_USER|DYN_DATA|LOCAL_MACHINE|PERFORMANCE_DATA|USERS)|ID(ABORT|CANCEL|IGNORE|NO|OK|RETRY|YES)|MB_(ABORTRETRYIGNORE|DEFBUTTON1|DEFBUTTON2|DEFBUTTON3|DEFBUTTON4|ICONEXCLAMATION|ICONINFORMATION|ICONQUESTION|ICONSTOP|OK|OKCANCEL|RETRYCANCEL|RIGHT|RTLREADING|SETFOREGROUND|TOPMOST|USERICON|YESNO)|NORMAL|OFFLINE|READONLY|SHCTX|SHELL_CONTEXT|SYSTEM|TEMPORARY)\b/g,
        variable: /(\$(\(|\{)?[-_\w]+)(\)|\})?/i,
        number: /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,
        operator: /[-+]{1,2}|&lt;=?|>=?|={1,3}|(&amp;){1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,
        punctuation: /[{}[\];(),.:]/g,
        important: /\!(addincludedir|addplugindir|appendfile|cd|define|delfile|echo|else|endif|error|execute|finalize|getdllversionsystem|ifdef|ifmacrodef|ifmacrondef|ifndef|if|include|insertmacro|macroend|macro|makensis|packhdr|searchparse|searchreplace|tempfile|undef|verbose|warning)\b/gi
    }, Prism.languages.aspnet = Prism.languages.extend("markup", {
        "page-directive tag": {
            pattern: /<%\s*@.*%>/gi,
            inside: {
                "page-directive tag": /<%\s*@\s*(?:Assembly|Control|Implements|Import|Master|MasterType|OutputCache|Page|PreviousPageType|Reference|Register)?|%>/gi,
                rest: Prism.languages.markup.tag.inside
            }
        },
        "directive tag": {
            pattern: /<%.*%>/gi,
            inside: {
                "directive tag": /<%\s*?[$=%#:]{0,2}|%>/gi,
                rest: Prism.languages.csharp
            }
        }
    }), Prism.languages.insertBefore("inside", "punctuation", {
        "directive tag": Prism.languages.aspnet["directive tag"]
    }, Prism.languages.aspnet.tag.inside["attr-value"]), Prism.languages.insertBefore("aspnet", "comment", {
        "asp comment": /<%--[\w\W]*?--%>/g
    }), Prism.languages.insertBefore("aspnet", Prism.languages.javascript ? "script" : "tag", {
        "asp script": {
            pattern: /<script(?=.*runat=['"]?server['"]?)[\w\W]*?>[\w\W]*?<\/script>/gi,
            inside: {
                tag: {
                    pattern: /<\/?script\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|\w+))?\s*)*\/?>/gi,
                    inside: Prism.languages.aspnet.tag.inside
                },
                rest: Prism.languages.csharp || {}
            }
        }
    }), Prism.languages.aspnet.style && (Prism.languages.aspnet.style.inside.tag.pattern = /<\/?style\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|\w+))?\s*)*\/?>/gi, Prism.languages.aspnet.style.inside.tag.inside = Prism.languages.aspnet.tag.inside), Prism.languages.aspnet.script && (Prism.languages.aspnet.script.inside.tag.pattern = Prism.languages.aspnet["asp script"].inside.tag.pattern, Prism.languages.aspnet.script.inside.tag.inside = Prism.languages.aspnet.tag.inside), Prism.languages.scala = Prism.languages.extend("java", {
        keyword: /(<-|=>)|\b(abstract|case|catch|class|def|do|else|extends|final|finally|for|forSome|if|implicit|import|lazy|match|new|null|object|override|package|private|protected|return|sealed|self|super|this|throw|trait|try|type|val|var|while|with|yield)\b/g,
        builtin: /\b(String|Int|Long|Short|Byte|Boolean|Double|Float|Char|Any|AnyRef|AnyVal|Unit|Nothing)\b/g,
        number: /\b0x[\da-f]*\.?[\da-f\-]+\b|\b\d*\.?\d+[e]?[\d]*[dfl]?\b/gi,
        symbol: /'([^\d\s]\w*)/g,
        string: /(""")[\W\w]*?\1|("|\/)[\W\w]*?\2|('.')/g
    }), delete Prism.languages.scala["function"], Prism.languages.haskell = {
        comment: {
            pattern: /(^|[^-!#$%*+=\?&@|~.:<>^\\])(--[^-!#$%*+=\?&@|~.:<>^\\].*(\r?\n|$)|{-[\w\W]*?-})/gm,
            lookbehind: !0
        },
        "char": /'([^\\"]|\\([abfnrtv\\"'&]|\^[A-Z@[\]\^_]|NUL|SOH|STX|ETX|EOT|ENQ|ACK|BEL|BS|HT|LF|VT|FF|CR|SO|SI|DLE|DC1|DC2|DC3|DC4|NAK|SYN|ETB|CAN|EM|SUB|ESC|FS|GS|RS|US|SP|DEL|\d+|o[0-7]+|x[0-9a-fA-F]+))'/g,
        string: /"([^\\"]|\\([abfnrtv\\"'&]|\^[A-Z@[\]\^_]|NUL|SOH|STX|ETX|EOT|ENQ|ACK|BEL|BS|HT|LF|VT|FF|CR|SO|SI|DLE|DC1|DC2|DC3|DC4|NAK|SYN|ETB|CAN|EM|SUB|ESC|FS|GS|RS|US|SP|DEL|\d+|o[0-7]+|x[0-9a-fA-F]+)|\\\s+\\)*"/g,
        keyword: /\b(case|class|data|deriving|do|else|if|in|infixl|infixr|instance|let|module|newtype|of|primitive|then|type|where)\b/g,
        import_statement: {
            pattern: /(\n|^)\s*(import)\s+(qualified\s+)?(([A-Z][_a-zA-Z0-9']*)(\.[A-Z][_a-zA-Z0-9']*)*)(\s+(as)\s+(([A-Z][_a-zA-Z0-9']*)(\.[A-Z][_a-zA-Z0-9']*)*))?(\s+hiding\b)?/gm,
            inside: {
                keyword: /\b(import|qualified|as|hiding)\b/g
            }
        },
        builtin: /\b(abs|acos|acosh|all|and|any|appendFile|approxRational|asTypeOf|asin|asinh|atan|atan2|atanh|basicIORun|break|catch|ceiling|chr|compare|concat|concatMap|const|cos|cosh|curry|cycle|decodeFloat|denominator|digitToInt|div|divMod|drop|dropWhile|either|elem|encodeFloat|enumFrom|enumFromThen|enumFromThenTo|enumFromTo|error|even|exp|exponent|fail|filter|flip|floatDigits|floatRadix|floatRange|floor|fmap|foldl|foldl1|foldr|foldr1|fromDouble|fromEnum|fromInt|fromInteger|fromIntegral|fromRational|fst|gcd|getChar|getContents|getLine|group|head|id|inRange|index|init|intToDigit|interact|ioError|isAlpha|isAlphaNum|isAscii|isControl|isDenormalized|isDigit|isHexDigit|isIEEE|isInfinite|isLower|isNaN|isNegativeZero|isOctDigit|isPrint|isSpace|isUpper|iterate|last|lcm|length|lex|lexDigits|lexLitChar|lines|log|logBase|lookup|map|mapM|mapM_|max|maxBound|maximum|maybe|min|minBound|minimum|mod|negate|not|notElem|null|numerator|odd|or|ord|otherwise|pack|pi|pred|primExitWith|print|product|properFraction|putChar|putStr|putStrLn|quot|quotRem|range|rangeSize|read|readDec|readFile|readFloat|readHex|readIO|readInt|readList|readLitChar|readLn|readOct|readParen|readSigned|reads|readsPrec|realToFrac|recip|rem|repeat|replicate|return|reverse|round|scaleFloat|scanl|scanl1|scanr|scanr1|seq|sequence|sequence_|show|showChar|showInt|showList|showLitChar|showParen|showSigned|showString|shows|showsPrec|significand|signum|sin|sinh|snd|sort|span|splitAt|sqrt|subtract|succ|sum|tail|take|takeWhile|tan|tanh|threadToIOResult|toEnum|toInt|toInteger|toLower|toRational|toUpper|truncate|uncurry|undefined|unlines|until|unwords|unzip|unzip3|userError|words|writeFile|zip|zip3|zipWith|zipWith3)\b/g,
        number: /\b(\d+(\.\d+)?([eE][+-]?\d+)?|0[Oo][0-7]+|0[Xx][0-9a-fA-F]+)\b/g,
        operator: /\s\.\s|([-!#$%*+=\?&@|~:<>^\\]*\.[-!#$%*+=\?&@|~:<>^\\]+)|([-!#$%*+=\?&@|~:<>^\\]+\.[-!#$%*+=\?&@|~:<>^\\]*)|[-!#$%*+=\?&@|~:<>^\\]+|(`([A-Z][_a-zA-Z0-9']*\.)*[_a-z][_a-zA-Z0-9']*`)/g,
        hvariable: /\b([A-Z][_a-zA-Z0-9']*\.)*[_a-z][_a-zA-Z0-9']*\b/g,
        constant: /\b([A-Z][_a-zA-Z0-9']*\.)*[A-Z][_a-zA-Z0-9']*\b/g,
        punctuation: /[{}[\];(),.:]/g
    }, Prism.languages.swift = Prism.languages.extend("clike", {
        keyword: /\b(as|associativity|break|case|class|continue|convenience|default|deinit|didSet|do|dynamicType|else|enum|extension|fallthrough|final|for|func|get|if|import|in|infix|init|inout|internal|is|lazy|left|let|mutating|new|none|nonmutating|operator|optional|override|postfix|precedence|prefix|private|protocol|public|required|return|right|safe|self|Self|set|static|struct|subscript|super|switch|Type|typealias|unowned|unowned|unsafe|var|weak|where|while|willSet|__COLUMN__|__FILE__|__FUNCTION__|__LINE__)\b/g,
        number: /\b([\d_]+(\.[\de_]+)?|0x[a-f0-9_]+(\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/gi,
        constant: /\b(nil|[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/g,
        atrule: /\@\b(IBOutlet|IBDesignable|IBAction|IBInspectable|class_protocol|exported|noreturn|NSCopying|NSManaged|objc|UIApplicationMain|auto_closure)\b/g,
        builtin: /\b([A-Z]\S+|abs|advance|alignof|alignofValue|assert|contains|count|countElements|debugPrint|debugPrintln|distance|dropFirst|dropLast|dump|enumerate|equal|filter|find|first|getVaList|indices|isEmpty|join|last|lazy|lexicographicalCompare|map|max|maxElement|min|minElement|numericCast|overlaps|partition|prefix|print|println|reduce|reflect|reverse|sizeof|sizeofValue|sort|sorted|split|startsWith|stride|strideof|strideofValue|suffix|swap|toDebugString|toString|transcode|underestimateCount|unsafeBitCast|withExtendedLifetime|withUnsafeMutablePointer|withUnsafeMutablePointers|withUnsafePointer|withUnsafePointers|withVaList)\b/g
    }), Prism.languages.objectivec = Prism.languages.extend("c", {
        keyword: /(\b(asm|typeof|inline|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|in|self|super)\b)|((?=[\w|@])(@interface|@end|@implementation|@protocol|@class|@public|@protected|@private|@property|@try|@catch|@finally|@throw|@synthesize|@dynamic|@selector)\b)/g,
        string: /(?:("|')([^\n\\\1]|\\.|\\\r*\n)*?\1)|(@"([^\n\\"]|\\.|\\\r*\n)*?")/g,
        operator: /[-+]{1,2}|!=?|<{1,2}=?|>{1,2}=?|\->|={1,2}|\^|~|%|&{1,2}|\|?\||\?|\*|\/|@/g
    }), Prism.languages.autohotkey = {
        comment: {
            pattern: /(^[^";\n]*("[^"\n]*?"[^"\n]*?)*)(;.*$|^\s*\/\*[\s\S]*\n\*\/)/gm,
            lookbehind: !0
        },
        string: /"(([^"\n\r]|"")*)"/gm,
        "function": /[^\(\); \t\,\n\+\*\-\=\?>:\\\/<\&%\[\]]+?(?=\()/gm,
        tag: /^[ \t]*[^\s:]+?(?=:[^:])/gm,
        variable: /\%\w+\%/g,
        number: /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,
        operator: /[\+\-\*\\\/:=\?\&\|<>]/g,
        punctuation: /[\{}[\]\(\):]/g,
        "boolean": /\b(true|false)\b/g,
        selector: /\b(AutoTrim|BlockInput|Break|Click|ClipWait|Continue|Control|ControlClick|ControlFocus|ControlGet|ControlGetFocus|ControlGetPos|ControlGetText|ControlMove|ControlSend|ControlSendRaw|ControlSetText|CoordMode|Critical|DetectHiddenText|DetectHiddenWindows|Drive|DriveGet|DriveSpaceFree|EnvAdd|EnvDiv|EnvGet|EnvMult|EnvSet|EnvSub|EnvUpdate|Exit|ExitApp|FileAppend|FileCopy|FileCopyDir|FileCreateDir|FileCreateShortcut|FileDelete|FileEncoding|FileGetAttrib|FileGetShortcut|FileGetSize|FileGetTime|FileGetVersion|FileInstall|FileMove|FileMoveDir|FileRead|FileReadLine|FileRecycle|FileRecycleEmpty|FileRemoveDir|FileSelectFile|FileSelectFolder|FileSetAttrib|FileSetTime|FormatTime|GetKeyState|Gosub|Goto|GroupActivate|GroupAdd|GroupClose|GroupDeactivate|Gui|GuiControl|GuiControlGet|Hotkey|ImageSearch|IniDelete|IniRead|IniWrite|Input|InputBox|KeyWait|ListHotkeys|ListLines|ListVars|Loop|Menu|MouseClick|MouseClickDrag|MouseGetPos|MouseMove|MsgBox|OnExit|OutputDebug|Pause|PixelGetColor|PixelSearch|PostMessage|Process|Progress|Random|RegDelete|RegRead|RegWrite|Reload|Repeat|Return|Run|RunAs|RunWait|Send|SendEvent|SendInput|SendMessage|SendMode|SendPlay|SendRaw|SetBatchLines|SetCapslockState|SetControlDelay|SetDefaultMouseSpeed|SetEnv|SetFormat|SetKeyDelay|SetMouseDelay|SetNumlockState|SetScrollLockState|SetStoreCapslockMode|SetTimer|SetTitleMatchMode|SetWinDelay|SetWorkingDir|Shutdown|Sleep|Sort|SoundBeep|SoundGet|SoundGetWaveVolume|SoundPlay|SoundSet|SoundSetWaveVolume|SplashImage|SplashTextOff|SplashTextOn|SplitPath|StatusBarGetText|StatusBarWait|StringCaseSense|StringGetPos|StringLeft|StringLen|StringLower|StringMid|StringReplace|StringRight|StringSplit|StringTrimLeft|StringTrimRight|StringUpper|Suspend|SysGet|Thread|ToolTip|Transform|TrayTip|URLDownloadToFile|WinActivate|WinActivateBottom|WinClose|WinGet|WinGetActiveStats|WinGetActiveTitle|WinGetClass|WinGetPos|WinGetText|WinGetTitle|WinHide|WinKill|WinMaximize|WinMenuSelectItem|WinMinimize|WinMinimizeAll|WinMinimizeAllUndo|WinMove|WinRestore|WinSet|WinSetTitle|WinShow|WinWait|WinWaitActive|WinWaitClose|WinWaitNotActive)\b/i,
        constant: /\b(a_ahkpath|a_ahkversion|a_appdata|a_appdatacommon|a_autotrim|a_batchlines|a_caretx|a_carety|a_computername|a_controldelay|a_cursor|a_dd|a_ddd|a_dddd|a_defaultmousespeed|a_desktop|a_desktopcommon|a_detecthiddentext|a_detecthiddenwindows|a_endchar|a_eventinfo|a_exitreason|a_formatfloat|a_formatinteger|a_gui|a_guievent|a_guicontrol|a_guicontrolevent|a_guiheight|a_guiwidth|a_guix|a_guiy|a_hour|a_iconfile|a_iconhidden|a_iconnumber|a_icontip|a_index|a_ipaddress1|a_ipaddress2|a_ipaddress3|a_ipaddress4|a_isadmin|a_iscompiled|a_iscritical|a_ispaused|a_issuspended|a_isunicode|a_keydelay|a_language|a_lasterror|a_linefile|a_linenumber|a_loopfield|a_loopfileattrib|a_loopfiledir|a_loopfileext|a_loopfilefullpath|a_loopfilelongpath|a_loopfilename|a_loopfileshortname|a_loopfileshortpath|a_loopfilesize|a_loopfilesizekb|a_loopfilesizemb|a_loopfiletimeaccessed|a_loopfiletimecreated|a_loopfiletimemodified|a_loopreadline|a_loopregkey|a_loopregname|a_loopregsubkey|a_loopregtimemodified|a_loopregtype|a_mday|a_min|a_mm|a_mmm|a_mmmm|a_mon|a_mousedelay|a_msec|a_mydocuments|a_now|a_nowutc|a_numbatchlines|a_ostype|a_osversion|a_priorhotkey|programfiles|a_programfiles|a_programs|a_programscommon|a_screenheight|a_screenwidth|a_scriptdir|a_scriptfullpath|a_scriptname|a_sec|a_space|a_startmenu|a_startmenucommon|a_startup|a_startupcommon|a_stringcasesense|a_tab|a_temp|a_thisfunc|a_thishotkey|a_thislabel|a_thismenu|a_thismenuitem|a_thismenuitempos|a_tickcount|a_timeidle|a_timeidlephysical|a_timesincepriorhotkey|a_timesincethishotkey|a_titlematchmode|a_titlematchmodespeed|a_username|a_wday|a_windelay|a_windir|a_workingdir|a_yday|a_year|a_yweek|a_yyyy|clipboard|clipboardall|comspec|errorlevel)\b/i,
        builtin: /\b(abs|acos|asc|asin|atan|ceil|chr|class|cos|dllcall|exp|fileexist|Fileopen|floor|getkeystate|il_add|il_create|il_destroy|instr|substr|isfunc|islabel|IsObject|ln|log|lv_add|lv_delete|lv_deletecol|lv_getcount|lv_getnext|lv_gettext|lv_insert|lv_insertcol|lv_modify|lv_modifycol|lv_setimagelist|mod|onmessage|numget|numput|registercallback|regexmatch|regexreplace|round|sin|tan|sqrt|strlen|sb_seticon|sb_setparts|sb_settext|strsplit|tv_add|tv_delete|tv_getchild|tv_getcount|tv_getnext|tv_get|tv_getparent|tv_getprev|tv_getselection|tv_gettext|tv_modify|varsetcapacity|winactive|winexist|__New|__Call|__Get|__Set)\b/i,
        symbol: /\b(alt|altdown|altup|appskey|backspace|browser_back|browser_favorites|browser_forward|browser_home|browser_refresh|browser_search|browser_stop|bs|capslock|control|ctrl|ctrlbreak|ctrldown|ctrlup|del|delete|down|end|enter|esc|escape|f1|f10|f11|f12|f13|f14|f15|f16|f17|f18|f19|f2|f20|f21|f22|f23|f24|f3|f4|f5|f6|f7|f8|f9|home|ins|insert|joy1|joy10|joy11|joy12|joy13|joy14|joy15|joy16|joy17|joy18|joy19|joy2|joy20|joy21|joy22|joy23|joy24|joy25|joy26|joy27|joy28|joy29|joy3|joy30|joy31|joy32|joy4|joy5|joy6|joy7|joy8|joy9|joyaxes|joybuttons|joyinfo|joyname|joypov|joyr|joyu|joyv|joyx|joyy|joyz|lalt|launch_app1|launch_app2|launch_mail|launch_media|lbutton|lcontrol|lctrl|left|lshift|lwin|lwindown|lwinup|mbutton|media_next|media_play_pause|media_prev|media_stop|numlock|numpad0|numpad1|numpad2|numpad3|numpad4|numpad5|numpad6|numpad7|numpad8|numpad9|numpadadd|numpadclear|numpaddel|numpaddiv|numpaddot|numpaddown|numpadend|numpadenter|numpadhome|numpadins|numpadleft|numpadmult|numpadpgdn|numpadpgup|numpadright|numpadsub|numpadup|pause|pgdn|pgup|printscreen|ralt|rbutton|rcontrol|rctrl|right|rshift|rwin|rwindown|rwinup|scrolllock|shift|shiftdown|shiftup|space|tab|up|volume_down|volume_mute|volume_up|wheeldown|wheelleft|wheelright|wheelup|xbutton1|xbutton2)\b/i,
        important: /#\b(AllowSameLineComments|ClipboardTimeout|CommentFlag|ErrorStdOut|EscapeChar|HotkeyInterval|HotkeyModifierTimeout|Hotstring|IfWinActive|IfWinExist|IfWinNotActive|IfWinNotExist|Include|IncludeAgain|InstallKeybdHook|InstallMouseHook|KeyHistory|LTrim|MaxHotkeysPerInterval|MaxMem|MaxThreads|MaxThreadsBuffer|MaxThreadsPerHotkey|NoEnv|NoTrayIcon|Persistent|SingleInstance|UseHook|WinActivateForce)\b/i,
        keyword: /\b(Abort|AboveNormal|Add|ahk_class|ahk_group|ahk_id|ahk_pid|All|Alnum|Alpha|AltSubmit|AltTab|AltTabAndMenu|AltTabMenu|AltTabMenuDismiss|AlwaysOnTop|AutoSize|Background|BackgroundTrans|BelowNormal|between|BitAnd|BitNot|BitOr|BitShiftLeft|BitShiftRight|BitXOr|Bold|Border|Button|ByRef|Checkbox|Checked|CheckedGray|Choose|ChooseString|Click|Close|Color|ComboBox|Contains|ControlList|Count|Date|DateTime|Days|DDL|Default|Delete|DeleteAll|Delimiter|Deref|Destroy|Digit|Disable|Disabled|DropDownList|Edit|Eject|Else|Enable|Enabled|Error|Exist|Exp|Expand|ExStyle|FileSystem|First|Flash|Float|FloatFast|Focus|Font|for|global|Grid|Group|GroupBox|GuiClose|GuiContextMenu|GuiDropFiles|GuiEscape|GuiSize|Hdr|Hidden|Hide|High|HKCC|HKCR|HKCU|HKEY_CLASSES_ROOT|HKEY_CURRENT_CONFIG|HKEY_CURRENT_USER|HKEY_LOCAL_MACHINE|HKEY_USERS|HKLM|HKU|Hours|HScroll|Icon|IconSmall|ID|IDLast|If|IfEqual|IfExist|IfGreater|IfGreaterOrEqual|IfInString|IfLess|IfLessOrEqual|IfMsgBox|IfNotEqual|IfNotExist|IfNotInString|IfWinActive|IfWinExist|IfWinNotActive|IfWinNotExist|Ignore|ImageList|in|Integer|IntegerFast|Interrupt|is|italic|Join|Label|LastFound|LastFoundExist|Limit|Lines|List|ListBox|ListView|Ln|local|Lock|Logoff|Low|Lower|Lowercase|MainWindow|Margin|Maximize|MaximizeBox|MaxSize|Minimize|MinimizeBox|MinMax|MinSize|Minutes|MonthCal|Mouse|Move|Multi|NA|No|NoActivate|NoDefault|NoHide|NoIcon|NoMainWindow|norm|Normal|NoSort|NoSortHdr|NoStandard|Not|NoTab|NoTimers|Number|Off|Ok|On|OwnDialogs|Owner|Parse|Password|Picture|Pixel|Pos|Pow|Priority|ProcessName|Radio|Range|Read|ReadOnly|Realtime|Redraw|REG_BINARY|REG_DWORD|REG_EXPAND_SZ|REG_MULTI_SZ|REG_SZ|Region|Relative|Rename|Report|Resize|Restore|Retry|RGB|Right|Screen|Seconds|Section|Serial|SetLabel|ShiftAltTab|Show|Single|Slider|SortDesc|Standard|static|Status|StatusBar|StatusCD|strike|Style|Submit|SysMenu|Tab|Tab2|TabStop|Text|Theme|Tile|ToggleCheck|ToggleEnable|ToolWindow|Top|Topmost|TransColor|Transparent|Tray|TreeView|TryAgain|Type|UnCheck|underline|Unicode|Unlock|UpDown|Upper|Uppercase|UseErrorLevel|Vis|VisFirst|Visible|VScroll|Wait|WaitClose|WantCtrlA|WantF2|WantReturn|While|Wrap|Xdigit|xm|xp|xs|Yes|ym|yp|ys)\b/i
    }, Prism.languages.latex = {
        comment: /%.*?(\r?\n|$)$/m,
        string: /(\$)(\\?.)*?\1/g,
        punctuation: /[{}]/g,
        selector: /\\[a-z;,:\.]*/i
    }, Prism.languages.apacheconf = {
        comment: /\#.*/g,
        "directive-inline": {
            pattern: /^\s*\b(AcceptFilter|AcceptPathInfo|AccessFileName|Action|AddAlt|AddAltByEncoding|AddAltByType|AddCharset|AddDefaultCharset|AddDescription|AddEncoding|AddHandler|AddIcon|AddIconByEncoding|AddIconByType|AddInputFilter|AddLanguage|AddModuleInfo|AddOutputFilter|AddOutputFilterByType|AddType|Alias|AliasMatch|Allow|AllowCONNECT|AllowEncodedSlashes|AllowMethods|AllowOverride|AllowOverrideList|Anonymous|Anonymous_LogEmail|Anonymous_MustGiveEmail|Anonymous_NoUserID|Anonymous_VerifyEmail|AsyncRequestWorkerFactor|AuthBasicAuthoritative|AuthBasicFake|AuthBasicProvider|AuthBasicUseDigestAlgorithm|AuthDBDUserPWQuery|AuthDBDUserRealmQuery|AuthDBMGroupFile|AuthDBMType|AuthDBMUserFile|AuthDigestAlgorithm|AuthDigestDomain|AuthDigestNonceLifetime|AuthDigestProvider|AuthDigestQop|AuthDigestShmemSize|AuthFormAuthoritative|AuthFormBody|AuthFormDisableNoStore|AuthFormFakeBasicAuth|AuthFormLocation|AuthFormLoginRequiredLocation|AuthFormLoginSuccessLocation|AuthFormLogoutLocation|AuthFormMethod|AuthFormMimetype|AuthFormPassword|AuthFormProvider|AuthFormSitePassphrase|AuthFormSize|AuthFormUsername|AuthGroupFile|AuthLDAPAuthorizePrefix|AuthLDAPBindAuthoritative|AuthLDAPBindDN|AuthLDAPBindPassword|AuthLDAPCharsetConfig|AuthLDAPCompareAsUser|AuthLDAPCompareDNOnServer|AuthLDAPDereferenceAliases|AuthLDAPGroupAttribute|AuthLDAPGroupAttributeIsDN|AuthLDAPInitialBindAsUser|AuthLDAPInitialBindPattern|AuthLDAPMaxSubGroupDepth|AuthLDAPRemoteUserAttribute|AuthLDAPRemoteUserIsDN|AuthLDAPSearchAsUser|AuthLDAPSubGroupAttribute|AuthLDAPSubGroupClass|AuthLDAPUrl|AuthMerging|AuthName|AuthnCacheContext|AuthnCacheEnable|AuthnCacheProvideFor|AuthnCacheSOCache|AuthnCacheTimeout|AuthnzFcgiCheckAuthnProvider|AuthnzFcgiDefineProvider|AuthType|AuthUserFile|AuthzDBDLoginToReferer|AuthzDBDQuery|AuthzDBDRedirectQuery|AuthzDBMType|AuthzSendForbiddenOnFailure|BalancerGrowth|BalancerInherit|BalancerMember|BalancerPersist|BrowserMatch|BrowserMatchNoCase|BufferedLogs|BufferSize|CacheDefaultExpire|CacheDetailHeader|CacheDirLength|CacheDirLevels|CacheDisable|CacheEnable|CacheFile|CacheHeader|CacheIgnoreCacheControl|CacheIgnoreHeaders|CacheIgnoreNoLastMod|CacheIgnoreQueryString|CacheIgnoreURLSessionIdentifiers|CacheKeyBaseURL|CacheLastModifiedFactor|CacheLock|CacheLockMaxAge|CacheLockPath|CacheMaxExpire|CacheMaxFileSize|CacheMinExpire|CacheMinFileSize|CacheNegotiatedDocs|CacheQuickHandler|CacheReadSize|CacheReadTime|CacheRoot|CacheSocache|CacheSocacheMaxSize|CacheSocacheMaxTime|CacheSocacheMinTime|CacheSocacheReadSize|CacheSocacheReadTime|CacheStaleOnError|CacheStoreExpired|CacheStoreNoStore|CacheStorePrivate|CGIDScriptTimeout|CGIMapExtension|CharsetDefault|CharsetOptions|CharsetSourceEnc|CheckCaseOnly|CheckSpelling|ChrootDir|ContentDigest|CookieDomain|CookieExpires|CookieName|CookieStyle|CookieTracking|CoreDumpDirectory|CustomLog|Dav|DavDepthInfinity|DavGenericLockDB|DavLockDB|DavMinTimeout|DBDExptime|DBDInitSQL|DBDKeep|DBDMax|DBDMin|DBDParams|DBDPersist|DBDPrepareSQL|DBDriver|DefaultIcon|DefaultLanguage|DefaultRuntimeDir|DefaultType|Define|DeflateBufferSize|DeflateCompressionLevel|DeflateFilterNote|DeflateInflateLimitRequestBody|DeflateInflateRatioBurst|DeflateInflateRatioLimit|DeflateMemLevel|DeflateWindowSize|Deny|DirectoryCheckHandler|DirectoryIndex|DirectoryIndexRedirect|DirectorySlash|DocumentRoot|DTracePrivileges|DumpIOInput|DumpIOOutput|EnableExceptionHook|EnableMMAP|EnableSendfile|Error|ErrorDocument|ErrorLog|ErrorLogFormat|Example|ExpiresActive|ExpiresByType|ExpiresDefault|ExtendedStatus|ExtFilterDefine|ExtFilterOptions|FallbackResource|FileETag|FilterChain|FilterDeclare|FilterProtocol|FilterProvider|FilterTrace|ForceLanguagePriority|ForceType|ForensicLog|GprofDir|GracefulShutdownTimeout|Group|Header|HeaderName|HeartbeatAddress|HeartbeatListen|HeartbeatMaxServers|HeartbeatStorage|HeartbeatStorage|HostnameLookups|IdentityCheck|IdentityCheckTimeout|ImapBase|ImapDefault|ImapMenu|Include|IncludeOptional|IndexHeadInsert|IndexIgnore|IndexIgnoreReset|IndexOptions|IndexOrderDefault|IndexStyleSheet|InputSed|ISAPIAppendLogToErrors|ISAPIAppendLogToQuery|ISAPICacheFile|ISAPIFakeAsync|ISAPILogNotSupported|ISAPIReadAheadBuffer|KeepAlive|KeepAliveTimeout|KeptBodySize|LanguagePriority|LDAPCacheEntries|LDAPCacheTTL|LDAPConnectionPoolTTL|LDAPConnectionTimeout|LDAPLibraryDebug|LDAPOpCacheEntries|LDAPOpCacheTTL|LDAPReferralHopLimit|LDAPReferrals|LDAPRetries|LDAPRetryDelay|LDAPSharedCacheFile|LDAPSharedCacheSize|LDAPTimeout|LDAPTrustedClientCert|LDAPTrustedGlobalCert|LDAPTrustedMode|LDAPVerifyServerCert|LimitInternalRecursion|LimitRequestBody|LimitRequestFields|LimitRequestFieldSize|LimitRequestLine|LimitXMLRequestBody|Listen|ListenBackLog|LoadFile|LoadModule|LogFormat|LogLevel|LogMessage|LuaAuthzProvider|LuaCodeCache|LuaHookAccessChecker|LuaHookAuthChecker|LuaHookCheckUserID|LuaHookFixups|LuaHookInsertFilter|LuaHookLog|LuaHookMapToStorage|LuaHookTranslateName|LuaHookTypeChecker|LuaInherit|LuaInputFilter|LuaMapHandler|LuaOutputFilter|LuaPackageCPath|LuaPackagePath|LuaQuickHandler|LuaRoot|LuaScope|MaxConnectionsPerChild|MaxKeepAliveRequests|MaxMemFree|MaxRangeOverlaps|MaxRangeReversals|MaxRanges|MaxRequestWorkers|MaxSpareServers|MaxSpareThreads|MaxThreads|MergeTrailers|MetaDir|MetaFiles|MetaSuffix|MimeMagicFile|MinSpareServers|MinSpareThreads|MMapFile|ModemStandard|ModMimeUsePathInfo|MultiviewsMatch|Mutex|NameVirtualHost|NoProxy|NWSSLTrustedCerts|NWSSLUpgradeable|Options|Order|OutputSed|PassEnv|PidFile|PrivilegesMode|Protocol|ProtocolEcho|ProxyAddHeaders|ProxyBadHeader|ProxyBlock|ProxyDomain|ProxyErrorOverride|ProxyExpressDBMFile|ProxyExpressDBMType|ProxyExpressEnable|ProxyFtpDirCharset|ProxyFtpEscapeWildcards|ProxyFtpListOnWildcard|ProxyHTMLBufSize|ProxyHTMLCharsetOut|ProxyHTMLDocType|ProxyHTMLEnable|ProxyHTMLEvents|ProxyHTMLExtended|ProxyHTMLFixups|ProxyHTMLInterp|ProxyHTMLLinks|ProxyHTMLMeta|ProxyHTMLStripComments|ProxyHTMLURLMap|ProxyIOBufferSize|ProxyMaxForwards|ProxyPass|ProxyPassInherit|ProxyPassInterpolateEnv|ProxyPassMatch|ProxyPassReverse|ProxyPassReverseCookieDomain|ProxyPassReverseCookiePath|ProxyPreserveHost|ProxyReceiveBufferSize|ProxyRemote|ProxyRemoteMatch|ProxyRequests|ProxySCGIInternalRedirect|ProxySCGISendfile|ProxySet|ProxySourceAddress|ProxyStatus|ProxyTimeout|ProxyVia|ReadmeName|ReceiveBufferSize|Redirect|RedirectMatch|RedirectPermanent|RedirectTemp|ReflectorHeader|RemoteIPHeader|RemoteIPInternalProxy|RemoteIPInternalProxyList|RemoteIPProxiesHeader|RemoteIPTrustedProxy|RemoteIPTrustedProxyList|RemoveCharset|RemoveEncoding|RemoveHandler|RemoveInputFilter|RemoveLanguage|RemoveOutputFilter|RemoveType|RequestHeader|RequestReadTimeout|Require|RewriteBase|RewriteCond|RewriteEngine|RewriteMap|RewriteOptions|RewriteRule|RLimitCPU|RLimitMEM|RLimitNPROC|Satisfy|ScoreBoardFile|Script|ScriptAlias|ScriptAliasMatch|ScriptInterpreterSource|ScriptLog|ScriptLogBuffer|ScriptLogLength|ScriptSock|SecureListen|SeeRequestTail|SendBufferSize|ServerAdmin|ServerAlias|ServerLimit|ServerName|ServerPath|ServerRoot|ServerSignature|ServerTokens|Session|SessionCookieName|SessionCookieName2|SessionCookieRemove|SessionCryptoCipher|SessionCryptoDriver|SessionCryptoPassphrase|SessionCryptoPassphraseFile|SessionDBDCookieName|SessionDBDCookieName2|SessionDBDCookieRemove|SessionDBDDeleteLabel|SessionDBDInsertLabel|SessionDBDPerUser|SessionDBDSelectLabel|SessionDBDUpdateLabel|SessionEnv|SessionExclude|SessionHeader|SessionInclude|SessionMaxAge|SetEnv|SetEnvIf|SetEnvIfExpr|SetEnvIfNoCase|SetHandler|SetInputFilter|SetOutputFilter|SSIEndTag|SSIErrorMsg|SSIETag|SSILastModified|SSILegacyExprParser|SSIStartTag|SSITimeFormat|SSIUndefinedEcho|SSLCACertificateFile|SSLCACertificatePath|SSLCADNRequestFile|SSLCADNRequestPath|SSLCARevocationCheck|SSLCARevocationFile|SSLCARevocationPath|SSLCertificateChainFile|SSLCertificateFile|SSLCertificateKeyFile|SSLCipherSuite|SSLCompression|SSLCryptoDevice|SSLEngine|SSLFIPS|SSLHonorCipherOrder|SSLInsecureRenegotiation|SSLOCSPDefaultResponder|SSLOCSPEnable|SSLOCSPOverrideResponder|SSLOCSPResponderTimeout|SSLOCSPResponseMaxAge|SSLOCSPResponseTimeSkew|SSLOCSPUseRequestNonce|SSLOpenSSLConfCmd|SSLOptions|SSLPassPhraseDialog|SSLProtocol|SSLProxyCACertificateFile|SSLProxyCACertificatePath|SSLProxyCARevocationCheck|SSLProxyCARevocationFile|SSLProxyCARevocationPath|SSLProxyCheckPeerCN|SSLProxyCheckPeerExpire|SSLProxyCheckPeerName|SSLProxyCipherSuite|SSLProxyEngine|SSLProxyMachineCertificateChainFile|SSLProxyMachineCertificateFile|SSLProxyMachineCertificatePath|SSLProxyProtocol|SSLProxyVerify|SSLProxyVerifyDepth|SSLRandomSeed|SSLRenegBufferSize|SSLRequire|SSLRequireSSL|SSLSessionCache|SSLSessionCacheTimeout|SSLSessionTicketKeyFile|SSLSRPUnknownUserSeed|SSLSRPVerifierFile|SSLStaplingCache|SSLStaplingErrorCacheTimeout|SSLStaplingFakeTryLater|SSLStaplingForceURL|SSLStaplingResponderTimeout|SSLStaplingResponseMaxAge|SSLStaplingResponseTimeSkew|SSLStaplingReturnResponderErrors|SSLStaplingStandardCacheTimeout|SSLStrictSNIVHostCheck|SSLUserName|SSLUseStapling|SSLVerifyClient|SSLVerifyDepth|StartServers|StartThreads|Substitute|Suexec|SuexecUserGroup|ThreadLimit|ThreadsPerChild|ThreadStackSize|TimeOut|TraceEnable|TransferLog|TypesConfig|UnDefine|UndefMacro|UnsetEnv|Use|UseCanonicalName|UseCanonicalPhysicalPort|User|UserDir|VHostCGIMode|VHostCGIPrivs|VHostGroup|VHostPrivs|VHostSecure|VHostUser|VirtualDocumentRoot|VirtualDocumentRootIP|VirtualScriptAlias|VirtualScriptAliasIP|WatchdogInterval|XBitHack|xml2EncAlias|xml2EncDefault|xml2StartParse)\b/gim,
            alias: "property"
        },
        "directive-block": {
            pattern: /<\/?\b(AuthnProviderAlias|AuthzProviderAlias|Directory|DirectoryMatch|Else|ElseIf|Files|FilesMatch|If|IfDefine|IfModule|IfVersion|Limit|LimitExcept|Location|LocationMatch|Macro|Proxy|RequireAll|RequireAny|RequireNone|VirtualHost)\b *.*>/gi,
            inside: {
                "directive-block": {
                    pattern: /^<\/?\w+/,
                    inside: {
                        punctuation: /^<\/?/
                    },
                    alias: "tag"
                },
                "directive-block-parameter": {
                    pattern: /.*[^>]/,
                    inside: {
                        punctuation: /:/,
                        string: {
                            pattern: /("|').*\1/g,
                            inside: {
                                variable: /(\$|%)\{?(\w\.?(\+|\-|:)?)+\}?/g
                            }
                        }
                    },
                    alias: "attr-value"
                },
                punctuation: />/
            },
            alias: "tag"
        },
        "directive-flags": {
            pattern: /\[(\w,?)+\]/g,
            alias: "keyword"
        },
        string: {
            pattern: /("|').*\1/g,
            inside: {
                variable: /(\$|%)\{?(\w\.?(\+|\-|:)?)+\}?/g
            }
        },
        variable: /(\$|%)\{?(\w\.?(\+|\-|:)?)+\}?/g,
        regex: /\^?.*\$|\^.*\$?/g
    }, Prism.languages.git = {
        comment: /^#.*$/m,
        string: /("|')(\\?.)*?\1/gm,
        command: {
            pattern: /^.*\$ git .*$/m,
            inside: {
                parameter: /\s(--|-)\w+/m
            }
        },
        coord: /^@@.*@@$/m,
        deleted: /^-(?!-).+$/m,
        inserted: /^\+(?!\+).+$/m,
        commit_sha1: /^commit \w{40}$/m
    }, Prism.languages.scheme = {
        "boolean": /#(t|f){1}/,
        comment: /;.*/,
        keyword: {
            pattern: /([(])(define(-syntax|-library|-values)?|(case-)?lambda|let(-values|(rec)?(\*)?)?|else|if|cond|begin|delay|delay-force|parameterize|guard|set!|(quasi-)?quote|syntax-rules)/,
            lookbehind: !0
        },
        builtin: {
            pattern: /([(])(cons|car|cdr|null\?|pair\?|boolean\?|eof-object\?|char\?|procedure\?|number\?|port\?|string\?|vector\?|symbol\?|bytevector\?|list|call-with-current-continuation|call\/cc|append|abs|apply|eval)\b/,
            lookbehind: !0
        },
        string: /(["])(?:(?=(\\?))\2.)*?\1|'[^('|\s)]+/,
        number: /(\s|\))[-+]?[0-9]*\.?[0-9]+((\s*)[-+]{1}(\s*)[0-9]*\.?[0-9]+i)?/,
        operator: /(\*|\+|\-|\%|\/|<=|=>|>=|<|=|>)/,
        "function": {
            pattern: /([(])[^(\s|\))]*\s/,
            lookbehind: !0
        },
        punctuation: /[()]/
    }, Prism.languages.nasm = {
        comment: /;.*$/m,
        string: /("|'|`)(\\?.)*?\1/gm,
        label: {
            pattern: /^\s*[A-Za-z\._\?\$][\w\.\?\$@~#]*:/m,
            alias: "function"
        },
        keyword: [/\[?BITS (16|32|64)\]?/m, /^\s*section\s*[a-zA-Z\.]+:?/im, /(?:extern|global)[^;]*/im, /(?:CPU|FLOAT|DEFAULT).*$/m],
        register: {
            pattern: /\b(?:st\d|[xyz]mm\d\d?|[cdt]r\d|r\d\d?[bwd]?|[er]?[abcd]x|[abcd][hl]|[er]?(bp|sp|si|di)|[cdefgs]s)\b/gi,
            alias: "variable"
        },
        number: /(\b|-|(?=\$))(0[hHxX][\dA-Fa-f]*\.?[\dA-Fa-f]+([pP][+-]?\d+)?|\d[\dA-Fa-f]+[hHxX]|\$\d[\dA-Fa-f]*|0[oOqQ][0-7]+|[0-7]+[oOqQ]|0[bByY][01]+|[01]+[bByY]|0[dDtT]\d+|\d+[dDtT]?|\d*\.?\d+([Ee][+-]?\d+)?)\b/g,
        operator: /[\[\]\*+\-\/%<>=&|\$!]/gm
    }, Prism.hooks.add("after-highlight", function(a) {
        var b = a.element.parentNode;
        if (b && /pre/i.test(b.nodeName) && -1 !== b.className.indexOf("line-numbers")) {
            var c, d = 1 + a.code.split("\n").length;
            lines = new Array(d), lines = lines.join("<span></span>"), c = document.createElement("span"), c.className = "line-numbers-rows", c.innerHTML = lines, b.hasAttribute("data-start") && (b.style.counterReset = "linenumber " + (parseInt(b.getAttribute("data-start"), 10) - 1)), a.element.appendChild(c)
        }
    }), this.Template = this.Template || {}, this.Template.markdown = Handlebars.template(function(a, b, c, d, e) {
        function f(a, b) {
            var d, e = "";
            return e += '\n                <div class="dir__content">\n                    <span class="dir__title" title="' + m((d = null == b || b === !1 ? b : b.key, typeof d === l ? d.apply(a) : d)) + '">' + m((d = null == b || b === !1 ? b : b.key, typeof d === l ? d.apply(a) : d)) + '</span>\n                    <ul class="fix">\n        			', d = c.each.call(a, a, {
                hash: {},
                inverse: n.program(5, i, b),
                fn: n.program(2, g, b),
                data: b
            }), (d || 0 === d) && (e += d), e += "\n                    </ul>\n                </div>\n            "
        }

        function g(a, b) {
            var d, e, f = "";
            return f += '\n        				<li><a href="#" data-file="', (e = c.id) ? d = e.call(a, {
                hash: {},
                data: b
            }) : (e = a && a.id, d = typeof e === l ? e.call(a, {
                hash: {},
                data: b
            }) : e), f += m(d) + '" title="', (e = c.path) ? d = e.call(a, {
                hash: {},
                data: b
            }) : (e = a && a.path, d = typeof e === l ? e.call(a, {
                hash: {},
                data: b
            }) : e), f += m(d) + '" ', d = c["if"].call(a, a && a.selected, {
                hash: {},
                inverse: n.noop,
                fn: n.program(3, h, b),
                data: b
            }), (d || 0 === d) && (f += d), f += ">", (e = c.name) ? d = e.call(a, {
                hash: {},
                data: b
            }) : (e = a && a.name, d = typeof e === l ? e.call(a, {
                hash: {},
                data: b
            }) : e), f += m(d) + "</a></li>\n        			"
        }

        function h() {
            return ' class="active"'
        }

        function i() {
            return "\n        				<li><span>No files!</span></li>\n        			"
        }
        this.compilerInfo = [4, ">= 1.0.0"], c = this.merge(c, a.helpers), e = e || {};
        var j, k = "",
            l = "function",
            m = this.escapeExpression,
            n = this;
        return k += '<div id="nav" class="nav">\n	<button id="toggle-collapse"></button>    <div class="nav__scroll">\n		<div class="nav__inner">\n			<h4>Files</h4>\n            ', j = c.each.call(b, b && b.dirs, {
            hash: {},
            inverse: n.noop,
            fn: n.program(1, f, e),
            data: e
        }), (j || 0 === j) && (k += j), k += '\n			\n			<a class="author" href="http://www.mobily.pl" target="_blank">www.mobily.pl</a>\n		</div>\n	</div>\n</div>\n\n<section class="section__markdown">\n	<h4 class="markdown__heading">' + m((j = b && b.current, j = null == j || j === !1 ? j : j.path, typeof j === l ? j.apply(b) : j)) + '</h4>\n	<div class="markdown__body markdown-body">\n		', j = b && b.current, j = null == j || j === !1 ? j : j.content, j = typeof j === l ? j.apply(b) : j, (j || 0 === j) && (k += j), k += "\n	</div>\n</section>"
    }),
    function() {
        "use strict";
        var a = function() {
            return this instanceof a ? void this.initialize() : new a
        };
        a.prototype = function() {
            var b = io.connect(Db.socket || "http://localhost"),
                c = {},
                d = {},
                e = {};
            c.Files = Stapes.subclass({
                constructor: function() {
                    this.initialize(), this.events()
                },
                initialize: function() {
                    var a = this;
                    b.on("initialize", function(b) {
                        a.remove(), b[0].selected = !0, a.push(b)
                    })
                },
                events: function() {
                    var a = this;
                    b.on("data", function(b) {
                        var c = a.find(b);
                        a.update(c.id, function(a) {
                            return a.name = b.name, a.dir = b.dir, a.content = b.content, a.markdown = b.markdown, a
                        }), a.select(c)
                    }), b.on("rm", function(b) {
                        var c = a.find(b);
                        c && a.remove(c.id)
                    }), b.on("push", function(b) {
                        var c = a.find(b);
                        if (!c) {
                            var d = a.push(b),
                                c = a.find(d);
                            a.select(c)
                        }
                    })
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
                    a && this.update(a.id, function(a) {
                        return a.selected = null, a
                    }, !0)
                },
                select: function(a) {
                    this.unselect(), this.update(a.id, function(a) {
                        return a.selected = !0, a
                    })
                }
            }), d.Files = Stapes.subclass({
                constructor: function() {
                    this.model = {}, this.model.files = c.Files, this.element = {
                        markdown: document.getElementById("markdown")
                    }, this.view = new e.Files(this.element), this.events()
                },
                events: function() {
                    this.model.files.on({
                        change: function() {
                            this.render()
                        }
                    }, this), this.view.on({
                        switchFile: function(a) {
                            this.model.files.select(a)
                        }
                    }, this)
                },
                render: function() {
                    var a = this.model.files.groupBy(function(a) {
                            return a.dir
                        }),
                        b = this.model.files.getActive(),
                        c = Template.markdown({
                            dirs: a,
                            current: b
                        });
                    this.element.markdown.innerHTML = c, Prism.highlightAll()
                }
            }), e.Files = Stapes.subclass({
                constructor: function(a) {
                    this.element = a, this.events()
                },
                events: function() {
                    var a = this;
                    Gator(document).on("click", "[data-file]", function(b) {
                        b.preventDefault(), a.emit("switchFile", {
                            id: this.dataset.file
                        })
                    })

                    Gator(document).on("click", "#toggle-collapse", function(b) {
                        b.preventDefault();
                        document.getElementById('content').classList.toggle('collapsed')
                    })
                }
            });
            var f = {
                has: function(a, b) {
                    return null !== a && hasOwnProperty.call(a, b)
                },
                each: function(a, b) {
                    for (var c in a) b.call(null, c, a[c])
                }
            };
            return {
                constructor: a,
                initialize: function() {
                    this.models(), this.controllers()
                },
                models: function() {
                    f.each(c, function(a) {
                        c[a] = new c[a]
                    })
                },
                controllers: function() {
                    f.each(d, function(a) {
                        new d[a]
                    })
                }
            }
        }(), window.MarkdownLive = a
    }(), domready(function() {
        "use strict";
        new MarkdownLive
    });
