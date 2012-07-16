Ext.define('NextThought.view.annotations.Highlight', {
	extend:'NextThought.view.annotations.Base',
	alias: 'widget.highlight',
	requires:[
		'NextThought.util.Anchors',
		'NextThought.util.Rects',
		'Ext.util.TextMetrics'
	],

	highlightCls: 'application-highlight',
	mouseOverCls: 'highlight-mouse-over',

	constructor: function(config){
		this.callParent(arguments);
		if (config.browserRange) {
			this.range = config.browserRange;
		}
		this.content = Ext.fly(this.doc.getElementById('NTIContent')).first(false,true);
		try {
			this.getRange(); //get range right her up front, this won't render it yet.
		}
		catch (e) {
			//don't die constructor:
			console.error(Globals.getError(e));
		}

		//console.log('build highlight for',this.getRecordField('selectedText'));
		return this;
	},


	getRange: function(){
		if(!this.range){
			//console.warn('GET RANGE FOR:', this.getRecordField('applicableRange').getStart().getContexts()[0].getContextText());
			this.range = Anchors.toDomRange(this.getRecordField('applicableRange'),this.doc);
			if(!this.range){
				console.log('bad range?', this.getRecordField('applicableRange'));
				Ext.Error.raise('bad range? '+Ext.encode(this.getRecordField('applicableRange')));
			}
		}
		return this.range;
	},


	cleanup: function(){
		if (this.rendered) {
			var c = this.rendered.slice();
			this.rendered = [];

			if( this.range ){
				this.range.detach();
				delete this.range;
			}

			Ext.fly(this.canvas).remove();
			Ext.fly(this.counter).remove();
			Ext.each(c,this.unwrap,this);
		}
		return this.callParent(arguments);
	},


	getLineHeight: function(){
		var s = this.getRange(), m,
			n = s.commonAncestorContainer;

		if(n.nodeType===n.TEXT_NODE){
			n = n.parentNode;
		}
		m = new Ext.util.TextMetrics(n);
		return m.getHeight("TEST");
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


	render: function(){
		var style = this.record.get('style'),
			range = this.getRange(),
			bounds = range.getBoundingClientRect(),
			boundingTop = Math.ceil(bounds.top),
			boundingLeft = Math.ceil(bounds.left),
			boundingHeight = Math.ceil(bounds.height),
			width = Ext.fly(this.content).getWidth(),
			topOffset = 10,
			leftOffset = 5,
			ctx,
			adjustment,
			lineHeight = this.getLineHeight(),
			x, y, w, h, left, r, i, s = [], nr,
			lastY=0, c, small,
			padding = 2,
			last = true,
			offset,
			walker = document.createTreeWalker(range.commonAncestorContainer);

		walker.currentNode = range.startContainer;
		offset = range.startOffset;

		while (walker.currentNode != range.endContainer) {
			nr = document.createRange();
			nr.setStart(walker.currentNode,offset);
			nr.setEnd(walker.currentNode,99999);
			s = s.concat(RectUtils.merge(nr.getClientRects(),lineHeight,width+1));
		}

		if(style === 'suppressed'){
			return boundingTop;
		}

		if(!this.rendered){
			this.rendered = this.wrapRange(range.commonAncestorContainer, range);
			this.counter = this.createCounter(this.rendered.last());
			//create a composite element so we can do lots of things at once:
			this.compElements = new Ext.dom.CompositeElement(this.rendered);
			this.compElements.add(this.counter);
			this.canvas = this.createCanvas();
		}


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

		i = s.length - 1;
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

			if(last){
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
							w -= 8;
							ctx.beginPath();
							ctx.moveTo(x+w,y);
							ctx.lineTo(x+w,y+h);
							ctx.lineTo(x+w+8,y);
							ctx.lineTo(x+w,y);
						}
			//TODO: clamp to 24px tall (centered in the rect)
			ctx.fillRect( x, y, w, h);

			last = false;
			lastY = y;
		}

		return boundingTop;
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

		a = this.createElement(
			'canvas', cnt,
			'highlight-canvas');
		cnt.style.zIndex = 1;
		return a
	},


	createCounter: function(after){
		var containingSpan = Ext.get(this.createNonAnchorableSpan()),
			el = Ext.get(this.createNonAnchorableSpan()),
			afterWords = after.innerHTML.trim().split(' '),
			style = this.record.get('style') || 'plain';

		this.rendered.push(containingSpan.dom);

		containingSpan.update(afterWords.pop());
		Ext.fly(after).update(afterWords.join(' ') + ' ');
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
		startToEnd = nodeRange.compareBoundaryPoints(Range.START_TO_END, range);
		endToStart = nodeRange.compareBoundaryPoints(Range.END_TO_START, range);
		endToEnd = nodeRange.compareBoundaryPoints(Range.END_TO_END, range);


		//Easy case, the node is completely surronded, wrap the node
		if( ( startToStart === AFTER || startToStart === SAME )
			&& ( endToEnd === BEFORE || endToEnd === SAME ) ) {
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


	doWrap: function(range) {
		var span = this.createNonAnchorableSpan(),
			style = this.record.get('style') || 'plain';

		span.setAttribute('class', this.highlightCls);
		Ext.fly(span).addCls(style);


		range.surroundContents(span);
		Ext.fly(span).hover(this.onMouseOver,this.onMouseOut,this);
		Ext.fly(span).on('click',this.onClick,this);
		return span;
	},


	unwrap: function(node) {
		var r, p = node.parentNode;

		Ext.fly(node).un('click',this.onClick,this);

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
