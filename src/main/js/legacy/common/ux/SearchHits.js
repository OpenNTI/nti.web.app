const Ext = require('extjs');
const RectUtils = require('legacy/util/Rects');
const TextRangeFinderUtils = require('legacy/util/TextRangeFinder');
require('legacy/util/Search');


module.exports = exports = Ext.define('NextThought.common.ux.SearchHits', {
	alias: 'widget.search-hits',
	mixins: {observable: 'Ext.util.Observable'},

	constructor (config) {
		this.mixins.observable.constructor.call(this);
		Ext.apply(this, {
			hit: config.hit,
			phraseSearch: (config.ps || false),
			ownerCmp: config.owner,
			container: config.owner && config.owner.getInsertionPoint('innerCt').dom
		});

		this.mon(this.ownerCmp, {
			scope: this,
			'navigateComplete': 'cleanup',
			'sync-height' : 'reLayout'
		});

		this.insertSearchHitsOverlay();
	},

	insertSearchHitsOverlay () {
		const container = Ext.DomHelper.append(this.ownerCmp.getInsertionPoint('innerCt'), { cls: 'searchHit-overlay' }, true);
		if (Ext.isIE) {
			container.on('click', e => {
				const el = Ext.fly(e.target);

				if (el.dom.className === 'searchHit-entry') {
					el.remove();
				}
			});
		}
		this.on('destroy', () => container.remove());
		this.searchHitsOverlay = container;
		this.showAllHits();
	},

	removeOverlay () {
		try {
			Ext.fly(this.searchHitsOverlay).remove();
		}
		catch (e) {
			console.error(e);
		}
	},

	//FIXME the caching that happens in this method is no longer safe.
	//rangesForSearchHits returns an array objects.	 These objects encapsulate
	//not only the ranges to highlight but also some positioning information.
	//In the current use case the ranges from assesment items have an offset
	//that takes into account scroll position.	That obviously can't be cached
	//across varying scroll positions.	Really what we are trying to cache here
	//are the ranges because they take some cycles to calculate. We could move the caching
	//of ranges into ownerCmp but I'm not sure that makes sense.  Need to ponder some options
	getRanges () {
		function anyRangesCollapsed (ranges) {
			let collapsed = false;
			Ext.each(ranges, range => {
				Ext.each(range.ranges, actualRange => {
					if (actualRange.collapsed) {
						collapsed = true;
						return false;
					}
					return true;
				});
				return !collapsed;
			});
			return collapsed;
		}

		if (this.ranges && !anyRangesCollapsed(this.ranges)) {
			return this.ranges;
		}

		delete this.ranges;

		this.ranges = this.ownerCmp.rangesForSearchHits(this.hit);
		return this.ranges;
	},

	showAllHits () {
		this.renderRanges(this.getRanges());
	},

	entriesToAppend (rangeInfo, toAppend) {
		const rangesToRender = rangeInfo.ranges;
		const adjustments = this.ownerCmp.getRangePositionAdjustments(rangeInfo.key) || {};

		if (!rangesToRender) {
			return toAppend;
		}
		Ext.each(rangesToRender, sel => {
			const redactionAction = TextRangeFinderUtils.getRedactionActionSpan(sel);
			if (redactionAction) {
				redactionAction.addCls('searchHitInside');
				sel.getClientRects = () => {
					const b = redactionAction.getBox();
					return [{
						bottom: b.bottom,
						top: b.y + adjustments.top || 0,
						left: b.x + adjustments.left || 0,
						right: b.right,
						height: b.height,
						width: b.width
					}];
				};
				sel.getBoundingClientRect = null;
				sel.noOverlay = true;
			}

			if (!sel.getClientRects) {sel.getClientRects = () => [];}

			const rects = sel.getBoundingClientRect
			//Safari's version of WebKit has a bad ClientRect that is offset from the reset of the rects...so prefer
			//getBoundingClientRect. So, only fall back to getClientRects if there isn't a getBoundingClientRect.
				? sel.getBoundingClientRect()
				: RectUtils.merge(sel.getClientRects(), null);

			Ext.each(rects, range => {
				//Instead of appending one element at a time build them into a list and
				//append the whole thing.  This is a HUGE improvement for the intial rendering performance
				if (!sel.noOverlay) {
					toAppend.push({
						cls: 'searchHit-entry',
						style: {
							height: range.height + 'px',
							width: range.width + 'px',
							top: (range.top + adjustments.top || 0) + 'px',
							left: (range.left + adjustments.left || 0) + 'px'
						}});
				}
			});

			//Arbitrarily cap at 100 until we can figure out a solution other than
			//a bazillion absolutely positioned divs that make anything but chrome
			//churn.  Maybe showing these things a secion at a time as the page scrolls
			//is best
			return toAppend.length <= 100;

		});

		return toAppend;
	},

	renderRanges (rangesToRender) {
		const toAppend = [];

		Ext.each(rangesToRender, rangeInfo => {
			this.entriesToAppend(rangeInfo, toAppend);
		});

		Ext.DomHelper.append(this.searchHitsOverlay, toAppend, true);
	},

	reLayout () {
		console.log('Relaying out search hit overlays');
		this.removeOverlay();
		this.insertSearchHitsOverlay();
	},

	cleanup () {
		this.removeOverlay();
		delete this.hit;
		delete this.regex;
		delete this.ranges;
		delete this.appRanges;
		this.clearListeners();
		this.clearManagedListeners();
	}
});
