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
		if (config.browserRange) {
			this.range = config.browserRange;
			this.setupInvalidationFallback();
		}

		if(!this.isModifiable){
			this.highlightCls += ' shared-with-me';
		}

		this.getRange(); //get range right her up front, this won't render it yet.
		//console.log('build highlight for',this.getRecordField('selectedText'));
		return this;
	},


	setupInvalidationFallback: function(){
		if (this.range && !this.hadRange){
			this.invalidatedRange = this.range.cloneRange();
			this.invalidateRangeString = this.range.toString();

			//remember that we've been here before:
			this.hadRange = true;
		}
	},


	getRange: function(){
		if(this.range && this.range.collapsed){
			this.range.detach();
			delete this.range;
			console.log('cleaning up collapsed range');
		}


		if(!this.range){
			//console.warn('GET RANGE FOR:', this.getRecordField('applicableRange').getStart().getContexts()[0].getContextText());
			this.range = Anchors.toDomRange(this.getRecordField('applicableRange'),this.doc);
			console.log(this.id,': ',(this.get('body')||[]).join('|'), ': got range from description:', this.range);

			//TODO - there is most definitly a better and more complicated way to solve this, however in the interest of time,
			//we will make a best guess if our range gets borked.
			//So if this range is just now created, remember some stuff for later in case it gets collapsed by other things in the dom.
			this.setupInvalidationFallback();


			try {
				//If we have been here before and our range is a goner, commence freak out:
				if (!this.range && this.hadRange){
					//TODO - find a way to get rid of this..
					//now we know we are fubared, someone fashion a new range:
					console.warn('Existing valid range object is messed up by something in the dom, falling back to semi-wild guessing.');
					var parentTextNodes = AnnotationUtils.getTextNodes(this.invalidatedRange.commonAncestorContainer.parentNode),
						newRange = this.doc.createRange(),
						foundSubstring = -1;

					//create a new range selecting the parent of the old range as a best guess:
					newRange.selectNode(this.invalidatedRange.commonAncestorContainer.parentNode);

					//try to find a text node in there that kind of matches:
					Ext.each(parentTextNodes, function(n){
						foundSubstring = n.textContent.indexOf(this.invalidateRangeString.substr(0, 8));
						if (foundSubstring > -1){
							//this node kind of matches, just cobble a range out of this, if these comments make you nervous, they should...
							newRange.setStart(n, foundSubstring);
							newRange.setEnd(n, foundSubstring + 8);

							this.range = newRange;
							return false;
						}
					}, this);
				}
			}
			catch (e){
				console.log('what?', e.message, e.stack);
			}


			if(!this.range){
				console.log('bad range?',
					this.getRecordField('applicableRange'),
					'hadRange:',this.hadRange
				);

			}
		}
		return this.range;
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

			if( this.range ){
				this.range.detach();
				delete this.range;
			}

			//cleanup listeners if possible:
			try{
				this.compElements.clearListeners();
				this.compElements.clear();
			}
			catch (e) {
				console.warn('tried to clear something', Globals.getError(e));
			}

			if (this.canvas){Ext.fly(this.canvas).remove();}
			Ext.fly(this.counter).remove();
			Ext.each(c,this.unwrap,this);

		} catch(e2){
			console.error(Globals.getError(e2));
		}
		}
		return this.callParent(arguments);
	},


	getLineHeight: function(){
		if(!this.rendered){
			return 17;//default
		}

		return parseInt(this.compElements.first().getStyle('line-height'),10);
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
		var range = this.getDocumentElement().createRange();

		if(this.rendered){
			try {
				range.setStartBefore(this.rendered.first());
				range.setEndAfter(this.rendered.last());
			}
			catch (e) {
				console.log('rendered', this.rendered);
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
		var range,
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
			this.counter = this.createCounter(this.rendered.last());
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

		range = this.buildRange();
		bounds = range.getBoundingClientRect() || this.getAlternateBoundingRect();
		boundingTop = Math.ceil(bounds.top);
		boundingLeft = Math.ceil(bounds.left);
		boundingHeight = Math.ceil(bounds.height);
		width = this.content ? this.content.getWidth() : 680;
		lineHeight = this.getLineHeight();
		s = RectUtils.merge(range.getClientRects(),lineHeight,width+1);
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
			//Remove the possibility of a "just the triangle" line at the end
			if(last && w < 10) {continue;}

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

		return this.createElement(
			'canvas', cnt,
			'highlight-canvas');
	},


	createCounter: function(after){
		var containingSpan = Ext.get(this.createNonAnchorableSpan()),
			el = Ext.get(this.createNonAnchorableSpan()),
			afterWords = after.textContent.split(' '),
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
