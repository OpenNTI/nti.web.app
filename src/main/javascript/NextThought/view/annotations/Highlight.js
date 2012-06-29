Ext.define('NextThought.view.annotations.Highlight', {
	extend:'NextThought.view.annotations.Annotation',
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
		this.content = Ext.fly(this.doc.getElementById('NTIContent')).first(false,true);
		return this;
	},


	getRange: function(){
		if(!this.range){
			this.range = Anchors.toDomRange(this.getRecordField('applicableRange'),this.doc);
			if(!this.range){
				Ext.Error.raise('bad range? '+Ext.encode(this.getRecordField('applicableRange')));
			}
		}
		return this.range;
	},


	cleanup: function(){
		var c = this.rendered.slice();
		this.rendered = [];
		Ext.fly(this.canvas).remove();
		Ext.fly(this.counter).remove();
		Ext.each(c,this.unwrap,this);
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

		this.mouseOutTimout = setTimeout(off,500);
	},


	render: function(){
		var range = this.getRange(),
			bounds = range.getBoundingClientRect(),
			width = Ext.fly(this.content).getWidth(),
			topOffset = 10,
			leftOffset = 5,
			ctx,
			s = RectUtils.merge(range.getClientRects(),this.getLineHeight(),width+1),
			i = s.length - 1, x, left,
			last = true;

		if(!this.rendered){
			this.rendered = this.wrapRange(range.commonAncestorContainer, range);
			this.counter = this.createCounter(this.rendered.last());
			//create a composite element so we can do lots of things at once:
			this.compElements = new Ext.dom.CompositeElement(this.rendered);
			this.compElements.add(this.counter);
			this.canvas = this.createCanvas();
		}


		Ext.fly(this.canvas).setXY([bounds.left-leftOffset,bounds.top-topOffset]);
		Ext.fly(this.canvas).set({ width: width+(leftOffset*2), height: bounds.height+(topOffset*2) });

		ctx = this.canvas.getContext('2d');
		ctx.fillStyle = this.compElements.first().getStyle('background-color');
		for(; i>=0; i--){
			left = s[i].left - bounds.left + leftOffset - 2;
			x = i===0 ? left : 0;

			//TODO: clamp to 24px tall (centered in the rect)
			ctx.fillRect(
					x,
					s[i].top - bounds.top + topOffset -2,
					last ? (s[i].width + (x ? 0: left) -5 ) : (width-x),
					s[i].height + 4
			);
			last = false;
		}

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
		var el = Ext.get(this.createNonAnchorableSpan());
		el.addCls([this.highlightCls,'counter']);//,'with-count']);
		el.appendTo(after);
		el.on('click', this.onClick, this);
//		el.update('<span>0</span>');
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
		var span = this.createNonAnchorableSpan();
		span.setAttribute('class', this.highlightCls);

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
