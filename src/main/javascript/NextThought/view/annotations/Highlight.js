Ext.define('NextThought.view.annotations.Highlight', {
	extend: 'NextThought.view.annotations.Base',
	alias: 'widget.highlight',
	requires: [
		'NextThought.util.Anchors',
		'NextThought.util.Rects'
	],
	inheritableStatics: {
		bgcolor: {},
		blockElementRe: /^(address|blockquote|body|center|dir|div|dl|fieldset|form|h[1-6]|hr|isindex|menu|noframes|noscript|ol|p|pre|table|ul|dd|dt|frameset|li|tbody|td|tfoot|th|thead|tr|html)$/i
	},

	highlightCls: 'application-highlight',
	mouseOverCls: 'highlight-mouse-over',

	constructor: function(config) {
		this.callParent(arguments);

		//TODO hook up browser range for speed, throw away after render
		//	this.range = config.browserRange;

		if (!this.isModifiable) {
			this.highlightCls += ' shared-with-me';
		}

		var pp = this.getRecordField('presentationProperties');
		if (pp && pp.highlightColorName) {
			this.highlightColorName = pp.highlightColorName;
			this.highlightCls += ' ' + pp.highlightColorName;
		}

		this.allowShare = false;
	},


	getRange: function() {
		var range = Anchors.toDomRange(this.getRecordField('applicableRange'), this.doc, ReaderPanel.get().getCleanContent(), this.getRecordField('ContainerId'));

		if (!range) {
			if (this.manager.isDebug) {
				console.error('bad range', this.getRecord());
			}
			return null;
		}

		//console.log(this.id,': ',(this.getRecordField('body')||[]).join('|'), ': got range from description:', range, range.toString());
		Anchors.expandRangeToIncludeMath(range);
		return range;
	},


	buildMenu: function(i) {
		var items = [];

		if (i) {
			items.push.apply(items, i);
		}

		return this.callParent([items]);
	},


	cleanup: function() {
		this.isDestroyed = true;
		if (this.rendered) {
			try {
				var c = this.rendered.slice();
				this.rendered = [];

				//cleanup listeners if possible:
				try {
					this.compElements.clearListeners();
					this.compElements.clear();
				}
				catch (e) {
					//catch any exceptions if things have changed...
				}

				//canvas and counter may not exist if suppressed:
				if (this.canvas) {
					Ext.fly(this.canvas).remove();
				}
				if (this.counter) {
					Ext.fly(this.counter).remove();
				}

				Ext.each(c, this.unwrap, this);

			} catch (e2) {
				console.error(Globals.getError(e2));
			}
		}
		return this.callParent(arguments);
	},


	onMouseOver: function() {
		clearTimeout(this.mouseOutTimout);
		if (!this.compElements.first().hasCls(this.mouseOverCls)) {
			this.compElements.addCls(this.mouseOverCls);
			this.render();

			if (Ext.is.iOS) {
				var me = this;
				Ext.defer(function() {
					var menu = Ext.get(Ext.query('.x-menu .x-component-nt-annotaion')[0]).el.up('.x-menu');
					me.mon(Ext.getCmp(menu.id), 'destroy', function() {
						me.onMouseOut();
					});
				},250);
			}
		}
	},


	onMouseOut: function() {
		var me = this;

		function off() {
			me.compElements.removeCls(me.mouseOverCls);
			me.render();
		}

		this.mouseOutTimout = setTimeout(off, 250);
	},


	visibilityChanged: function(show) {
		var c = this.compElements,
				fn = show ? 'addCls' : 'removeCls';
		if (c) {
			c[fn].call(c, this.highlightCls);
			this.render();
		}

		return this.callParent(arguments);
	},


	buildRange: function() {
		var range = this.doc.createRange();

		if (this.rendered && this.rendered.length > 0) {
			try {
				range.setStartBefore(this.rendered.first());
				range.setEndAfter(this.rendered.last());

			}
			catch (e) {
				console.error(Globals.getError(e));
			}
		}

		return range;
	},


	resolveVerticalLocation: function() {
		var r, rect, node;

		if (this.rendered) {
			r = this.buildRange();
		}
		else {
			r = this.getRange();
		}

		rect = r && RangeUtils.safeBoundingBoxForRange(r);
		if (!rect) {
			return NextThought.view.annotations.Base.NOT_FOUND;
		}

		return !RectUtils.isZeroRect(rect) ? rect.top : NextThought.view.annotations.Base.HIDDEN;
	},


	render: function() {
		if (this.isDestroyed) {
			return;
		}
		var me = this,
				range = null,
				style = me.getRecordField('style'),
				bounds,
				boundingTop,
				boundingLeft,
				boundingHeight,
				boundingWidth,
				width = me.content ? me.content.getWidth() : 700, // Didn't seem appropriate for how it was used
				topOffset = 10,
				leftOffset = 5,
				fakeRectRange,
				state = 'normal', sampleEl;

		if (!me.rendered) {
			range = me.getRange();
			if (!range) {
				return -1;
			}
			me.rendered = me.wrapRange(range.commonAncestorContainer, range);

			if (!me.rendered || me.rendered.length === 0) {
				console.error('Dropping annotation with no nodes to render', me);
				return -1;
			}

			//don't create counter when suppressed:
			// Disabled counters on iPad because 1) their span added width which threw off all the content and could
			//  break its presentation, and 2) they didn't seem to be doing anything functional anywhere.
			if (style !== 'suppressed' && !Ext.is.iPad) {
				me.counter = me.createCounter(me.rendered.last());
			}

			//create a composite element so we can do lots of things at once:
			me.compElements = new Ext.dom.CompositeElement(me.rendered);
			me.compElements.add(me.counter);

			//highlights that are not ours do not get a marked over treatment...so don't create the canvas

			//FIXME Dirty Work around an issue with redactions also being highlighted.  At this point the redaction class
			//hasn't been applied to what becomes sampleEl.  It gets applied in the subclass when this returns
			//therefore here it looks just like a highlight.
			if (me.record.get('Class') === 'Highlight') {

				if (me.isModifiable && style !== 'suppressed') {

					if (!me.self.bgcolor[me.record.get('Class')]) {
						me.self.bgcolor[me.record.get('Class')] = {};
						sampleEl = me.compElements.first();
						me.self.bgcolor[me.record.get('Class')].normal = sampleEl.getStyle('background-color');
						sampleEl.addCls(me.mouseOverCls);
						me.self.bgcolor[me.record.get('Class')].hover = sampleEl.getStyle('background-color');
						sampleEl.removeCls(me.mouseOverCls);
					}
					//me.compElements.setStyle('background-color','transparent');
					me.canvas = me.createCanvas();
				}
			}
		}

		if (!me.canvas) {
			return me.resolveVerticalLocation();
		}

		if (!me.content || !me.content.dom) {
			try {
				me.content = Ext.get(me.doc.getElementById('NTIContent')).first();
			} catch (e) {
				console.log('no content');
			}
		}

		range = (!range || range.collapsed) ? me.buildRange() : range;
		bounds = range.getBoundingClientRect();
		boundingTop = Math.ceil(bounds.top);
		boundingLeft = Math.ceil(bounds.left);
		boundingHeight = Math.ceil(bounds.height);
		boundingWidth = Math.ceil(bounds.width); // Seemed more appropriate than content width
		Ext.fly(me.canvas).setXY([
									 boundingLeft - leftOffset,
									 boundingTop - topOffset
								 ]);
		Ext.fly(me.canvas).set({
								   width: boundingWidth + (leftOffset * 2),
								   height: boundingHeight + (topOffset * 2)
							   });


		if (me.compElements.first().hasCls(me.mouseOverCls)) {
			state = 'hover';
		}

		//for measurement purposes, make a range that responds to measurement requests but uses the spans instead of the
		//range rects, which appear to be buggy.
		fakeRectRange = {
			getBoundingClientRect: function() {
				return range.getBoundingClientRect();
			},
			endContainer: range.endContainer,
			getClientRects: function() {
				var r = [];
				me.compElements.each(function(e) {
					if (e.dom) {
						if (e.up('.' + me.highlightCls)) {
							return;
						}
						r.push.apply(r, e.dom.getClientRects());
					}
				});
				return r;
			}
		};

		if (Ext.is.iOS) {
			//bug in iOS7 that makes html elements relative to the full page height 20px to tall.
			//Scroll before drawing canvas, to keep canvas from being shifted 20px up from where it should be
			window.scrollTo(0, 0);
		}

		var colorSpec = AnnotationUtils.colorsForName(this.highlightColorName);

		boundingTop = AnnotationUtils.drawCanvas(me.canvas,
												 me.content, fakeRectRange, colorSpec || me.self.bgcolor[me.record.get('Class')][state],
												 [leftOffset, topOffset]);


		me.range = range;

		return boundingTop || me.resolveVerticalLocation();
	},


	createCanvas: function() {

		var id = 'annotation-container',
				doc = this.doc,
				body = this.doc.getElementById('NTIContent'),
				cnt = doc.getElementById(id);

		if (!cnt) {
			cnt = doc.createElement('div');
			cnt.setAttribute('id', id);
			body.parentNode.insertBefore(cnt, body);
		}

		return this.createElement(
				'canvas', cnt,
				'highlight-canvas');
	},


	createCounter: function(after) {
		var el = Ext.get(this.createNonAnchorableSpan()),
				style = this.record.get('style') || 'plain';

		el.addCls([this.highlightCls, 'counter', style]);//,'with-count']);
		el.on('click', this.onClick, this);
		after.appendChild(el.dom);
		return el.dom;
	},


	isInlineElement: function(node) {
		return {
			none: true,
			inline: true,
			'': true
			//Do not include "inline-(block|table)"
		}[getComputedStyle(node).display];
		//getComputedStyle === $$$$
		//return !this.self.blockElementRe.test(node.nodeName);
	},


	validToWrapEntireNode: function(node) {
		var ntiInline;
		if (node.nodeType === node.TEXT_NODE) {
			return true;
		}
		if (node.nodeType === node.ELEMENT_NODE) {
			if (node.childNodes.length === 0) {
				return true;
			}
			if (node.tagName === 'P') {
				return false;
			}

			ntiInline = this.isInlineElement(node);
			if (ntiInline) {
				return true;
			}

			if (node.className.indexOf && (
					node.className.indexOf('mathjax') >= 0 ||
					node.className.indexOf('mathquill') >= 0) &&
					node.className.indexOf('link-button') < 0) {
				return true;
			}
		}
		return false;
	},


	onClick: function(e) {
		if (this.ownerCmp.getAnnotations().getSelection() || !this.isModifiable) {
			return;
		}

		e.stopEvent();
		var p = this.callParent(arguments);

		this.ownerCmp.getAnnotations().clearSelection();
		//the note overlay is listening on iframe-mouseup to enable showing the add note icons
		//since we stop the mouse event manually fire it so we can still add notes
		this.ownerCmp.fireEvent('iframe-mouseup');
		return p;
	},



	wrapRange: function(node, range) {
		var nodeList = [],
				newRange,
				nodeRange = node.ownerDocument.createRange(),

				startToStart,
				startToEnd,
				endToStart,
				endToEnd,

				BEFORE = -1,
				SAME = 0,
				AFTER = 1,

				valid,
				display;

		nodeRange.selectNodeContents(node);
		startToStart = nodeRange.compareBoundaryPoints(Range.START_TO_START, range);
		startToEnd = nodeRange.compareBoundaryPoints(Range.START_TO_END, range);
		endToStart = nodeRange.compareBoundaryPoints(Range.END_TO_START, range);
		endToEnd = nodeRange.compareBoundaryPoints(Range.END_TO_END, range);

		valid = this.validToWrapEntireNode(node);

		//Easy case, the node is completely surronded and valid, wrap the node
		if ((startToStart === AFTER || startToStart === SAME) &&
			(endToEnd === BEFORE || endToEnd === SAME) && valid) {
			newRange = node.ownerDocument.createRange();
			newRange.selectNode(node);
			nodeList.push(this.doWrap(newRange));
		}

		//If the node overlaps with the range in anyway we need to work on it's children
		else {
			Ext.each(node.childNodes, function(i) {
				nodeList.push.apply(nodeList, this.wrapRange(i, range));
			}, this);

			if (node.childNodes.length === 0) {

				if (startToStart === BEFORE && (endToEnd === BEFORE || endToEnd === SAME)) {
					newRange = this.doc.createRange();
					newRange.setStart(range.startContainer, range.startOffset);
					newRange.setEndAfter(node);
					range = newRange;
				}
				else if (endToEnd === AFTER && (startToStart === AFTER || startToStart === SAME)) {
					newRange = this.doc.createRange();
					newRange.setStartBefore(node);
					newRange.setEnd(range.endContainer, range.endOffset);
					range = newRange;
				}


				if (startToEnd !== BEFORE && endToStart !== AFTER) {
					nodeList.push(this.doWrap(range));
				}
			}
		}
		return Ext.Array.clean(nodeList);
	},


	doWrap: function(range) {
		var span,
				style = this.record.get('style') || 'plain',
				s,
				rangeString = range.toString(),
				sc = range.startContainer,
				selectedNodes = RangeUtils.getSelectedNodes(range, range.commonAncestorContainer.ownerDocument);

		//This drops entire empty ranges, anything that wraps no text is thrown out.
		if (!rangeString || /^\s+$/.test(rangeString)) {
			return;
		}

		span = this.createNonAnchorableSpan();

		if (sc && !Ext.isTextNode(sc) && sc === range.endContainer) {
			try {
				s = Ext.fly(selectedNodes[0]).getStyle('display');

				if (/block/i.test(s)) {
					Ext.fly(span).setStyle({display: s});
				}
			} catch (e) {
				//   Ext.fly(span).setStyle({display:'inline-block'});
			}
		}

		span.setAttribute('class', this.highlightCls);
		Ext.fly(span).addCls(style);
		range.surroundContents(span);
		if (!span.firstChild) {
			Ext.fly(span).remove();
			return;
		}
		Ext.get(span).hover(this.onMouseOver, this.onMouseOut, this);
		if (style !== 'suppressed') {
			this.attachEvent(['click', 'mouseup'], span, this.onClick, this);
		}


		return span;
	},


	getScrollPosition: function(currentPosition) {
		var dh = 100,
				range = this.getRange(), top;

		if (range) {
			top = Math.floor(range.getBoundingClientRect().top);
			return currentPosition > top ? currentPosition - top : top - currentPosition - dh;
		}

		return 0;
	},


	unwrap: function(node) {
		var r, p = node.parentNode;

		if (node.firstChild) {
			r = node.ownerDocument.createRange();
			r.selectNode(node);
			while (node.lastChild) {
				r.insertNode(node.lastChild);
			}
		}

		p.removeChild(node);
		p.normalize();
	}
});
