const Ext = require('extjs');

const RectUtils = require('../../util/Rects');


module.exports = exports = Ext.define('NextThought.overrides.dom.Element', {
	override: 'Ext.dom.Element',
//	requires: ['NextThought.util.Rects'],

	constructor: function () {
		this.callParent(arguments);

		if (this.dom && this.dom.addEventListener) {
			this.on({
				scope: this,
				buffer: 200,
				scroll: this._scrollStopped
			});
		} else {
			console.warn('trying to register a listener for a element with out a dom node, it will not fire scrollstop');
		}
	},


	_scrollStopped: function (e) {
		var me = this,
			d = me.dom,
			c = Ext.EventManager.getEventListenerCache(d, 'scrollstop') || [];

		c.forEach(function (listener) {
			listener.wrap.call(c.scope || d, e);
		});
	},


	getScrollingEl: function () {

		var el = this, found = 0, max = 100, flow;

		do {
			el = el && el.parent();
			if (el) {
				flow = el.getStyle('overflow-y');
				if (flow !== 'hidden' && el.dom.scrollHeight > el.getHeight()) {
					found = max;
				}
			}
		}while (el && found < max);

		return el || this;
	},

	needsScrollIntoView: function (containerEl) {
		var container = Ext.getDom(containerEl) || Ext.getBody().dom,
			el = this.dom,
			offsets = this.getOffsetsTo(container),

			top = offsets[1] + container.scrollTop,
			bottom = top + el.offsetHeight,

			ctClientHeight = container.clientHeight,
			ctTop = parseInt(container.scrollTop, 10),
			ctBottom = ctTop + ctClientHeight;

		return top > ctBottom || top < ctTop || bottom < ctTop || bottom > ctBottom;
	},


	scrollCompletelyIntoView: function (container, hscroll, animate) {
		var me = this,
			dom = me.dom,
			offsets = me.getOffsetsTo(container = Ext.getDom(container) || Ext.getBody().dom),
		// el's box
			left = offsets[0] + container.scrollLeft,
			top = offsets[1] + container.scrollTop,
			bottom = top + dom.offsetHeight,
			right = left + dom.offsetWidth,
		// ct's box
			ctClientHeight = container.clientHeight,
			ctScrollTop = parseInt(container.scrollTop, 10),
			ctScrollLeft = parseInt(container.scrollLeft, 10),
			ctBottom = ctScrollTop + ctClientHeight,
			ctRight = ctScrollLeft + container.clientWidth,
			newPos;

		if (dom.offsetHeight > ctClientHeight || top < ctScrollTop) {
			newPos = top - this.getHeight();
		} else if (bottom > ctBottom) {
			newPos = (bottom - ctClientHeight) + this.getHeight();
		}
		if (newPos !== null) {
			me.scrollChildFly.attach(container).scrollTo('top', newPos, animate);
		}

		if (hscroll !== false) {
			newPos = null;
			if (dom.offsetWidth > container.clientWidth || left < ctScrollLeft) {
				newPos = left;
			} else if (right > ctRight) {
				newPos = right - container.clientWidth;
			}
			if (newPos !== null) {
				me.scrollChildFly.attach(container).scrollTo('left', newPos, animate);
			}
		}
		return me;
	},


	/**
	 *
	 * @param {Node} el
	 * @param {Number} [bufferZone]
	 * @return {*}
	 */
	isOnScreenRelativeTo: function (el, bufferZone) {
		var myRect = Ext.getDom(this).getBoundingClientRect(),
			parentRect = Ext.getDom(el).getBoundingClientRect();

		return RectUtils.contains(parentRect, myRect, bufferZone);
	},


	getAttribute: function (attr, ns) {
		var v = this.callParent(arguments);
		return v || (attr === 'class' ? this.callParent(['className', ns]) : null);
	},


	getAndRemoveAttr: function (attr) {
		var r = this.dom.getAttribute(attr);
		this.dom.removeAttribute(attr);
		return r;
	},


	allowContextMenu: function () {
		this.on('contextmenu', function (e) {e.stopPropagation();});
		return this;
	}
});
