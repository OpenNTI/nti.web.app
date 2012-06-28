Ext.define('NextThought.view.annotations.Highlight', {
	extend:'NextThought.view.annotations.Annotation',
	alias: 'widget.highlight',
	requires:[
		'NextThought.util.Anchors'
	],

	constructor: function(config){
		this.callParent(arguments);
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
		Ext.each(c,this.unwrap,this);
		return this.callParent(arguments);
	},


	render: function(){
		if(this.rendered){
			return;
		}
		var range = this.getRange();
		this.rendered = this.wrapRange(range.commonAncestorContainer, range);
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
//		span.setAttribute('data-non-anchorable', 'true');
		span.setAttribute('style', 'background: lightblue');
		range.surroundContents(span);
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
