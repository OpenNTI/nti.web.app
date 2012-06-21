Ext.define('NextThought.view.annotations.RedactionHighlight', {
	extend:'NextThought.view.annotations.Annotation',
	alias: 'widget.redaction-highlight-annotation',
	requires:[
		'NextThought.cache.IdCache'
	],


	constructor: function(selection, record, component){
		var me = this,
			expImg;

		me.callParent([record, component]);

		Ext.apply(me,{
			selection: selection,
			rendered: false,
			renderPriority: 2,
			redactionsShown: false, //current state of hiding or unhiding, initially they are hid
			redactionSpans: [] //the spans that have been redacted are stored here for hide/unhide later
		});

		expImg = me.createImage(
			Ext.BLANK_IMAGE_URL,
			me.div,
			'action',
			'expanded',
			'visibility:hidden;'
		);
		this.expandedSrc = expImg.src;
		this.collapsedSrc = me.img.src;


		me.div.removeChild(expImg);
		return me;
	},

	getItemId: function(){return this.id; },
	isXType: function(){return false;},
	getEl: function(){return Ext.get(this.img);},
	getPosition: function(){
		return Ext.fly(this.img).getXY();
	},


	getColor: function(){
		return 'transparent';
	},


	getRects: function(){
		var rects = [],
			list = this.selection.getClientRects(),
			i=list.length-1,
			cont = Ext.get(this.ownerCmp.getIframe()),
			pos = cont.getXY();

		for(;i>=0; i--){ rects.push( this.adjustCoordinates(list[i],pos) ); }

		return rects.reverse();
	},


	adjustCoordinates: function(rect,offsetToTrim){
		var x = offsetToTrim[0]!==undefined ? offsetToTrim[0] : offsetToTrim.left,
			y = offsetToTrim[1]!==undefined ? offsetToTrim[1] : offsetToTrim.top;

		return {
			top: rect.top+y,
			left: rect.left+x,
			width: rect.width,
			height: rect.height,
			right: rect.left+x+rect.width,
			bottom: rect.top+y+rect.height
		};
	},


	attachRecord: function(record){
		var me = this,
			i = record.getId(),
			id = IdCache.getComponentId(i, null, me.prefix);

		me.callParent(arguments);

		if (!record.phantom && !Ext.ComponentManager.get(id)) {
			me.id = id;
			Ext.ComponentManager.register(me);
		}
	},


	buildMenu: function(){
		console.log('building menu...');
		var me = this,
			items = [],
			r = me.record,
			text = r.get('text');

		if(this.isModifiable) {
			items.push({
					text : (r.phantom?'Save':'Delete')+' Redaction',
					handler: Ext.bind(r.phantom? me.savePhantom : me.remove, me)
				});
		}

		if (!this.redactionsShown) {
			items.push({
				text : 'Show Redaction',
				handler: function(){
					console.log('user wants to show redaction!  Whoop!');
					me.unRedact();
				}
			});
		}
		else {
			items.push({
				text : 'Hide Redaction',
				handler: function(){
					console.log('user wants to hide redaction!  Whoop!');
					me.reRedact();
				}
			});
		}

		return this.callParent([items]);
	},


	cleanup: function(){
		if(!this.selection){
			return;
		}
		this.unRedact();  //always show hidden content on delete.
		if (!this.record.phantom){Ext.ComponentManager.unregister(this);}
		delete this.selection;
		this.callParent(arguments);
	},


	render: function() {
		if(!this.selection){
			this.cleanup();
			return;
		}

		this.callParent();

		if (!this.rendered) {

		var nib = Ext.get(this.img),
			r = this.selection.getBoundingClientRect(),
			ox = (this.offsets.left+60)-(nib.getWidth()/2);

		//move nib
		nib.setStyle({
			left: ox+'px',
			top: r.top +'px'
		});
			this.redactionSpans = this.renderRedaction(this.selection.commonAncestorContainer, this.selection);
			this.rendered = true;
		}


	},


	unRedact: function(){
		Ext.each(this.redactionSpans, function(s){
			s.show();
		}, this);
		this.img.setAttribute('src', this.expandedSrc);
		this.redactionsShown = true;
		this.ownerCmp.doComponentLayout();
	},


	reRedact: function(){
		Ext.each(this.redactionSpans, function(s){
			s.setVisibilityMode(Ext.Element.DISPLAY);
			s.hide();
		}, this);
		this.img.setAttribute('src', this.collapsedSrc);
		this.redactionsShown = false;
		this.ownerCmp.doComponentLayout();
	},


	renderRedaction: function(node, range){
		var i, partialRange, redactionList = [], n;

		if (!node) {
			console.error('No node found, stopping redaction render', arguments);
			return;
		}

		var rangeComparison = this.rangeCompareNode(range, node);

		//Easy case, the node is completely surronded by the highlight
		//wrap the node in a highlight
		if(rangeComparison === 2){
			//If this is a text node we want to wrap it in a span
			if(node.nodeType === 3){
				var rangeAroundNode = this.rangeForNode(node);
				redactionList.push(this.wrapRangeInHighlight(rangeAroundNode, this.record));
			}
			else{
				redactionList.push(this.highlightElementNode(node));
			}

		}
		//If the node overlaps with the range in anyway we need to work on it's children
		else if(rangeComparison === 5 || rangeComparison === 1 || rangeComparison === 3){
			var children = [];
			for(i = 0; i < node.childNodes.length; i++){
				children.push(node.childNodes[i]);
			}
			if(children.length > 0){
				for(i = 0; i < children.length; i++){
					Ext.Array.insert(redactionList, 0, this.renderRedaction(children[i], range));
				}
			}
			else{
				if(rangeComparison === 5){
					if(node.nodeType === 3){
						redactionList.push(this.wrapRangeInHighlight(range, this.record));
					}
					else{
						redactionList.push(this.highlightElementNode(node));
					}
				}
				else if(rangeComparison === 1){
					partialRange = this.doc.createRange();
					partialRange.setStart(range.startContainer, range.startOffset);
					partialRange.setEndAfter(node);
					redactionList.push(this.wrapRangeInHighlight(partialRange, this.record));
				}
				else{
					//3
					partialRange = this.doc.createRange();
					partialRange.setStartBefore(node);
					partialRange.setEnd(range.endContainer, range.endOffset);
					redactionList.push(this.wrapRangeInHighlight(partialRange, this.record));
				}
			}
		}
		return redactionList;
	},

	/*
	 Adapted From https://developer.mozilla.org/en/DOM/range.compareNode

	 NODE_COMPLETELY_BEFORE = 0
		Node starts and ends before the range
	 NODE_STARTS_BEFORE_ENDS_IN = 1
		Node starts before the Range but ends in it
	 NODE_INSIDE = 2
		Node start and ends in the range
	 NODE_STARTS_IN_ENDS_AFTER = 3
		Node starts during the range but ends after it
	 NODE_COMPLETELY_AFTER = 4
		Node starts before and ends after the Range
	 NODE_ENCLOSES = 5
		Node starts before the range and ends after the range
	 */
	rangeCompareNode: function(highlightRange, node) {
		var nodeRange = this.rangeForNodeContents(node);

		var nodeStartToHighlightStart = nodeRange.compareBoundaryPoints(Range.START_TO_START, highlightRange);
		var nodeStartToHighlightEnd = nodeRange.compareBoundaryPoints(Range.END_TO_START, highlightRange);
		var nodeEndToHighlightStart = nodeRange.compareBoundaryPoints(Range.START_TO_END, highlightRange);
		var nodeEndToHighlightEnd = nodeRange.compareBoundaryPoints(Range.END_TO_END, highlightRange);

		if(nodeEndToHighlightStart < 0){
			return 0; //node completely before
		}
		else if(nodeStartToHighlightStart < 0 && nodeEndToHighlightStart > 0 && nodeEndToHighlightEnd <= 0){
			return 1; //node starts before ends in
		}
		else if(nodeStartToHighlightStart >= 0 && nodeStartToHighlightEnd < 0 && nodeEndToHighlightEnd > 0){
			return 3; //node starts in ends after
		}
		else if(nodeStartToHighlightEnd > 0){
			return 4; //node is after
		}
		else if(nodeStartToHighlightStart <= 0 && nodeEndToHighlightEnd >= 0){
			return 5; //node encloses range
		}
		else{
			return 2; //node inside range
		}

	},

	rangeForNodeContents: function(node){
		var nodeRange = node.ownerDocument.createRange();
		nodeRange.selectNodeContents(node);
		return nodeRange;
	},


	rangeForNode: function(node){
		var nodeRange = node.ownerDocument.createRange();
		nodeRange.selectNode(node);
		return nodeRange;
	},

	wrapRangeInHighlight: function(range, highlight)
	{
		var highlightSpan = this.doc.createElement("span");
		highlightSpan.setAttribute('style', 'display:none;');
		highlightSpan.setAttribute('data-non-anchorable', 'true');
		//highlightSpan.setAttribute("class", highlightClassesForHighlight(highlight).join(" "));
		//highlight.appendCreatedNode(highlightSpan);
		range.surroundContents(highlightSpan);
		return Ext.get(highlightSpan);
	},

	highlightElementNode: function(node)
	{
		var n = Ext.get(node);
		n.setStyle('display', 'none');
		return n;
	}
});
