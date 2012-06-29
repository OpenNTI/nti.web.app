Ext.define('NextThought.view.annotations.Highlight', {
	extend:'NextThought.view.annotations.Annotation',
	alias: 'widget.highlight',
	requires:[
		'NextThought.util.Anchors',
		'NextThought.util.Rects',
		'Ext.util.TextMetrics'
	],

	constructor: function(config){
		this.callParent(arguments);
		this.content = Ext.fly(this.doc.getElementById('NTIContent')).first(false,true);
		this.fillColor = '#e1f4fe';
		return this;
	},


	getRange: function(){
		if(!this.range){
			this.range = Anchors.toDomRange(this.getRecordField('applicableRange'),this.doc);
		}
		return this.range;
	},


	cleanup: function(){
		var c = this.rendered.slice();
		this.rendered = [];
		Ext.fly(this.canvas).remove();
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
//		this.render();
	},
	onMouseOut: function(){
//		this.render();
	},


	render: function(){
		var range = this.getRange(),
			bounds = range.getBoundingClientRect(),
			width = Ext.fly(this.content).getWidth(),
			topOffset = 10,
			leftOffset = 5,
			ctx,
			s = RectUtils.merge(range.getClientRects(),this.getLineHeight(),width+1),
			i = s.length-1;

		if(!this.rendered){
			this.rendered = this.wrapRange(range.commonAncestorContainer, range);
			//create a composite element so we can do lots of things at once:
			this.compElements = new Ext.dom.CompositeElement(this.rendered);
			this.canvas = this.createCanvas();
		}


		Ext.fly(this.canvas).setXY([bounds.left-leftOffset,bounds.top-topOffset]);
		Ext.fly(this.canvas).set({ width: width+leftOffset, height: bounds.height+topOffset });

		ctx = this.canvas.getContext('2d');
		ctx.fillStyle = this.fillColor;
		for(; i>=0; i--){
			ctx.fillRect(
					s[i].left - bounds.left + leftOffset - 2,
					s[i].top - bounds.top + topOffset -2,
					s[i].width + 4,
					s[i].height + 4
			);
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
		var span = this.doc.createElement('span');
		span.setAttribute('data-non-anchorable', 'true');
		span.setAttribute('class', 'application-highlight');

		range.surroundContents(span);
		Ext.fly(span).on({
			scope: this,
			click:this.onClick
		});
		Ext.fly(span).hover(this.onMouseOver,this.onMouseOut,this);
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
