Ext.define('NextThought.view.content.reader.NoteOverlay', {

	noteOverlayData: {},

	constructor: function(){
		this.on({
			scope: this,
			'content-updated': function(){
				var doc = this.getDocumentElement();
				var root = doc.querySelector('#NTIContent > .page-contents');
				var data = this.noteOverlayData;
				var r = root.getBoundingClientRect();
				data.left = r.left;
				data.width = r.width;
				data.root = root;
			},
			'afterRender': this.insertOverlay
		});

		return this;
	},


	resolveClientRects: function(node){
		if(!node){return null;}
		var doc = node.ownerDocument,
			range = doc.createRange(),
			rects;

		range.selectNode(node);
		rects = range.getClientRects();
		range.detach();
		return Array.prototype.slice.call(rects).splice(1);
	},


	insertOverlay: function(){
		var me = this,
			o = me.getAnnotationOffsets(),
			width = (o.left + o.gutter) + 'px';

		var container = {
			tag: 'div',
			cls:'note-gutter',
			style: {
				position: 'absolute',
				top: 0, left: 0,
				width: width,
				height: me.getHeight()
			},

			children: [
				{
					style: {
						position: 'absolute',
						top: 0, left: 0,
						background: 'rgba(127,127,127,0.6)',
						width: width,
						'border-bottom': '2px dotted red'
					},
					html: '&nbsp;'
				}
			]
		};
		container = Ext.DomHelper.insertAfter(me.body.first(),container);
		me.noteOverlayData.inputBox = container.firstChild;

		me.on({
			destroy: function(){ Ext.fly(container).remove(); },
			'sync-height': function(h){ Ext.get(container).setHeight(h); }
		});

		this.mon(Ext.get(container),{
			scope: this,
			mousemove: me.noteOverlayMouseOver,
			mouseover: me.noteOverlayMouseOver
		});
	},



	resolveNodeAt: function(y){

		function firstElementOnLine(y,data,o){
			var right = data.width,
				el = null;
			while(right > data.left && (!el || el === data.root || !Ext.fly(data.root).contains(el))){
				el = doc.elementFromPoint(right,y);
				right -= 2;
			}
			return el;
		}

		function findBlockParent(e){
			if(!e || e===data.root){return null;}
			var d = doc.defaultView.getComputedStyle(e).getPropertyValue('display');
			if(re.test(d)){
				return findBlockParent(e.parentNode);
			}
			return e;
		}

		var doc = this.getDocumentElement();
		var data = this.noteOverlayData;
		var e = firstElementOnLine(y,data,this.getAnnotationOffsets());

		var re = /(inline.*)|(none)|(fixed)/i;

		var o = e;
		e = findBlockParent(e);

		return Ext.fly(data.root).contains(e)
				? e
				: null;
	},


	isCloseToMiddle: function(y,rect){
		var m = rect.top + (rect.height/2);
		return Math.abs((m - y)/rect.height) < 1;
	},


	findLine: function(y,node){
		var rects = this.resolveClientRects( node );
		var i=0;
		for(; i<rects.length; i++){
			if(this.isCloseToMiddle(y,rects[i])){
				return rects[i];
			}
		}
		return null;
	},


	noteOverlayMouseOver: function(evt,t){
		evt.stopEvent();

		var doc = this.getDocumentElement();
		var data = this.noteOverlayData;
		var o = this.getAnnotationOffsets(),
			y = evt.getY() - o.top,
			b = data.inputBox,
			s = doc.parentWindow.getSelection(),
			n = this.resolveNodeAt(y);

		var r = doc.createRange();
		try {
			var a = this.findLine(y,n);
			r.selectNode( n );
			Ext.get(b).setHeight(a.height).setY(a.top + o.top).hide().show();
		}
		catch(e){}

		s.removeAllRanges();
		if(!r.collapsed){
			s.addRange(r);
		}
	}
});
