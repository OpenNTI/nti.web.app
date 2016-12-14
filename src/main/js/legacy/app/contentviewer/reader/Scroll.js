var Ext = require('extjs');
var Anchors = require('../../../util/Anchors');
var TextRangeFinderUtils = require('../../../util/TextRangeFinder');
var SearchUtils = require('../../../util/Search');
var UtilSearch = require('../../../util/Search');


module.exports = exports = Ext.define('NextThought.app.contentviewer.reader.Scroll', {
	alias: 'reader.scroll',

	constructor: function (config) {
		Ext.apply(this, config);
		var me = this, reader = me.reader,
			scroll = me.menuHideOnScroll.bind(me);

		function afterReaderRenders () {
			me.scrollingEl = Ext.isIE11p || Ext.isGecko ? Ext.get(document.documentElement) : Ext.getBody();
			reader.on('destroy', 'destroy',
					reader.relayEvents(me.scrollingEl, [
						'scroll'
					]));

			reader.on('destroy', function () {
				window.removeEventListener('scroll', scroll);
			});

			window.addEventListener('scroll', scroll);
		}

		reader.on({
			afterrender: {fn: afterReaderRenders, single: true},
			scroll: 'menuHideOnScroll',
			scope: me
		});
	},

	menuHideOnScroll: function () {
		var scrollPosition = Math.abs(this.top());

		Ext.menu.Manager.hideAll();
		Ext.tip.QuickTipManager.getQuickTip().hide();

		// Track and cache the last scroll position prior to going into fullscreen mode.
		if (!this.isInFullScreenMode()) {
			this.reader.lastScroll = scrollPosition;
		}
		else {
			this.reader.scrollBeforeFullscreen = this.reader.lastScroll;
		}
	},

	isInFullScreenMode: function () {
		var el = document.fullscreenElement ||
				 document.webkitFullscreenElement ||
				 document.mozFullScreenElement ||
				 document.msFullscreenElement;
		return Boolean(el);
	},

	lock: function () {
		if (!Ext.getDom(this.scrollingEl)) {
			return;
		}
		this.scrollingEl.scrollTo('top', 0, false);
		this.scrollingEl.setStyle({overflowY: 'hidden'});
	},

	unlock: function () {
		if (!Ext.getDom(this.scrollingEl)) {
			return;
		}
		this.scrollingEl.setStyle({overflowY: 'auto'});
	},

	get: function () {
		if (!this.scrollingEl) {
			return;
		}
		return this.scrollingEl.getScroll();
	},

	up: function () {
		this.by(50);
	},

	down: function () {
		this.by(-50);
	},

	by: function (delta) {
		if (!this.scrollingEl) {
			return;
		}
		var s = this.scrollingEl,
			t = s.getScrollTop();
		s.setScrollTop(t - delta);
	},

	top: function () {
		var s = this.scrollingEl;
		return s && s.getScrollTop();
	},

	toId: function (id) {
		var n = Ext.getCmp(id),
			m,
			offset = this.reader.getPosition(),
			cPos,
			sTop = this.get().top;


		if (n) {
			cPos = n.getPosition();
			console.log('cmp pos', cPos, 'offset', offset, 'scrollTop', sTop);
			this.to(cPos[1] - offset[1] - 10 + sTop);

			//this.toNode(n.getEl().dom);
			if (n.getMenu) {
				m = n.getMenu();
				if (m && m.items.getCount() === 1) {
					//a single menu item, might as well click it for them
					m.items.first().handler.call(window);
				}
			}
		}
		else {
			console.error('Could not find Component with id: ', id);
		}
	},

	//Scrolls the reader to the first element matching the provided
	//selector.
	toSelector: function (selector) {
		var de = this.reader.getDocumentElement(),
			elem = de.querySelector(selector);
		if (elem) {
			this.toNode(elem, true, 0);
		}
	},

	toTarget: function (target) {
		function getNode (t) {
			return document.getElementById(t) || de.getElementById(t) || de.getElementsByName(t)[0];
		}
		var de = this.reader.getDocumentElement(),
			c = Ext.getCmp(target),
			e = getNode(target) || getNode(decodeURIComponent(target)),
			topMargin = 75;

		if (!e && c) {
			try {
				this.to(c.getScrollPosition(this.scrollingEl.getY() - topMargin));
			}
			catch (excp) {
				console.log('Could not scroll to ', c);
			}
			return;
		}

		if (!e) {
			console.warn('toTarget: no target found for: ', target);
		}
		else {
			this.toNode(e, null, null);
		}
	},

	toContainer: function (containerId) {
		var de = this.reader.getDocumentElement(),
			e = de.getElementById(containerId) || de.getElementsByName(containerId)[0];

		Ext.each(de.querySelectorAll('[data-ntiid],[ntiid]'), function (o) {
			var a = o.getAttribute('data-ntiid') || o.getAttribute('ntiid');
			if (a === containerId) {
				e = o;
			}
			return !e;
		});

		if (!e) {
			return;
		}
		this.toNode(e, true, 0);
	},

	/**
	 * Scroll to some element, but allow options to decide whether or not to scroll.
	 *
	 * @param {Node} n - the node you want to scroll to
	 * @param {boolean} onlyIfNotVisible - pass true here if you want this function to decide if it should scroll or not,
	 *							 based on its visibility on screen
	 * @param {Number} bottomThreshold - if you want to scroll if the target is close to the bottom, specify a threshold.
	 */
	toNode: function (n, onlyIfNotVisible, bottomThreshold, verticalOffset) {
		while (n && n.nodeType === Node.TEXT_NODE) {
			n = n.parentNode;
		}

		var el = this.scrollingEl,
			offsets = (el && el.getScroll()) || {top: 0, left: 0},
			o = Ext.fly(n).getY() - offsets.top,
			st = el && el.getScroll().top,
			h = el && el.getHeight(),
			b = st + h - (bottomThreshold || 0);

		//logic to halt scrolling if conditions mentioned in function docs are met.
		if (onlyIfNotVisible && o > st && o < b) {
			return;
		}

		this.to(o - (verticalOffset || 0) - 10);
	},

	to: function (top, animate) {
		if (!this.scrollingEl || !this.scrollingEl.dom) {
			return;
		}
		this.scrollingEl.scrollTo('top', top, animate !== false);
	},

	toNote: function (note) {
		var applicableRange = note.get('applicableRange'),
			containerId = note.get('ContainerId'),
			doc = this.reader.getIframe().getDocumentElement(),
			cleanContent = this.reader.getCleanContent(),
			range = applicableRange && Anchors.toDomRange(applicableRange, doc, cleanContent, containerId);

		if (range) {
			this.toNode(range.startContainer);
		}
	},

	toSearchHit: function (hit, fragment) {
		var me = this, pos;

		this.reader.getAnnotations().clearSearchHit();

		if (!hit) {
			return;
		}
		//show all the search hits
		this.reader.getAnnotations().showSearchHit(hit);
		if (fragment) {
			console.time('Fragment location');
			pos = me.getFragmentLocation(fragment, hit.get('PhraseSearch'));
			console.timeEnd('Fragment location');
		}

		if (pos >= 0) {
			try {
				me.to(pos);
			} catch (e) {
				console.log('Could not scroll.to(): ', pos, e.message);
			}
		}
	},

	/** @private */
	getFragmentLocation: function (fragment, phrase) {
		var fragRegex = SearchUtils.contentRegexForFragment(fragment, phrase, true),
			doc = this.reader.getDocumentElement(),
			ranges = TextRangeFinderUtils.findTextRanges(doc, doc, fragRegex),
			range, pos = -2, nodeTop, scrollOffset, assessmentAdjustment = 0, indexOverlayData,
			olDom = Ext.getDom(this.reader.getComponentOverlay().componentOverlayEl);

		if (Ext.isEmpty(ranges)) {
			//We are pretty tightly coupled here for assessment.  Each overlay needs to be
			//asked to find the match
			indexOverlayData = TextRangeFinderUtils.indexText(olDom,
					function (node) {
						return Ext.fly(node).parent('.indexed-content');
					});

			ranges = TextRangeFinderUtils.findTextRanges(olDom, olDom.ownerDocument,
					fragRegex.re, fragRegex.matchingGroups, indexOverlayData);
			assessmentAdjustment = 150;
		}

		if (Ext.isEmpty(ranges)) {
			console.warn('Could not find location of fragment', fragment);
			return -1;
		}

		if (ranges.length > 1) {
			console.warn('Found multiple hits for fragment.	 Using first', fragment, ranges);
		}
		range = ranges[0];

		if (range && range.getClientRects().length > 0) {
			nodeTop = range.getClientRects()[0].top;
			//Assessment items aren't in the iframe so they don't take into account scroll
			scrollOffset = this.get().top;
			scrollOffset = (assessmentAdjustment > 0 ? scrollOffset : 0);
			pos = nodeTop - assessmentAdjustment + scrollOffset;
		}

		return pos;
	}
});
