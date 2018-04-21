const Ext = require('@nti/extjs');

const Globals = require('legacy/util/Globals');
const ObjectUtils = require('legacy/util/Object');


/**
 * This entire file is a hack.	The ExtJS implementation aligns and positions the tip before it updates the contents of
 * the tip. So, it is potentially offset.  This attempts to correct that by repeating alignment calculations when it
 * detects a discrepancy.
 *
 * We also try to apply sane defaults.
 */
module.exports = exports = Ext.define('NextThought.overrides.tip.QuickTip', {
	override: 'Ext.tip.QuickTip',
	EDGE_PADDING: 20,

	//pixals from any given edge to trigger a repositioning

	//Apply defaults
	constructor: function (config) {
		config = Ext.apply(config || {},{
			header: false,
			showDelay: 500,
			anchorTarget: true,
			trackMouse: false,
			shadow: false,
			componentLayout: 'auto',
			layout: 'auto',
			html: 'WWWWWWWWW',//provide a default so the initial isn't so small.
			xhooks: {
				getTargetXY: function () {
					try {
						var me = this,
							o = me.readerOffsets,
							r = me.callParent(arguments);

						if (r && o) {
							r[0] += o.left;
							r[1] += o.top;
						}
						return r;
					}
					catch (e) {
						Ext.defer(this.hide, 10, this);
						return [0, 0];
					}
				}
			}
		});

		this.onScroll = this.onScroll.bind(this);

		this.callParent([config]);
	},

	getDockingRefItems: function (deep, items) {
		return items;
	},

	onTargetOver: function (e, dom, opts) {
		if(Ext.is.iOS) {
			return;
		}
		delete this.readerOffsets;
		if (opts.reader) {
			this.readerOffsets = opts.reader.getAnnotationOffsets();
		}
		return this.callParent(arguments);
	},

	//Override alignment and force the 'target' element to be the element with the title/tip attribute if not the
	// registered owner element. Default to a top centered position, unless screen position forces us to reposition.
	getTargetXY: function getTargetXY () {
		function getTarget (el) {
			el = Ext.get(el);
			if (!el || el.getAttribute('title') || el.getAttribute('data-qtip')) {
				return el;
			}

			return el.up('[title]') || el.up('[data-qtip]') || el;
		}

		if (getTargetXY.recursiveCall) {
			return this.callParent(arguments);
		}

		getTargetXY.recursiveCall = true;

		delete this.delegate;
		//Only update it, if activeTarget is set.
		this.anchorTarget = this.activeTarget ? Ext.getDom(getTarget(this.activeTarget.el)) : this.anchorTarget;
		this.anchor = 'bottom';

		var vW = Ext.dom.Element.getViewportWidth(),
			w = this.el.getWidth(),
			r;

		if (Ext.isEmpty(this.anchorTarget)) {
			console.warn('Tooltip anchorTarget is null. It shouldn\'t be');
			return [-1000, -1000];//don't return null... its dangerous.
		}
		try {
			r = this.callParent(arguments);

			if (r[1] < this.EDGE_PADDING) {
				//needs to swap down
				this.anchor = 'top';
			}

			if (r[0] < this.EDGE_PADDING) {
				//needs to swap left
				this.anchor = 'left';
			}
			else if ((vW - (r[0] + w)) < this.EDGE_PADDING) {
				//needs to swap right
				this.anchor = 'right';
			}

			if (this.anchor !== 'bottom') {
				r = this.callParent(arguments);
			}
		}
		catch (er) {
			console.warn(Globals.getError(er));
		}
		finally {
			delete getTargetXY.recursiveCall;
		}

		if (!r) {
			r = [-2000, -2000];
			console.error('Parent implementation return a bad value');
		}
		return r;
	},

	//Hack: The contents change during show, AFTER positioning and aligning, so if we change size, redo it all.
	showAt: function (xy) {
		if (!xy) {
			return;
		}
		var size = this.el.getSize(),
			sizeAfter;

		try {
			this.callParent(arguments);
		} catch (e) {
			console.error(e.stack || e.message || e);
		}

		sizeAfter = this.el.getSize();

		if (size.width !== sizeAfter.width || size.height !== sizeAfter.height) {
			//NOTE: if for some reasons, getTargetXY() returns null, return the default xy that was passed in.
			Ext.defer(this.showAt, 1, this, [this.getTargetXY() || xy]);
		}
	},

	show: function () {
		var ini = this.initialConfig.html;

		function detectCrash () {
			if (!this.html || this.html === ini) {
				console.warn('detected tool tip crash');
				this.hide();
				this.crashCount = (this.crashCount || 0) + 1;
				if (this.crashCount > 10) {
					console.error('Too many top failures, removing them.');
					Ext.tip.QuickTipManager.destroy();
				}
			}
		}

		window.addEventListener('scroll', this.onScroll);

		Ext.defer(detectCrash, 10, this);

		return this.callParent(arguments);
	},

	onScroll: function () {
		this.hide();
		window.removeEventListener('scroll', this.onScroll);
	},

	//center the tip pointer
	//We prefer to align to the center posisitions instead of the corner positions.
	syncAnchor: function () {
		var me = this, pos;
		me.callParent(arguments);
		switch (me.tipAnchor.charAt(0)) {
		case 't': pos = 'b-t'; break;
		case 'r': pos = 'l-r'; break;
		case 'b': pos = 't-b'; break;
		default: pos = 'r-l'; break;
		}
		me.anchorEl.alignTo(me.el, pos);
	},

	//We prefer to align to the center posisitions instead of the corner positions.
	getAnchorAlign: function () {
		switch (this.anchor) {
		case 'top': return 't-b';
		case 'left': return 'l-r';
		case 'right': return 'r-l';
		default: return 'b-t';
		}
	}
});


module.exports = exports = Ext.define('NextThought.view.tip.Tooltip', {
	extend: 'Ext.tip.ToolTip',
	alias: 'widget.nt-tooltip',

	cls: 'spec',


	blockLeftRightAlign: function () {
		var align = this.defaultAlign,
			anchor = this.anchor;
		ObjectUtils.defineAttributes(this, {
			defaultAlign: {
				setter: function (v) { align = v === 'r-l' ? 'tr-br' : v; },
				getter: function () { return align; }
			},
			anchor: {
				setter: function (v) { anchor = v === 'right' ? 'bottom' : v; },
				getter: function () { return anchor; }
			}
		});

	},


	//center the tip pointer
	//We prefer to align to the center posisitions instead of the corner positions.
	syncAnchor: function () {
		var me = this, pos, off = [0, 0];
		me.callParent(arguments);
		switch (me.tipAnchor.charAt(0)) {
		case 't': pos = 'b-t'; break;
		case 'r': pos = 'l-r'; break;
		case 'b': pos = 't-b'; break;
		default: pos = 'r-l'; break;
		}

		if (this.defaultAlign === 'tr-br') {
			pos = 't-br';
			off = [-50, 0];
		}

		me.anchorEl.alignTo(me.el, pos, off);
	},


	//We prefer to align to the center posisitions instead of the corner positions.
	getAnchorAlign: function () {
		switch (this.anchor) {
		case 'top': return 't-b';
		case 'left': return 'l-r';
		case 'right': return 'r-l';
		default: return 'b-t';
		}
	}

});
