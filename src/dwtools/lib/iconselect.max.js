/*THIS IS THE NEW VERSION FOR IMGUR*/
/*!
 * jQuery UI Dialog 1.9.0
 * http://jqueryui.com
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/dialog/
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *  jquery.ui.button.js
 *	jquery.ui.draggable.js
 *	jquery.ui.mouse.js
 *	jquery.ui.position.js
 *	jquery.ui.resizable.js
 */
(function (d, e) {
    var b = "ui-dialog ui-widget ui-widget-content ui-corner-all ",
        a = {
            buttons: true,
            height: true,
            maxHeight: true,
            maxWidth: true,
            minHeight: true,
            minWidth: true,
            width: true
        },
        c = {
            maxHeight: true,
            maxWidth: true,
            minHeight: true,
            minWidth: true
        };
    d.widget("ui.dialog", {
        version: "1.9.0",
        options: {
            autoOpen: true,
            buttons: {},
            closeOnEscape: true,
            closeText: "close",
            dialogClass: "",
            draggable: true,
            hide: null,
            height: "auto",
            maxHeight: false,
            maxWidth: false,
            minHeight: 150,
            minWidth: 150,
            modal: false,
            position: {
                my: "center",
                at: "center",
                of: window,
                collision: "fit",
                using: function (g) {
                    var f = d(this).css(g).offset().top;
                    if (f < 0) {
                        d(this).css("top", g.top - f)
                    }
                }
            },
            resizable: true,
            show: null,
            stack: true,
            title: "",
            width: 300,
            zIndex: 1000
        },
        _create: function () {
            this.originalTitle = this.element.attr("title");
            if (typeof this.originalTitle !== "string") {
                this.originalTitle = ""
            }
            this.oldPosition = {
                parent: this.element.parent(),
                index: this.element.parent().children().index(this.element)
            };
            this.options.title = this.options.title || this.originalTitle;
            var m = this,
                p = this.options,
                n = p.title || "&#160;",
                o = (this.uiDialog = d("<div>")).addClass(b + p.dialogClass).css({
                    display: "none",
                    outline: 0,
                    zIndex: p.zIndex
                }).attr("tabIndex", -1).keydown(function (q) {
                        if (p.closeOnEscape && !q.isDefaultPrevented() && q.keyCode && q.keyCode === d.ui.keyCode.ESCAPE) {
                            m.close(q);
                            q.preventDefault()
                        }
                    }).mousedown(function (q) {
                        m.moveToTop(false, q)
                    }).appendTo("body"),
                i = this.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(o),
                h = (this.uiDialogTitlebar = d("<div>")).addClass("ui-dialog-titlebar  ui-widget-header  ui-corner-all  ui-helper-clearfix").prependTo(o),
                l = d("<a href='#'></a>").addClass("ui-dialog-titlebar-close  ui-corner-all").attr("role", "button").click(function (q) {
                    q.preventDefault();
                    m.close(q)
                }).appendTo(h),
                j = (this.uiDialogTitlebarCloseText = d("<span>")).addClass("ui-icon ui-icon-closethick").text(p.closeText).appendTo(l),
                g = d("<span>").uniqueId().addClass("ui-dialog-title").html(n).prependTo(h),
                k = (this.uiDialogButtonPane = d("<div>")).addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix"),
                f = (this.uiButtonSet = d("<div>")).addClass("ui-dialog-buttonset").appendTo(k);
            o.attr({
                role: "dialog",
                "aria-labelledby": g.attr("id")
            });
            h.find("*").add(h).disableSelection();
            this._hoverable(l);
            this._focusable(l);
            if (p.draggable && d.fn.draggable) {
                this._makeDraggable()
            }
            if (p.resizable && d.fn.resizable) {
                this._makeResizable()
            }
            this._createButtons(p.buttons);
            this._isOpen = false;
            if (d.fn.bgiframe) {
                o.bgiframe()
            }
            this._on(o, {
                keydown: function (s) {
                    if (!p.modal || s.keyCode !== d.ui.keyCode.TAB) {
                        return
                    }
                    var r = d(":tabbable", o),
                        t = r.filter(":first"),
                        q = r.filter(":last");
                    if (s.target === q[0] && !s.shiftKey) {
                        t.focus(1);
                        return false
                    } else {
                        if (s.target === t[0] && s.shiftKey) {
                            q.focus(1);
                            return false
                        }
                    }
                }
            })
        },
        _init: function () {
            if (this.options.autoOpen) {
                this.open()
            }
        },
        _destroy: function () {
            var g, f = this.oldPosition;
            if (this.overlay) {
                this.overlay.destroy()
            }
            this.uiDialog.hide();
            this.element.removeClass("ui-dialog-content ui-widget-content").hide().appendTo("body");
            this.uiDialog.remove();
            if (this.originalTitle) {
                this.element.attr("title", this.originalTitle)
            }
            g = f.parent.children().eq(f.index);
            if (g.length && g[0] !== this.element[0]) {
                g.before(this.element)
            } else {
                f.parent.append(this.element)
            }
        },
        widget: function () {
            return this.uiDialog
        },
        close: function (i) {
            var h = this,
                g, f;
            if (!this._isOpen) {
                return
            }
            if (false === this._trigger("beforeClose", i)) {
                return
            }
            this._isOpen = false;
            if (this.overlay) {
                this.overlay.destroy()
            }
            if (this.options.hide) {
                this.uiDialog.hide(this.options.hide, function () {
                    h._trigger("close", i)
                })
            } else {
                this.uiDialog.hide();
                this._trigger("close", i)
            }
            d.ui.dialog.overlay.resize();
            if (this.options.modal) {
                g = 0;
                d(".ui-dialog").each(function () {
                    if (this !== h.uiDialog[0]) {
                        f = d(this).css("z-index");
                        if (!isNaN(f)) {
                            g = Math.max(g, f)
                        }
                    }
                });
                d.ui.dialog.maxZ = g
            }
            return this
        },
        isOpen: function () {
            return this._isOpen
        },
        moveToTop: function (i, h) {
            var g = this.options,
                f;
            if ((g.modal && !i) || (!g.stack && !g.modal)) {
                return this._trigger("focus", h)
            }
            if (g.zIndex > d.ui.dialog.maxZ) {
                d.ui.dialog.maxZ = g.zIndex
            }
            if (this.overlay) {
                d.ui.dialog.maxZ += 1;
                d.ui.dialog.overlay.maxZ = d.ui.dialog.maxZ;
                this.overlay.$el.css("z-index", d.ui.dialog.overlay.maxZ)
            }
            f = {
                scrollTop: this.element.scrollTop(),
                scrollLeft: this.element.scrollLeft()
            };
            d.ui.dialog.maxZ += 1;
            this.uiDialog.css("z-index", d.ui.dialog.maxZ);
            this.element.attr(f);
            this._trigger("focus", h);
            return this
        },
        open: function () {
            if (this._isOpen) {
                return
            }
            var h, g = this.options,
                f = this.uiDialog;
            this._size();
            this._position(g.position);
            f.show(g.show);
            this.overlay = g.modal ? new d.ui.dialog.overlay(this) : null;
            this.moveToTop(true);
            h = this.element.find(":tabbable");
            if (!h.length) {
                h = this.uiDialogButtonPane.find(":tabbable");
                if (!h.length) {
                    h = f
                }
            }
            h.eq(0).focus();
            this._isOpen = true;
            this._trigger("open");
            return this
        },
        _createButtons: function (i) {
            var g, j, h = this,
                f = false;
            this.uiDialogButtonPane.remove();
            this.uiButtonSet.empty();
            if (typeof i === "object" && i !== null) {
                d.each(i, function () {
                    return !(f = true)
                })
            }
            if (f) {
                d.each(i, function (k, m) {
                    m = d.isFunction(m) ? {
                        click: m,
                        text: k
                    } : m;
                    var l = d("<button type='button'>").attr(m, true).unbind("click").click(function () {
                        m.click.apply(h.element[0], arguments)
                    }).appendTo(h.uiButtonSet);
                    if (d.fn.button) {
                        l.button()
                    }
                });
                this.uiDialog.addClass("ui-dialog-buttons");
                this.uiDialogButtonPane.appendTo(this.uiDialog)
            } else {
                this.uiDialog.removeClass("ui-dialog-buttons")
            }
        },
        _makeDraggable: function () {
            var h = this,
                g = this.options;

            function f(i) {
                return {
                    position: i.position,
                    offset: i.offset
                }
            }

            this.uiDialog.draggable({
                cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
                handle: ".ui-dialog-titlebar",
                containment: "document",
                start: function (i, j) {
                    d(this).addClass("ui-dialog-dragging");
                    h._trigger("dragStart", i, f(j))
                },
                drag: function (i, j) {
                    h._trigger("drag", i, f(j))
                },
                stop: function (i, j) {
                    g.position = [j.position.left - h.document.scrollLeft(), j.position.top - h.document.scrollTop()];
                    d(this).removeClass("ui-dialog-dragging");
                    h._trigger("dragStop", i, f(j));
                    d.ui.dialog.overlay.resize()
                }
            })
        },
        _makeResizable: function (j) {
            j = (j === e ? this.options.resizable : j);
            var k = this,
                i = this.options,
                f = this.uiDialog.css("position"),
                h = typeof j === "string" ? j : "n,e,s,w,se,sw,ne,nw";

            function g(l) {
                return {
                    originalPosition: l.originalPosition,
                    originalSize: l.originalSize,
                    position: l.position,
                    size: l.size
                }
            }

            this.uiDialog.resizable({
                cancel: ".ui-dialog-content",
                containment: "document",
                alsoResize: this.element,
                maxWidth: i.maxWidth,
                maxHeight: i.maxHeight,
                minWidth: i.minWidth,
                minHeight: this._minHeight(),
                handles: h,
                start: function (l, m) {
                    d(this).addClass("ui-dialog-resizing");
                    k._trigger("resizeStart", l, g(m))
                },
                resize: function (l, m) {
                    k._trigger("resize", l, g(m))
                },
                stop: function (l, m) {
                    d(this).removeClass("ui-dialog-resizing");
                    i.height = d(this).height();
                    i.width = d(this).width();
                    k._trigger("resizeStop", l, g(m));
                    d.ui.dialog.overlay.resize()
                }
            }).css("position", f).find(".ui-resizable-se").addClass("ui-icon ui-icon-grip-diagonal-se")
        },
        _minHeight: function () {
            var f = this.options;
            if (f.height === "auto") {
                return f.minHeight
            } else {
                return Math.min(f.minHeight, f.height)
            }
        },
        _position: function (g) {
            var h = [],
                i = [0, 0],
                f;
            if (g) {
                if (typeof g === "string" || (typeof g === "object" && "0" in g)) {
                    h = g.split ? g.split(" ") : [g[0], g[1]];
                    if (h.length === 1) {
                        h[1] = h[0]
                    }
                    d.each(["left", "top"], function (k, j) {
                        if (+h[k] === h[k]) {
                            i[k] = h[k];
                            h[k] = j
                        }
                    });
                    g = {
                        my: h.join(" "),
                        at: h.join(" "),
                        offset: i.join(" ")
                    }
                }
                g = d.extend({}, d.ui.dialog.prototype.options.position, g)
            } else {
                g = d.ui.dialog.prototype.options.position
            }
            f = this.uiDialog.is(":visible");
            if (!f) {
                this.uiDialog.show()
            }
            this.uiDialog.position(g);
            if (!f) {
                this.uiDialog.hide()
            }
        },
        _setOptions: function (h) {
            var i = this,
                f = {},
                g = false;
            d.each(h, function (j, k) {
                i._setOption(j, k);
                if (j in a) {
                    g = true
                }
                if (j in c) {
                    f[j] = k
                }
            });
            if (g) {
                this._size()
            }
            if (this.uiDialog.is(":data(resizable)")) {
                this.uiDialog.resizable("option", f)
            }
        },
        _setOption: function (h, i) {
            var g, j, f = this.uiDialog;
            switch (h) {
                case "buttons":
                    this._createButtons(i);
                    break;
                case "closeText":
                    this.uiDialogTitlebarCloseText.text("" + i);
                    break;
                case "dialogClass":
                    f.removeClass(this.options.dialogClass).addClass(b + i);
                    break;
                case "disabled":
                    if (i) {
                        f.addClass("ui-dialog-disabled")
                    } else {
                        f.removeClass("ui-dialog-disabled")
                    }
                    break;
                case "draggable":
                    g = f.is(":data(draggable)");
                    if (g && !i) {
                        f.draggable("destroy")
                    }
                    if (!g && i) {
                        this._makeDraggable()
                    }
                    break;
                case "position":
                    this._position(i);
                    break;
                case "resizable":
                    j = f.is(":data(resizable)");
                    if (j && !i) {
                        f.resizable("destroy")
                    }
                    if (j && typeof i === "string") {
                        f.resizable("option", "handles", i)
                    }
                    if (!j && i !== false) {
                        this._makeResizable(i)
                    }
                    break;
                case "title":
                    d(".ui-dialog-title", this.uiDialogTitlebar).html("" + (i || "&#160;"));
                    break
            }
            this._super(h, i)
        },
        _size: function () {
            var g, j, i, h = this.options,
                f = this.uiDialog.is(":visible");
            this.element.show().css({
                width: "auto",
                minHeight: 0,
                height: 0
            });
            if (h.minWidth > h.width) {
                h.width = h.minWidth
            }
            g = this.uiDialog.css({
                height: "auto",
                width: h.width
            }).outerHeight();
            j = Math.max(0, h.minHeight - g);
            if (h.height === "auto") {
                if (d.support.minHeight) {
                    this.element.css({
                        minHeight: j,
                        height: "auto"
                    })
                } else {
                    this.uiDialog.show();
                    i = this.element.css("height", "auto").height();
                    if (!f) {
                        this.uiDialog.hide()
                    }
                    this.element.height(Math.max(i, j))
                }
            } else {
                this.element.height(Math.max(h.height - g, 0))
            }
            if (this.uiDialog.is(":data(resizable)")) {
                this.uiDialog.resizable("option", "minHeight", this._minHeight())
            }
        }
    });
    d.extend(d.ui.dialog, {
        uuid: 0,
        maxZ: 0,
        getTitleId: function (f) {
            var g = f.attr("id");
            if (!g) {
                this.uuid += 1;
                g = this.uuid
            }
            return "ui-dialog-title-" + g
        },
        overlay: function (f) {
            this.$el = d.ui.dialog.overlay.create(f)
        }
    });
    d.extend(d.ui.dialog.overlay, {
        instances: [],
        oldInstances: [],
        maxZ: 0,
        events: d.map("focus,mousedown,mouseup,keydown,keypress,click".split(","),function (f) {
            return f + ".dialog-overlay"
        }).join(" "),
        create: function (g) {
            if (this.instances.length === 0) {
                setTimeout(function () {
                    if (d.ui.dialog.overlay.instances.length) {
                        d(document).bind(d.ui.dialog.overlay.events, function (h) {
                            if (d(h.target).zIndex() < d.ui.dialog.overlay.maxZ) {
                                return false
                            }
                        })
                    }
                }, 1);
                d(window).bind("resize.dialog-overlay", d.ui.dialog.overlay.resize)
            }
            var f = (this.oldInstances.pop() || d("<div>").addClass("ui-widget-overlay"));
            d(document).bind("keydown.dialog-overlay", function (h) {
                var i = d.ui.dialog.overlay.instances;
                if (i.length !== 0 && i[i.length - 1] === f && g.options.closeOnEscape && !h.isDefaultPrevented() && h.keyCode && h.keyCode === d.ui.keyCode.ESCAPE) {
                    g.close(h);
                    h.preventDefault()
                }
            });
            f.appendTo(document.body).css({
                width: this.width(),
                height: this.height()
            });
            if (d.fn.bgiframe) {
                f.bgiframe()
            }
            this.instances.push(f);
            return f
        },
        destroy: function (f) {
            var g = d.inArray(f, this.instances),
                h = 0;
            if (g !== -1) {
                this.oldInstances.push(this.instances.splice(g, 1)[0])
            }
            if (this.instances.length === 0) {
                d([document, window]).unbind(".dialog-overlay")
            }
            f.height(0).width(0).remove();
            d.each(this.instances, function () {
                h = Math.max(h, this.css("z-index"))
            });
            this.maxZ = h
        },
        height: function () {
            var g, f;
            if (d.browser.msie) {
                g = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
                f = Math.max(document.documentElement.offsetHeight, document.body.offsetHeight);
                if (g < f) {
                    return d(window).height() + "px"
                } else {
                    return g + "px"
                }
            } else {
                return d(document).height() + "px"
            }
        },
        width: function () {
            var f, g;
            if (d.browser.msie) {
                f = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
                g = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);
                if (f < g) {
                    return d(window).width() + "px"
                } else {
                    return f + "px"
                }
            } else {
                return d(document).width() + "px"
            }
        },
        resize: function () {
            var f = d([]);
            d.each(d.ui.dialog.overlay.instances, function () {
                f = f.add(this)
            });
            f.css({
                width: 0,
                height: 0
            }).css({
                    width: d.ui.dialog.overlay.width(),
                    height: d.ui.dialog.overlay.height()
                })
        }
    });
    d.extend(d.ui.dialog.overlay.prototype, {
        destroy: function () {
            d.ui.dialog.overlay.destroy(this.$el)
        }
    })
}(jQuery));

(function (jQuery) {
    var m = {};
    var a;
    jQuery.fn.iconselector_imgur = function (n) {
        a = jQuery.extend({}, jQuery.fn.iconselector_imgur.defaults, n);
        jQuery.fn.iconselector_imgur.owner = jQuery(this);
        if (a.selectorButtons) {
            jQuery(a.selectorButtons).click(function (o) {
                b.apply(jQuery.fn.iconselector_imgur.owner, [a]);
                o.preventDefault()
            })
        }
        return jQuery(this).wrap("<span class='iconselect_trigger_wrapper'></span>")
    };
    jQuery.fn.iconselector_imgur.selected = null;
    jQuery.fn.iconselector_imgur.link = null;
    jQuery.fn.iconselector_imgur.selectedKeyword = null;
    jQuery.fn.iconselector_imgur.defaults = {
        title: "Choose Icon",
        width: "70%",
        height: jQuery(window).height() * 0.8,
        selectedClass: "iconselector_imgur_selected",
        onSelect: function () {
        },
        selectorButtons: null,
        metatext: true,
        smallicons: false
    };

    function c() {
        return "<div>      <div class='iconselector_imgur_top'>        <span class='iconselector_searchbox'>          Search: <input type='search' id='iconselector_imgur_search'>        </span>            <div class='kwmenu'>          <label for='iconselector_kwmenu'>Keywords of selected icon:</label>          <div class='keywords'></div>          <input id='iconselector_imgur_select' disabled='disabled' type='button' value='Select'>        </div>      </div>      <div id='iconselector_imgur_icons'><span class='iconselector_imgur_status'>Loading...</span></div>    </div>"
    }

    function Highlight(q, o, p) {
        jQuery("#" + jQuery.fn.iconselector_imgur.selected).removeClass(a.selectedClass);
        if (q.length == 0) {
            return
        }
        jQuery.fn.iconselector_imgur.selected = q.attr("id");
        jQuery.fn.iconselector_imgur.link = q.data("link");
        q.addClass(a.selectedClass);
        q.show();
        if (o != null) {
            jQuery.fn.iconselector_imgur.selectedKeyword = o
        } else {
            jQuery.fn.iconselector_imgur.selectedKeyword = q.data("defaultkw")
        }
        if (p) {
            var n = q.find(".keywords");
            jQuery(".iconselector_imgur_top .keywords", jQuery.fn.iconselector_imgur.instance).replaceWith(n.clone());
            if (n.length > 0) {
                jQuery("#iconselector_imgur_select").prop("disabled", false)
            } else {
                jQuery("#iconselector_imgur_select").prop("disabled", true)
            }
        } else {
            jQuery(".iconselector_imgur_top .selected", jQuery.fn.iconselector_imgur.instance).removeClass("selected")
        }
        jQuery(".iconselector_imgur_top .keywords", jQuery.fn.iconselector_imgur.instance).find("a.keyword").filter(function () {
            return jQuery(this).text() == jQuery.fn.iconselector_imgur.selectedKeyword
        }).addClass("selected")
    }

    function g(n) {
        var o = m[n];
        if (o) {
            Highlight(jQuery("#" + o), n, true)
        }
    }

    function k(o) {
        var q = jQuery(o.target).closest("a.keyword");
        if (q.length > 0) {
            var n = q.text();
            var p = m[n];
            if (p) {
                Highlight(jQuery("#" + p), n, false)
            }
        }
        o.stopPropagation();
        o.preventDefault()
    }

    function doubleClickHandler(o) {
        var n = jQuery(o.target).closest("li");
        var p = jQuery(o.target).closest("a.keyword");
        Highlight(n, p.length > 0 ? p.text() : null, true);
        o.stopPropagation();
        o.preventDefault()
    }

    function i(n) {
        if (n.keyCode && n.keyCode === jQuery.ui.keyCode.ENTER) {
            var o = jQuery(n.originalTarget);
            if (o.hasClass("keyword")) {
                o.click()
            } else {
                if (o.is("a")) {
                    return
                }
            }
            selectIcon()
        }
    }

    function selectIcon() {
        if (jQuery.fn.iconselector_imgur.selectedKeyword) {
            var a = jQuery.fn.iconselector_imgur.link;
            jQuery("#body, #commenttext, textarea.textbox").val(
                function (i, val) {
                    if(!val || val == ''){
                        val = '[PUT_YOUR_TAG_HERE]';
                    }

                    return '<table data-dwtimg> <tr> <td style="vertical-align:top;padding:0;"> <table data-dwtimgsrc height="100" width="100" background="'+a+'"> <tr> <td></td> </tr> </table> </td> <td style="vertical-align:bottom">' + val + '</td> </tr> </table>';
                    //return '<img data-dwtimg src="' + a + '" style=""> ' + val;
                });
            jQuery.fn.iconselector_imgur.instance.dialog("close")
        }
    }

    function h(o) {
        var p = jQuery("#iconselector_search").val().toLocaleUpperCase();
        jQuery("#iconselector_icons_list li").hide().each(function (q, r) {
            if (jQuery(this).data("keywords").indexOf(p) != -1 || jQuery(this).data("comment").indexOf(p) != -1 || jQuery(this).data("alt").indexOf(p) != -1) {
                jQuery(this).show()
            }
        });
        var n = jQuery("#iconselector_icons_list li:visible");
        if (n.length == 1) {
            Highlight(n, null, true)
        }
    }

    function f(n, o) {
        var p = {};
        p[n] = o;
        jQuery.post("/__rpc_iconbrowser_save", p)
    }

    function b() {
        if (!jQuery.fn.iconselector_imgur.instance) {
            jQuery.fn.iconselector_imgur.instance = jQuery(c());
            jQuery.fn.iconselector_imgur.instance.dialog({
                title: a.title,
                width: a.width,
                height: a.height,
                dialogClass: "iconselector_imgur",
                modal: true,
                close: function () {
                    jQuery("#iconselect").focus()
                },
                resize: function () {
                    jQuery("#iconselector_imgur_icons").height(jQuery.fn.iconselector_imgur.instance.height() - jQuery.fn.iconselector_imgur.instance.find(".iconselector_imgur_top").height() - 5)
                }
            }).keydown(i);
//
            jQuery("#iconselector_imgur_icons").height(jQuery.fn.iconselector_imgur.instance.height() - jQuery.fn.iconselector_imgur.instance.find(".iconselector_imgur_top").height() - 5);
            jQuery("button", jQuery.fn.iconselector_imgur.instance.siblings()).prop("disabled", true);
            jQuery(":input", jQuery.fn.iconselector_imgur.instance).prop("disabled", true);
            jQuery("#iconselector_imgur_search", jQuery.fn.iconselector_imgur.instance).bind("keyup click", h);


            function getDT(fn) {
                var defaultDT = {
                    LAT: "<small>[ ",
                    RAT: " ]</small>",
                    TEXT: "font-family:courier new",
                    AUTOSCROLL: true,
                    IMGUR: [],
                    EXPERIMENTAL: true,
                    BLACKLIST: [],
                    BLACKLISTMSG: true,
                    BLACKLISTDOMAIN: [],
                    BLACKLISTJOURNALS:[],
                    BLACKLISTJOURNALDOMAINS:[],
                    BLACKLISTJOURNALMSG: true
                };
                try {
                    chrome.storage.sync.get("savedDT", function (res) {
                        if (res != undefined && res.savedDT != undefined) {
                            fn($.extend(defaultDT, JSON.parse(res.savedDT)));
                        }
                        else {
                            fn($.extend({}, defaultDT))
                        }
                    });
                }
                catch (e) {
                    console.log(e);
                    fn($.extend({}, defaultDT));
                }
            }

            getDT(function (dt) {
                DT = dt;
                var imgurAlbum = "https://api.imgur.com/3/album/";
                //go through the imgur object to find the logged in account
                var journal = "";


                if ($("#remote").length > 0) {
                    journal = $("#remote").val();
                }
                else if (!(typeof LJ_cmtinfo === "undefined")) {
                    if (!(typeof LJ_cmtinfo.remote === "undefined")) {
                        journal = LJ_cmtinfo.remote;
                    }
                }
                else if (!(typeof remote === "undefined")) {
                    journal = remote;
                }
                else if ($("input[name=user]").length > 0) {
                    journal = $("input[name=user]").val();
                }

                var albumID = "";
                for (var x in DT["IMGUR"]) {
                    if (DT["IMGUR"][x][0] == journal) {
                        albumID = DT["IMGUR"][x][1];
                        break;
                    }
                }

                if (albumID == "") {
                    jQuery("#iconselector_imgur_icons").html("<h2>Error</h2><p>Unable to load Imgur Album data. Did you put in the right ID? Is the album public?</p>");
                }
                else {
                    imgurAlbum += albumID;
                    jQuery.ajax({
                        beforeSend: function (request) {
                            request.setRequestHeader("Authorization", "Client-ID 1f9dd436ec6a677");
                        },
                        type: "GET",
                        url: imgurAlbum,
                        error: function(){
                            jQuery("#iconselector_imgur_icons").html("<h2>Error</h2><p>Unable to load Imgur Album data. Did you put in the right ID? Is the album public?</p>");
                        },
                        success: function (res) {

                            if (!res) {
                                jQuery("#iconselector_imgur_icons").html("<h2>Error</h2><p>Unable to load Imgur Album data. Did you put in the right ID? Is the album public?</p>");
                                return
                            }
                            if (res.alert) {
                                jQuery("#iconselector_imgur_icons").html("<h2>Error</h2><p>" + res.alert + "</p>");
                                return
                            }
                            var q = jQuery("<ul id='iconselector_imgur_icons_list'></ul>");

                            jQuery.each(res.data.images, function (u, image) {
                                var r = "iconselector_imgur_item_" + image.id;

                                if (location.protocol === 'https:') {
                                    image.link = image.link.replace("http://","https://");
                                }

                                var s = jQuery("<img />").attr({
                                    src: image.link,
//                            alt: image.title,
                                    height: image.height,
                                    width: image.width
                                }).wrap("<div class='icon_image'></div>").parent();
                                var z = "";
                                image.keywords = [
                                    image.id
                                ];
                                if (image.keywords) {
                                    z = jQuery("<div class='keywords'></div>");
                                    var y = image.keywords.length - 1;
                                    jQuery.each(image.keywords, function (B, C) {
                                        m[C] = r;
                                        z.append(jQuery("<a href='#' class='keyword'></a>").text(C));
                                        if (B < y) {
                                            z.append(document.createTextNode(", "))
                                        }
                                    })
                                }
                                if (!image.description) {
                                    image.description = '';
                                }
                                if (!image.title) {
                                    image.title = '';
                                }
                                var A = (image.description != "") ? jQuery("<div class='icon-comment'></div>").text(image.description) : "";
                                var x = jQuery("<div class='meta_wrapper'></div>").append(z).append(A);
                                var w = jQuery("<div class='iconselector_imgur_icons'></div>").append(s).append(x);
                                jQuery("<li></li>").append(w).appendTo(q).data("keywords", image.keywords.join(" ").toLocaleUpperCase()).data("comment", image.description.toLocaleUpperCase()).data("alt", image.title.toLocaleUpperCase()).data("defaultkw", image.keywords[0]).data("link", image.link).attr("id", r)
                            });
                            jQuery("#iconselector_imgur_icons").empty().append(q);
                            jQuery("button", jQuery.fn.iconselector_imgur.instance.siblings()).prop("disabled", false);
//                    jQuery(":input:not([id='iconselector_select'])", jQuery.fn.iconselector_imgur.instance).prop("disabled", false);
                            jQuery("#iconselector_imgur_icons_list").click(doubleClickHandler).dblclick(function (r) {
                                doubleClickHandler(r);
                                selectIcon()
                            });
                            jQuery(".iconselector_imgur_top .kwmenu", jQuery.fn.iconselector_imgur.instance).click(k).dblclick(function (r) {
                                k(r);
                                selectIcon()
                            });
                            jQuery("#iconselector_imgur_search").focus();
                            jQuery("#iconselector_imgur_select").click(selectIcon);
                            jQuery(document).bind("keydown.dialog-overlay", i);
                            g(jQuery.fn.iconselector_imgur.owner.val())
                        }
                    });
                }
            });
        } else {
            g(jQuery.fn.iconselector_imgur.owner.val());
            jQuery.fn.iconselector_imgur.instance.dialog("open");
            jQuery("#iconselector_imgur_search").focus();
            jQuery(document).bind("keydown.dialog-overlay", i)
        }
    }
})(jQuery);

(function (e) {
    var m = {};
    var a;
    e.fn.iconselector = function (n) {
        a = e.extend({}, e.fn.iconselector.defaults, n);
        e.fn.iconselector.owner = e(this);
        if (a.selectorButtons) {
            e(a.selectorButtons).click(function (o) {
                b.apply(e.fn.iconselector.owner, [a]);
                o.preventDefault()
            })
        }
        return e(this).wrap("<span class='iconselect_trigger_wrapper'></span>")
    };
    e.fn.iconselector.selected = null;
    e.fn.iconselector.selectedKeyword = null;
    e.fn.iconselector.defaults = {
        title: "Choose Icon",
        width: "70%",
        height: e(window).height() * 0.8,
        selectedClass: "iconselector_selected",
        onSelect: function () {
        },
        selectorButtons: null,
        metatext: true,
        smallicons: false
    };

    function c() {
        return "<div>      <div class='iconselector_top'>        <span class='iconselector_searchbox'>          Search: <input type='search' id='iconselector_search'>        </span>        <span class='image-text-toggle' id ='iconselector_image_text_toggle'>          <span class='toggle-meta-on'>Meta text / <a href='#' class='no_meta_text'>No meta text</a></span>          <span class='toggle-meta-off'><a href='#' class ='meta_text'>Meta text</a> / No meta text</span>        </span>        <span class='image-size-toggle' id='iconselector_image_size_toggle'>          <span class='toggle-half-image'>Small images / <a href='#' class='full_image'>Large images</a></span>          <span class='toggle-full-image'><a href='#' class='half_image'>Small images</a> / Large images</span>        </span>        <div class='kwmenu'>          <label for='iconselector_kwmenu'>Keywords of selected icon:</label>          <div class='keywords'></div>          <input id='iconselector_select' disabled='disabled' type='button' value='Select'>        </div>      </div>      <div id='iconselector_icons'><span class='iconselector_status'>Loading...</span></div>    </div>"
    }

    function j(q, o, p) {
        e("#" + e.fn.iconselector.selected).removeClass(a.selectedClass);
        if (q.length == 0) {
            return
        }
        e.fn.iconselector.selected = q.attr("id");
        q.addClass(a.selectedClass);
        q.show();
        if (o != null) {
            e.fn.iconselector.selectedKeyword = o
        } else {
            e.fn.iconselector.selectedKeyword = q.data("defaultkw")
        }
        if (p) {
            var n = q.find(".keywords");
            e(".iconselector_top .keywords", e.fn.iconselector.instance).replaceWith(n.clone());
            if (n.length > 0) {
                e("#iconselector_select").prop("disabled", false)
            } else {
                e("#iconselector_select").prop("disabled", true)
            }
        } else {
            e(".iconselector_top .selected", e.fn.iconselector.instance).removeClass("selected")
        }
        e(".iconselector_top .keywords", e.fn.iconselector.instance).find("a.keyword").filter(function () {
            return e(this).text() == e.fn.iconselector.selectedKeyword
        }).addClass("selected")
    }

    function g(n) {
        var o = m[n];
        if (o) {
            j(e("#" + o), n, true)
        }
    }

    function k(o) {
        var q = e(o.target).closest("a.keyword");
        if (q.length > 0) {
            var n = q.text();
            var p = m[n];
            if (p) {
                j(e("#" + p), n, false)
            }
        }
        o.stopPropagation();
        o.preventDefault()
    }

    function l(o) {
        var n = e(o.target).closest("li");
        var p = e(o.target).closest("a.keyword");
        j(n, p.length > 0 ? p.text() : null, true);
        o.stopPropagation();
        o.preventDefault()
    }

    function i(n) {
        if (n.keyCode && n.keyCode === e.ui.keyCode.ENTER) {
            var o = e(n.originalTarget);
            if (o.hasClass("keyword")) {
                o.click()
            } else {
                if (o.is("a")) {
                    return
                }
            }
            d()
        }
    }

    function d() {
        if (e.fn.iconselector.selectedKeyword) {
            e.fn.iconselector.owner.val(e.fn.iconselector.selectedKeyword);
            a.onSelect.apply(e.fn.iconselector.owner[0]);
            e.fn.iconselector.instance.dialog("close")
        }
    }

    function h(o) {
        var p = e("#iconselector_search").val().toLocaleUpperCase();
        e("#iconselector_icons_list li").hide().each(function (q, r) {
            if (e(this).data("keywords").indexOf(p) != -1 || e(this).data("comment").indexOf(p) != -1 || e(this).data("alt").indexOf(p) != -1) {
                e(this).show()
            }
        });
        var n = e("#iconselector_icons_list li:visible");
        if (n.length == 1) {
            j(n, null, true)
        }
    }

    function f(n, o) {
        var p = {};
        p[n] = o;
        e.post("/__rpc_iconbrowser_save", p)
    }

    function b() {
        if (!e.fn.iconselector.instance) {
            e.fn.iconselector.instance = e(c());
            e.fn.iconselector.instance.dialog({
                title: a.title,
                width: a.width,
                height: a.height,
                dialogClass: "iconselector",
                modal: true,
                close: function () {
                    e("#iconselect").focus()
                },
                resize: function () {
                    e("#iconselector_icons").height(e.fn.iconselector.instance.height() - e.fn.iconselector.instance.find(".iconselector_top").height() - 5)
                }
            }).keydown(i);
            e("#iconselector_image_size_toggle a").click(function (o, p) {
                if (e(this).hasClass("half_image")) {
                    e("#iconselector_icons, #iconselector_image_size_toggle, #iconselector_icons_list").addClass("half_icons");
                    if (!p) {
                        f("smallicons", true)
                    }
                } else {
                    e("#iconselector_icons, #iconselector_image_size_toggle, #iconselector_icons_list").removeClass("half_icons");
                    if (!p) {
                        f("smallicons", false)
                    }
                }
                e("#iconselector_image_size_toggle a:visible:first").focus();
                return false
            }).filter(a.smallicons ? ".half_image" : ":not(.half_image)").triggerHandler("click", true);
            e("#iconselector_image_text_toggle a").click(function (o, p) {
                if (e(this).hasClass("no_meta_text")) {
                    e("#iconselector_icons, #iconselector_image_text_toggle, #iconselector_icons_list").addClass("no_meta");
                    if (!p) {
                        f("metatext", false)
                    }
                } else {
                    e("#iconselector_icons, #iconselector_image_text_toggle, #iconselector_icons_list").removeClass("no_meta");
                    if (!p) {
                        f("metatext", true)
                    }
                }
                e("#iconselector_image_text_toggle a:visible:first").focus();
                return false
            }).filter(a.metatext ? ":not(.no_meta_text)" : ".no_meta_text").triggerHandler("click", true);
            e("#iconselector_icons").height(e.fn.iconselector.instance.height() - e.fn.iconselector.instance.find(".iconselector_top").height() - 5);
            e("button", e.fn.iconselector.instance.siblings()).prop("disabled", true);
            e(":input", e.fn.iconselector.instance).prop("disabled", true);
            e("#iconselector_search", e.fn.iconselector.instance).bind("keyup click", h);
            var n = Site.currentJournalBase ? "/" + Site.currentJournal + "/__rpc_userpicselect" : "/__rpc_userpicselect";
            var path = window.location.protocol + '//' + window.location.hostname;
            e.getJSON(path + n, function (o) {
                if (!o) {
                    e("#iconselector_icons").html("<h2>Error</h2><p>Unable to load icons data</p>");
                    return
                }
                if (o.alert) {
                    e("#iconselector_icons").html("<h2>Error</h2><p>" + o.alert + "</p>");
                    return
                }
                var q = e("<ul id='iconselector_icons_list'></ul>");
                var p = o.pics;
                e.each(o.ids, function (u, t) {
                    var v = p[t];
                    var r = "iconselector_item_" + t;
                    var s = e("<img />").attr({
                        src: v.url,
                        alt: v.alt,
                        height: v.height,
                        width: v.width
                    }).wrap("<div class='icon_image'></div>").parent();
                    var z = "";
                    if (v.keywords) {
                        z = e("<div class='keywords'></div>");
                        var y = v.keywords.length - 1;
                        e.each(v.keywords, function (B, C) {
                            m[C] = r;
                            z.append(e("<a href='#' class='keyword'></a>").text(C));
                            if (B < y) {
                                z.append(document.createTextNode(", "))
                            }
                        })
                    }
                    var A = (v.comment != "") ? e("<div class='comment'></div>").text(v.comment) : "";
                    var x = e("<div class='meta_wrapper'></div>").append(z).append(A);
                    var w = e("<div class='iconselector_item'></div>").append(s).append(x);
                    e("<li></li>").append(w).appendTo(q).data("keywords", v.keywords.join(" ").toLocaleUpperCase()).data("comment", v.comment.toLocaleUpperCase()).data("alt", v.alt.toLocaleUpperCase()).data("defaultkw", v.keywords[0]).attr("id", r)
                });
                e("#iconselector_icons").empty().append(q);
                e("button", e.fn.iconselector.instance.siblings()).prop("disabled", false);
                e(":input:not([id='iconselector_select'])", e.fn.iconselector.instance).prop("disabled", false);
                e("#iconselector_icons_list").click(l).dblclick(function (r) {
                    l(r);
                    d()
                });
                e(".iconselector_top .kwmenu", e.fn.iconselector.instance).click(k).dblclick(function (r) {
                    k(r);
                    d()
                });
                e("#iconselector_search").focus();
                e("#iconselector_select").click(d);
                e(document).bind("keydown.dialog-overlay", i);
                g(e.fn.iconselector.owner.val())
            })
        } else {
            g(e.fn.iconselector.owner.val());
            e.fn.iconselector.instance.dialog("open");
            e("#iconselector_search").focus();
            e(document).bind("keydown.dialog-overlay", i)
        }
    }
})(jQuery);
