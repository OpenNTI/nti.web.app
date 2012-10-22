Ext.define('NextThought.view.annotations.Highlight', {
	extend:'NextThought.view.annotations.Base',
	alias: 'widget.highlight',
	requires:[
		'NextThought.util.Anchors',
		'NextThought.util.Rects'
	],
	statics: {bgcolor: null},
	inheritableStatics: {blockElementRe: /^(address|blockquote|body|center|dir|div|dl|fieldset|form|h[1-6]|hr|isindex|menu|noframes|noscript|ol|p|pre|table|ul|dd|dt|frameset|li|tbody|td|tfoot|th|thead|tr|html)$/i},

	highlightCls: 'application-highlight',
	mouseOverCls: 'highlight-mouse-over',

	constructor: function(config){
		this.callParent(arguments);

		//TODO hook up browser range for speed, throw away after render
		//	this.range = config.browserRange;

		if(!this.isModifiable){
			this.highlightCls += ' shared-with-me';
		}
		this.allowShare = false;
		return this;
	},


	getRange: function(){
		var range = Anchors.toDomRange(this.getRecordField('applicableRange'),this.doc, LocationProvider.currentContent, this.getRecordField('ContainerId'));

		if(!range){
			console.error('bad range', this.getRecord());
			return null;
		}

		//console.log(this.id,': ',(this.getRecordField('body')||[]).join('|'), ': got range from description:', range, range.toString());
		Anchors.expandRangeToIncludeMath(range);
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
		var c = this.compElements,
			fn = show ? 'addCls' : 'removeCls';
		if(c){
			c[fn].call(c,this.highlightCls);
			this.render();
		}

		return this.callParent(arguments);
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
            width = this.content ? this.content.getWidth() : 680,
            topOffset = 10,
            leftOffset = 5;

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
        bounds = range.getBoundingClientRect();
        boundingTop = Math.ceil(bounds.top);
        boundingLeft = Math.ceil(bounds.left);
        boundingHeight = Math.ceil(bounds.height);
        Ext.fly(this.canvas).setXY([
            boundingLeft-leftOffset,
            boundingTop-topOffset
        ]);
        Ext.fly(this.canvas).set({
            width: width+(leftOffset*2),
            height: boundingHeight+(topOffset*2)
        });

		//Right now this is static for all highlights so we cache it and save
		//some expensive getComputedStyle calls
		if(!this.self.bgcolor){
			this.self.bgcolor = this.compElements.first().getStyle('background-color');
		}

		boundingTop = AnnotationUtils.drawCanvas(this.canvas,
            this.content, range, this.self.bgcolor,
            [leftOffset, topOffset]);


        this.range = range;

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
		var el = Ext.get(this.createNonAnchorableSpan()),
			style = this.record.get('style') || 'plain';

		el.addCls([this.highlightCls,'counter', style]);//,'with-count']);
		el.on('click', this.onClick, this);
		el.update('&nbsp;');
        after.appendChild(el.dom);
		return el.dom;
	},

	isInlineElement: function(node){
		//getComputedStyle === $$$$
		//return ['inline','inline-block','none'].indexOf(Ext.fly(node).getStyle('display')) >= 0;
		return !this.self.blockElementRe.test(node.nodeName);
	},

	validToWrapEntireNodeFaster: function(node){
		var ntiInline;
        if (node.nodeType === node.TEXT_NODE) { return true; }
        if (node.nodeType === node.ELEMENT_NODE) {
            if (node.childNodes.length === 0) { return true; }
            if (node.tagName === 'P') { return false; }

			ntiInline = this.isInlineElement(node);
			if(ntiInline){return true;}
            if(node.className.indexOf && (node.className.indexOf('mathjax') >= 0 || node.className.indexOf('mathquill') >= 0)){
				return true;
            }
        }
        return false;
    },


    validToWrapEntireNode: function(node){
        var valid = false, display;

        if (node.nodeType === node.TEXT_NODE) { valid = true; }
        else if (node.nodeType === node.ELEMENT_NODE) {
            display = node.ownerDocument.parentWindow.getComputedStyle(node).display;
            if (['inline','inline-block','none'].indexOf(display) >= 0) { valid = true; }
            else if (node.className.indexOf && node.className.indexOf('mathjax') >= 0) { valid = true; }
            else if (node.className.indexOf && node.className.indexOf('mathquill') >= 0) { valid = true; }
            if (node.tagName === 'P') { valid = false; }
            if (node.childNodes.length === 0) { valid = true; }
        }

        return valid;
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
			AFTER = 1,

			valid,
			display;

		nodeRange.selectNodeContents(node);
		startToStart = nodeRange.compareBoundaryPoints(Range.START_TO_START, range);
		startToEnd =  nodeRange.compareBoundaryPoints(Range.START_TO_END, range);
		endToStart = nodeRange.compareBoundaryPoints(Range.END_TO_START, range);
		endToEnd =  nodeRange.compareBoundaryPoints(Range.END_TO_END, range);

		valid = this.validToWrapEntireNodeFaster(node);

		//Easy case, the node is completely surronded and valid, wrap the node
		if(( startToStart === AFTER || startToStart === SAME )
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
		if(e.getTarget('a[href]') && e.button === 0){
			return null;
		}
		e.stopEvent();
		this.doc.parentWindow.getSelection().removeAllRanges();
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
			this.attachEvent(['click','mouseup'],span,this.onClick,this);
		}
		return span;
	},

	getScrollPosition: function(currentPosition){
		var dh = 100,
			range = this.getRange(), top;

		if(range){
			top = Math.floor(range.getBoundingClientRect().top);
			return currentPosition > top ? currentPosition - top: top - currentPosition - dh;
		}

		return 0;
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
