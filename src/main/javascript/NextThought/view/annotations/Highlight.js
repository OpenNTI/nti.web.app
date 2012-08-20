Ext.define('NextThought.view.annotations.Highlight', {
	extend:'NextThought.view.annotations.Base',
	alias: 'widget.highlight',
	requires:[
		'NextThought.util.Anchors',
		'NextThought.util.Rects'
	],

	highlightCls: 'application-highlight',
	mouseOverCls: 'highlight-mouse-over',

	constructor: function(config){
		this.callParent(arguments);

		//TODO hook up browser range for speed, throw away after render
		//	this.range = config.browserRange;

		if(!this.isModifiable){
			this.highlightCls += ' shared-with-me';
		}
		return this;
	},


	getRange: function(){
		var range = Anchors.toDomRange(this.getRecordField('applicableRange'),this.doc);

		if(!range){
			console.error('bad range', this.getRecord());
			return null;
		}

		console.log(this.id,': ',(this.getRecordField('body')||[]).join('|'), ': got range from description:', range, range.toString());
		return range;
	},


	buildMenu: function(i){
		var items = [];

		if(i){
			items.push.apply(items,i);
		}

		return this.callParent([items]);
	},

	cleanup: function(){
		if (this.rendered) {
		try{
			var c = this.rendered.slice();
			this.rendered = [];

			//cleanup listeners if possible:
			try{
				this.compElements.clearListeners();
				this.compElements.clear();
			}
			catch (e) {
				//catch any exceptions if things have changed...
			}

			//canvas and counter may not exist if suppressed:
			if (this.canvas){Ext.fly(this.canvas).remove();}
			if (this.counter){Ext.fly(this.counter).remove();}

			Ext.each(c,this.unwrap,this);

		} catch(e2){
			console.error(Globals.getError(e2));
		}
		}
		return this.callParent(arguments);
	},


	onMouseOver: function(){
		clearTimeout(this.mouseOutTimout);
		if(!this.compElements.first().hasCls(this.mouseOverCls)){
			this.compElements.addCls(this.mouseOverCls);
			this.render();
		}
	},


	onMouseOut: function(){
		var me = this;
		function off(){
			me.compElements.removeCls(me.mouseOverCls);
			me.render();
		}

		this.mouseOutTimout = setTimeout(off,250);
	},


	visibilityChanged: function(show){
		var c = this.compElements;
		var fn = show ? 'addCls' : 'removeCls';
		if(c){
			c[fn].call(c,this.highlightCls);
			this.render();
		}

		return this.callParent();
	},


	buildRange: function(){
		var range = this.doc.createRange();

		if(this.rendered){
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


	resolveVerticalLocation: function(){
		var r;

		if (this.rendered){
			r = this.buildRange();
		}
		else {
			r = this.getRange();
		}

		r = r ? r.getBoundingClientRect() : null;

		return r ? r.top : -2;
	},


	render: function(){
		var range = null,
			style = this.getRecordField('style'),
			bounds,
			boundingTop,
			boundingLeft,
			boundingHeight,
			width,
			lineHeight,
			topOffset = 10,
			leftOffset = 5,
			ctx,
			adjustment,
			s, i, x, y, w, h, left, r,
			lastY=0, c, small,
			padding = 2,
			last = true;

		if(!this.rendered){
			range = this.getRange();
			if(!range){ return -1; }
			this.rendered = this.wrapRange(range.commonAncestorContainer, range);

			//don't create counter when suppressed:
			if (style !== 'suppressed'){
				this.counter = this.createCounter(this.rendered.last());
			}

			//create a composite element so we can do lots of things at once:
			this.compElements = new Ext.dom.CompositeElement(this.rendered);
			this.compElements.add(this.counter);
			//highlights that are not ours do not get a marked over treatment...so don't create the canvas
			if(this.isModifiable && style !== 'suppressed'){
				this.canvas = this.createCanvas();
			}
		}

		if(!this.canvas){return this.resolveVerticalLocation();}

		if(!this.content || !this.content.dom){
			try{
				this.content = Ext.get(this.doc.getElementById('NTIContent')).first();
			}catch(e){
				console.log('no content');
			}
		}

		range = range || this.buildRange();
		bounds = range.getBoundingClientRect() || this.getAlternateBoundingRect();
		boundingTop = Math.ceil(bounds.top);
		boundingLeft = Math.ceil(bounds.left);
		boundingHeight = Math.ceil(bounds.height);
		width = this.content ? this.content.getWidth() : 680;
		s = RectUtils.merge(range.getClientRects(),width+1);
		s.sort(function(a,b) { return a.top + a.bottom - b.top - b.bottom; });
		i = s.length - 1;


		Ext.fly(this.canvas).setXY([
			boundingLeft-leftOffset,
			boundingTop-topOffset
		]);
		Ext.fly(this.canvas).set({
			width: width+(leftOffset*2),
			height: boundingHeight+(topOffset*2)
		});

		ctx = this.canvas.getContext('2d');
		ctx.fillStyle = this.compElements.first().getStyle('background-color');
		for(; i>=0; i--){
			r = s[i];

			left = Math.ceil(r.left - boundingLeft + leftOffset - padding );
			y = Math.ceil(r.top - boundingTop + topOffset - padding );
			small = (r.width/width) < 0.5 && i===0;
			x = i===0 || small ? left : 0;
			w = last || small
					? (r.width + (x ? 0: left) + (padding*(last?1:2)) )
					: (width-x);

			h = r.height + (padding*2);
			if(!last && (Math.abs(y - lastY) < lineHeight || y > lastY )){ continue; }
			if(!last && r.height <= lineHeight) { continue; }
			//Remove some really small rects
			if(last && w < 10) {continue;}
			if (!last && h < 8) { continue;}

			if(last && !Ext.isIE9){
				c = Ext.get(this.counter);
				adjustment = this.adjustedBy || (r.top - c.getY());
				h = c.getHeight() + padding;

				if(adjustment < 2){ y += adjustment; }
				if(!this.adjusted){
					this.adjusted = true;
					this.adjustedBy = adjustment;
					return this.render();
				}
			}
			else {
				adjustment = 0;
			}

			if (last) {	
				w -= 4;
				ctx.beginPath();
				ctx.moveTo(x+w,y);
				ctx.lineTo(x+w,y+h);
				ctx.lineTo(x+w+4,y);
				ctx.fill();
			}
			//TODO: clamp to 24px tall (centered in the rect)
			ctx.fillRect( x, y, w, h);

			last = false;
			lastY = y;
		}

		return boundingTop || this.resolveVerticalLocation();
	},


	createCanvas: function(){

		var id = 'annotation-container',
			doc = this.doc,
			body = this.doc.getElementById('NTIContent'),
			cnt = doc.getElementById(id);

		if(!cnt){
			cnt = doc.createElement('div');
			cnt.setAttribute('id',id);
			body.parentNode.insertBefore(cnt,body);
		}

		var canvas = this.createElement(
			'canvas', cnt,
			'highlight-canvas');
		if (Ext.isChrome) {
			canvas.onmousedown = function(e) {
				e.preventDefault();
				e.stopPropagation();
				var me = e.target;
				me.style.visibility = "hidden";
				var evt = document.createEvent("MouseEvents");
				evt.initMouseEvent(e.type, true, true, me.ownerDocument.parentWindow, 1, e.screenX, e.screenY,e.clientX,e.clientY,false,false,false,false,0,null);
				var tgt = me.ownerDocument.elementFromPoint(e.clientX,e.clientY);
				tgt.dispatchEvent(evt);
				me.style.visibility = "visible";
			}
			canvas.onmouseup = canvas.onmousedown;
			canvas.onmouseover = canvas.onmousedown;
		}
		return canvas;
	},


	createCounter: function(after){
		var containingSpan = Ext.get(this.createNonAnchorableSpan()),
			el = Ext.get(this.createNonAnchorableSpan()),
			style = this.record.get('style') || 'plain',
			textToWrap = Anchors.lastWordFromString(after.textContent);

		this.rendered.push(containingSpan.dom);

		containingSpan.update(textToWrap);
		Ext.fly(after).update(after.textContent.replace(textToWrap, ''));
		containingSpan.addCls('counter-container');
		el.appendTo(containingSpan);
		containingSpan.appendTo(after);
			
		el.addCls([this.highlightCls,'counter', style]);//,'with-count']);
		el.on('click', this.onClick, this);
		el.update('&nbsp;');
		return el.dom;
	},

	wrapRange: function(node, range){
		var nodeList = [],
			newRange,
			nodeRange = node.ownerDocument.createRange(),

			startToStart,
			startToEnd,
			endToStart,
			endToEnd,

			BEFORE = -1,
			SAME = 0,
			AFTER = 1;

		nodeRange.selectNodeContents(node);
		startToStart = nodeRange.compareBoundaryPoints(Range.START_TO_START, range);
		startToEnd =  nodeRange.compareBoundaryPoints(Range.START_TO_END, range);
		endToStart = nodeRange.compareBoundaryPoints(Range.END_TO_START, range);
		endToEnd =  nodeRange.compareBoundaryPoints(Range.END_TO_END, range);

		var valid = false;
		if (node.nodeType === node.TEXT_NODE) { valid = true; }
		else if (node.nodeType === node.ELEMENT_NODE) {
			var display = node.ownerDocument.parentWindow.getComputedStyle(node).display;
			if (['inline','inline-block','none'].indexOf(display) >= 0) { valid = true; }
			else if (node.className.indexOf && node.className.indexOf('mathjax') >= 0) { valid = true; }
			else if (node.className.indexOf && node.className.indexOf('mathquill') >= 0) { valid = true; }
			if (node.tagName === 'P') { valid = false; }
			if (node.childNodes.length === 0) { valid = true; }
		}
		//Easy case, the node is completely surronded and valid, wrap the node
		if( ( startToStart === AFTER || startToStart === SAME )
			&& ( endToEnd === BEFORE || endToEnd === SAME ) && valid) {
				newRange = node.ownerDocument.createRange();
				newRange.selectNode(node);
				nodeList.push(this.doWrap(newRange));
		}

		//If the node overlaps with the range in anyway we need to work on it's children
		else {
			Ext.each(node.childNodes,function(i){
				nodeList.push.apply( nodeList, this.wrapRange(i, range) );
			},this);

			if(node.childNodes.length === 0){

				if(startToStart === BEFORE && ( endToEnd === BEFORE || endToEnd === SAME ) ){
					newRange = this.doc.createRange();
					newRange.setStart(range.startContainer, range.startOffset);
					newRange.setEndAfter(node);
					range = newRange;
				}
				else if(endToEnd === AFTER && (startToStart === AFTER || startToStart === SAME ) ){
					newRange = this.doc.createRange();
					newRange.setStartBefore(node);
					newRange.setEnd(range.endContainer, range.endOffset);
					range = newRange;
				}



				if(startToEnd !== BEFORE && endToStart !== AFTER) {
					nodeList.push(this.doWrap(range));
				}
			}
		}
		return nodeList;
	},


	onClick: function(e){
		if(e.getTarget('a[href]')){ return; }
		return this.callParent(arguments);
	},


	doWrap: function(range) {
		var span = this.createNonAnchorableSpan(),
			style = this.record.get('style') || 'plain';

		span.setAttribute('class', this.highlightCls);
		Ext.fly(span).addCls(style);
		range.surroundContents(span);
		Ext.get(span).hover(this.onMouseOver,this.onMouseOut,this);
		if(style !== 'suppressed'){
			this.attachEvent('click',span,this.onClick,this);
		}
		return span;
	},

	getScrollPosition: function(currentPosition){
		var el = Ext.get(this.compElements.first());
		var dh = 100;

		return currentPosition > el.getTop() ? currentPosition - el.getTop(): el.getTop() - currentPosition - dh;
	},

	unwrap: function(node) {
		var r, p = node.parentNode;

		if(node.firstChild){
			r = node.ownerDocument.createRange();
			r.selectNode(node);
			while(node.lastChild){
				r.insertNode(node.lastChild);
			}
		}

		p.removeChild(node);
		p.normalize();
	}
});
