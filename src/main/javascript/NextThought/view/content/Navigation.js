/**
 * The navigation menu bar for content view
 */
Ext.define('NextThought.view.content.Navigation', {
	extend: 'Ext.Component',
	alias: 'widget.content-navigation',
	requires: [
		'NextThought.view.menus.JumpTo'
	],
	ui: 'content-navigation',
	cls: 'jumpto',

	breadcrumbTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'part', html: '{0}'}).compile(),

	MAX_PATH_LENGTH: 2,

	renderTpl: Ext.DomHelper.markup([
		{cls: 'goup', 'data-qtip': '{{{NextThought.view.content.Navigation.goup}}}'},
		{cls: 'breadcrumb'}
	]),

	levelLabels: {
		'NaN': '&sect;',
		'0': getString('NextThought.view.content.Navigation.select-chapter'),
		'1': getString('NextThought.view.content.Navigation.select-section')
	},

	renderSelectors: {upEl: '.goup', breadcrumb: '.breadcrumb'},

	initComponent: function() {
		this.callParent(arguments);
		this.enableBubble('main-tab-clicked');
		this.on({
			afterrender: 'hide',
			destroy: 'cleanupMenus',
			click: {element: 'upEl', fn: 'onUp'},
			mouseover: {element: 'upEl', fn: 'onUpHover'}
		});
	},

	onUp: function(e) {
		e.stopEvent();

		if (!this.upEl || !this.upEl.isVisible() || this.upEl.hasCls('disabled')) {
			return;
		}

		if (this.upMenu) {
			this.upMenu.stopHide();
			this.upMenu.stopShow();
		}
		// pop up one level.
		var up = ContentUtils.getLineage(this.currentNtiid, false, true)[1];
		if (up) {
			this.fireEvent('set-location', up);
		}
	},


	onUpHover: function(e) {
		var scrollEl = this.up('[getMainTabbarMenu]');
		e.stopEvent();
		if (!e.getTarget('.has-alt-tabbar') || this.hasNoTabbar) { return; }

		if (!this.upMenu && !this.hasNoTabbar) {
			this.upMenu = scrollEl.getMainTabbarMenu();
			if (!this.upMenu) {
				this.hasNoTabbar = true;
				return;
			}

			this.mon(this.upMenu, {
				scope: this,
				click: function(menu, item) {
					console.log('tab item clicked: ', arguments);
					this.fireEvent('main-tab-clicked', item);
				}
			});

			this.on('destroy', 'destroy', this.upMenu);
		}

		this.upMenu.startShow(this.upEl, 'tl-bl', [-10, -25]);
	},


	updateLocation: function(ntiid, rootId) {
		this.currentNtiid = ntiid;
		var me = this,
			C = ContentUtils,
			loc = C.getLocation(ntiid),
			lineage = C.getLineage(ntiid), leftOvers = [],
			names = C.getLineage(ntiid, true),
			parent = lineage.last(),
			page = lineage[0] ? C.getLocation(lineage[0]) : null,
			path = me.getBreadcrumbPath(), i = 0, rootIdIdx,
			pathLength = 0, allowMenus = true;

		function buildPathPart(v, i, a) {
			var e,
				l = C.getLocation(v),
				label = l.label;

			e = me.breadcrumbTpl.insertFirst(me.breadcrumb, [label], true);
			path.add(e);

			if (a === lineage && allowMenus) {//only put menus on the rooted content
				me.buildMenu(e, l, parent);
			} else {
				Ext.fly(e).addCls('locked');
				me.mon(Ext.fly(e), 'click', 'onUp');
			}

		}

		me.cleanupMenus(); //cleanup before proceeding.

		// If passed, lets get the index of the rootId so we know where in the
		// lineage to cut to Re-Root the tree.
		rootIdIdx = lineage.indexOf(rootId);
		if (rootId && rootIdIdx < 0) {
			//if there is a rootId, but we did not find it in the lineage, we're
			// out of bounds, and should return without doing anything.
			//return;
			allowMenus = false;
		}

		// If no rootId was sent, then it would return -1 in the indexOf,
		// so because of the above check, we know that if we have an index above
		// -1 we are to cut the lineage at that point.
		if (rootIdIdx >= 0) {
			leftOvers = lineage.slice(rootIdIdx);
			rootIdIdx++; //slice is not inclusive, so push the index one up so that our slice gets the new root.
			lineage = lineage.slice(0, rootIdIdx);
			//No need to slice names... we're reversed so the 0th item is the leaf, the nth item is the root.
			//names = names.slice(0, rootIdIdx);

			//From this point on the logic should be unchanged... lineage manipulation is complete.
		}

		leftOvers.pop();
		lineage.pop(); // don't let the root show
		// first was the 2nd item in the array... which is where the 'back' arrow will take you
		this.upEl[(!lineage.first() && !rootId) ? 'hide' : 'show']();
		this.upEl.set({
			'data-qtip': 'Go up to ' + (names[1] || '')
		});


		if (!loc || !loc.NTIID || !page) {
			me.hide();
			return;
		}

		if (me.isHidden()) {
			me.show();
		}

		if ((lineage.length + leftOvers.length) <= 1) {
			if (me.hasChildren(loc.location)) {
				path.add(me.breadcrumbTpl.insertFirst(me.breadcrumb, [me.levelLabels[lineage.length]], true));
				me.buildMenu(path.last(), C.getLocation(me.getFirstTopic(loc.location)), parent);
			}
			else {
				path.add = Ext.Function.createSequence(path.add, function(e) {
					Ext.fly(e).addCls('no-children');
				}, me);
				path.add(me.breadcrumbTpl.insertFirst(me.breadcrumb, [me.levelLabels[NaN]], true));
			}
		}

		for (i; i < this.MAX_PATH_LENGTH && i < lineage.length; i++) {
			buildPathPart.call(this, lineage[i], i, lineage);
			pathLength++;
		}

		for (i = 0; pathLength < this.MAX_PATH_LENGTH && i < leftOvers.length; i++) {
			buildPathPart.call(this, leftOvers[i], i, leftOvers);
			pathLength++;
		}

		if (path.last() && path.last().getHTML() === ' / ') {
			path.removeElement(path.last(), true);
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

		delete this.hasNoTabbar;
		if (this.upMenu) {
			this.upMenu.destroy();
			delete this.upMenu;
		}
		//TODO: clean them out
	},



	buildMenu: function(pathPartEl, locationInfo, parent) {
		var me = this, m,
			menus = me.menuMap || {},
			cfg = { ownerButton: me, items: [] },
			key = locationInfo ? locationInfo.NTIID : null,
			currentNode = locationInfo ? locationInfo.location : null,
			content = Ext.getCmp('content'),
			currentCourse = content && content.currentCourse,
			outline = currentCourse && currentCourse.getOutline();

		outline = outline && outline.value;

		if (!currentNode) {
			return pathPartEl;
		}

		if (currentNode.tagName === 'toc') {
			return pathPartEl;
		}
		this.enumerateTopicSiblings(currentNode, cfg.items, parent);

		if (Ext.isEmpty(cfg.items)) {
			return;
		}

		//if we don't have an outline we aren't in a course so don't filter out items
		if (outline) {
			cfg.items = (cfg.items || []).reduce(function(prev, cur) {
				if (outline.isVisible(cur.ntiid)) {
					prev.push(cur);
				}

				return prev;
			}, []);
		}

		m = menus[key] = Ext.widget('jump-menu', Ext.apply({}, cfg));
		m.hostEl = pathPartEl;

		// evt handlers to hide menu on mouseout (w/o click) so they don't stick around forever...
		m.mon(pathPartEl, {
			scope: m,
			'mouseleave': function maybeStopShow() {
				if (!Ext.is.iPad || !m.isVisible()) {
					m.stopShow();
				}
			},
			'mouseenter': function() {
				m.maxHeight = Ext.Element.getViewportHeight() - (pathPartEl.getX() + pathPartEl.getHeight() + 40);
				m.startShow(pathPartEl, 'tl-bl', [-10, -25]);
			},
			'click': function() {
				m.stopHide();
				m.stopShow();
				me.fireEvent('set-location', key);
			}
		});

		this.menuMap = menus;

		return pathPartEl;
	},


	enumerateTopicSiblings: function(node, items, parent) {
		var me = this, current = node, num = 1, text,
			type = '1', separate = '. ', suppress = false, nodes,
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

		nodes = ContentUtils.getSiblings(node);

		if (Ext.isEmpty(nodes)) {
			return;
		}

		Ext.each(nodes, function(node) {
			if (!/topic/i.test(node.tagName) || node.getAttribute('suppressed') === 'true') {
				return;
			}

			text = suppress ? node.getAttribute('label') : (me.styleList(num, type) + separate + node.getAttribute('label'));

			items.push({
				text: text,
				ntiid: node.getAttribute('ntiid'),
				cls: node === current ? 'current' : ''
			});
			num++;
		});
	},


	//num - the number in the list; style - type of numbering '1','a','A','i','I'
	styleList: function(num, style) {
		var me = this, formatters = {
			'a': me.toBase26SansNumbers,
			'A': function(num) {
				return me.toBase26SansNumbers(num).toUpperCase();
			},
			'i': function(num) {
				return me.toRomanNumeral(num).toLowerCase();
			},
			'I': me.toRomanNumeral
		};

		if (Ext.isFunction(formatters[style])) {
			return formatters[style].apply(me, [num]);
		}
		return num;
	},


	//from: http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
	toRomanNumeral: function(num) {
		var digits, key, roman, i, m = [];

		digits = String(+num).split('');
		key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
			'', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
			'', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
		roman = '';
		i = 3;
		while (i--) {
			roman = (key[+digits.pop() + (i * 10)] || '') + roman;
		}

		m.length = +digits.join('') + 1;

		return m.join('M') + roman;
	},


	toBase26SansNumbers: function(num) {
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
			if (!/topic/i.test(node.tagName) || (node.getAttribute('href') || '').indexOf('#') >= 0) {
				continue;
			}
			num++;
		}
		return (num > 0);
	},


	getFirstTopic: function(n) {
		return Ext.fly(n).first('topic', true);
	}
});

