Ext.define('NextThought.view.content.Navigation',{
    extend: 'Ext.Component',
    alias: 'widget.content-navigation',
    requires: [
        'NextThought.view.menus.JumpTo'
    ],
    ui: 'content-navigation',
    cls: 'jumpto',

    breadcrumbSepTpl: Ext.DomHelper.createTemplate({tag: 'span', html: ' / '}).compile(),
    breadcrumbTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'part', html: '{0}'}).compile(),

    renderTpl: Ext.DomHelper.markup([{cls: 'back'},{ cls: 'breadcrumb' }]),

    levelLabels: {
        'NaN': '&sect;',
        '0': 'Select a chapter',
        '1': 'Select a section'
    },

    renderSelectors: { backEl: '.back', breadcrumb: '.breadcrumb' },

    listeners: {
        afterrender: 'hide',
        click: {
            element: 'backEl',
            fn: 'onBack'
        }
    },


    onBack: function(e) {
        e.stopEvent();

        //pop up one level.
        var lineage = ContentUtils.getLineage(this.currentNtiid);
        this.fireEvent('set-location',lineage[1]);
    },


    updateLocation: function(ntiid) {
        this.currentNtiid = ntiid;
        var me = this,
            C = ContentUtils,
            loc = C.getLocation(ntiid),
            lineage = C.getLineage(ntiid),
            parent = lineage.last(),
            page = lineage[0] ? C.getLocation(lineage[0]) : null,
            path = me.getBreadcrumbPath(), i = 0;


        lineage.pop();//don't let the book show
        //first was the 2nd item in the array...which is where the 'back' arrow will take you
        this.backEl[(!lineage.first()) ? 'hide' : 'show']();

        function buildPathPart(v, i, a) {
            var e,
                l = C.getLocation(v),
                label = l.label;

            e = me.breadcrumbTpl.insertFirst(me.breadcrumb, [label], true);

            if (i < (a.length - 1)) {
                path.add(me.breadcrumbSepTpl.insertFirst(me.breadcrumb));
            }

            me.buildMenu(e, l, parent);

            path.add(e);
        }

        me.cleanupMenus();

        if (!loc || !loc.NTIID || !page) { me.hide(); return; }
        if (me.isHidden()) { me.show(); }

        if (lineage.length <= 1) {
            if ( me.hasChildren(loc.location) ) {
                path.add(me.breadcrumbTpl.insertFirst(me.breadcrumb, [me.levelLabels[lineage.length]], true));
                me.buildMenu(path.last(), C.getLocation(me.getFirstTopic(loc.location)), parent);

                if ( lineage.length === 1 ) {
                    path.add(me.breadcrumbSepTpl.insertFirst(me.breadcrumb));
                }
            }
            else {
                path.add = Ext.Function.createSequence(path.add, function(e) { e.addCls('no-children'); }, me);
                path.add(me.breadcrumbTpl.insertFirst(me.breadcrumb, [me.levelLabels[NaN]], true));
            }
        }

        for (i; i < 2 && i < lineage.length; i++) {
            buildPathPart.call(this, lineage[i], i, lineage);
        }
    },


    getContentNumericalAddress: function(lineage, loc) {
        return '';
    },


    getBreadcrumbPath: function() {
        var p = new Ext.CompositeElement();

        if (this.pathPartEls) {
            this.pathPartEls.clearListeners();
            this.pathPartEls.remove();
            this.pathPartEls.clear();
            delete this.pathPartEls;
        }
        this.pathPartEls = p;

        return p;
    },



    cleanupMenus: function() {
        var m = this.menuMap;
        delete this.menuMap;

        Ext.Object.each(m, function(k, v) {
            return (v && v.destroy && v.destroy()) || true;
        });
        //TODO: clean them out
    },


    buildMenu: function(pathPartEl, locationInfo, parent) {
        var me = this, m, k,
            menus = me.menuMap || {},
            cfg = { ownerButton: me, items: [] },
            key = locationInfo ? locationInfo.NTIID : null,
            currentNode = locationInfo ? locationInfo.location : null;

        if (!currentNode) { return pathPartEl; }

        if (currentNode.tagName === 'toc') {
            return pathPartEl;
            //this.enumerateBookSiblings(locationInfo,cfg.items);
        }
//		else {
        this.enumerateTopicSiblings(currentNode,cfg.items,parent);
//		}

        m = menus[key] = Ext.widget('jump-menu', Ext.apply({}, cfg));

        if (Ext.is.iPad) {
            m.mon(pathPartEl, {
                scope: m,
            // Tap to show/hide the menu
                'click': function() {
                    if (!m.rendered || !m.showing) {
                        m.maxHeight = Ext.Element.getViewportHeight() - (pathPartEl.getX() + (pathPartEl.getHeight() - 30));
                        m.showBy(pathPartEl, 'tl-bl', [-10, -20]);
                        m.showing = true;
                        for (k in menus) {
                            if (menus.hasOwnProperty(k)) {
                                if (k !== key) {
                                    menus[k].showing = false;
                                }
                            }
                        }
                    }
                    else {
                        clearTimeout(m.hideTimer);
                        m.hide();
                        clearTimeout(m.hideTimer);
                        m.showing = false;
                    }
                }
            });
        }
        else {
            //evt handlers to hide menu on mouseout (w/o click) so they don't stick around forever...
            m.mon(pathPartEl, {
                scope: m,
                'mouseleave': 'stopShow',
                'mouseenter': function() {
                    m.maxHeight = Ext.Element.getViewportHeight() - (pathPartEl.getX() + (pathPartEl.getHeight() - 30));
                    m.startShow(pathPartEl, 'tl-bl', [-10, -20]);
                },
                'click': function() {
                    m.stopHide();
                    m.stopShow();
                    me.fireEvent('set-location',key);
                }
            });
        }

        this.menuMap = menus;

        return pathPartEl;
    },


//	enumerateBookSiblings: function(locInfo,items){
//		Library.each(function(o){
//			var id = o.get('NTIID');
//			items.push({
//				rememberLastLocation: true,
//				text	: o.get('title'),
//				ntiid	: id,
//				cls		: id===locInfo.ntiid?'current':''
//			});
//		});
//	},


    enumerateTopicSiblings: function(node,items,parent) {
        var current = node, num = 1, text,
            type = '1', separate = '. ', suppress = false,
            p, n = 'numbering', sep = 'separator', sup = 'suppressed';

        if (parent) {
            p = Library.getTitle(parent).get('PresentationProperties');
            if (p && p[n]) {
                num = p[n] && p[n].start;
                type = p[n] && p[n].type;
                separate = p[n] && p[n][sep];
                suppress = p[n] && p[n][sup];
            }
        }

        if (!current.parentNode) {
            console.warn('null parentNode in toc');
            return;
        }

        while (Ext.fly(node).prev()) {
            node = Ext.fly(node).prev(null, true);
        }

        for(node;node.nextSibling; node = node.nextSibling) {
            if (!/topic/i.test(node.tagName)) { continue; }

            text = suppress ? node.getAttribute('label') : (this.styleList(num,type) + separate + node.getAttribute('label'));
            items.push({
                text	: text,
                ntiid	: node.getAttribute('ntiid'),
                cls		: node === current ? 'current' : ''
            });
            num++;
        }
    },


    //num - the number in the list; style - type of numbering '1','a','A','i','I'
    styleList: function(num,style) {
        var me = this, formatters = {
            'a' :  me.toBase26SansNumbers,
            'A' : function(num) {
                return me.toBase26SansNumbers(num).toUpperCase();
            },
            'i' : function(num) {
                return me.toRomanNumeral(num).toLowerCase();
            },
            'I' : me.toRomanNumeral
        };

        if (Ext.isFunction(formatters[style])) {
            return formatters[style].apply(me, [num]);
        }
        return num;
    },


    //from: http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
    toRomanNumeral: function(num){
        var digits, key, roman, i, m = [];

        digits = String(+num).split('');
        key = ['','C','CC','CCC','CD','D','DC','DCC','DCCC','CM',
            '','X','XX','XXX','XL','L','LX','LXX','LXXX','XC',
            '','I','II','III','IV','V','VI','VII','VIII','IX'];
        roman = '';
        i = 3;
        while (i--) {
            roman = (key[+digits.pop() + (i * 10)] || '') + roman;
        }

        m.length = +digits.join('') + 1;

        return m.join('M') + roman;
    },


    toBase26SansNumbers: function(num){
        var val = (num - 1) % 26,
            letter = String.fromCharCode(97 + val),
            num2 = Math.floor((num - 1) / 26);
        if (num2 > 0) {
            return this.toBase26SansNumbers(num2) + letter;
        }
        return letter;
    },


    hasChildren: function(n) {
        var num = 0, node;

        node = this.getFirstTopic(n);

        for (node; node && node.nextSibling; node = node.nextSibling) {
            if (!/topic/i.test(node.tagName) || parseInt(node.getAttribute('levelnum'), 10) > 2) { continue; }
            num++;
        }
        return (num > 0);
    },


    getFirstTopic: function(n) {
        return Ext.fly(n).first('topic', true);
    }
});

