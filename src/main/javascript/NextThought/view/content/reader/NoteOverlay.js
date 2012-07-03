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
		rects = Array.prototype.slice.call(range.getClientRects());
		range.detach();
		return rects.length > 1 ? rects.splice(1) : rects;
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

		var rects = this.resolveClientRects( node )||[];
		var i=0;
		for(; i<rects.length; i++){
			if(this.isCloseToMiddle(y,rects[i])){
				return {
					rect: rects[i],
					range: this.buildRangeFromRect(rects[i],node)
				};
			}
		}
		return null;
	},


	buildRangeFromRect: function(rect, node){
		var s = this.getDocumentElement().parentWindow.getSelection(),
				r, c = 0;

		function is(rectA,rectB){
			return rectA.top === rectB.top
				&& rectA.height === rectB.height;
		}

		s.removeAllRanges();
		s.selectAllChildren(node);
		s.collapseToStart();
		s.modify('extend', 'forward', 'line');

		while(!r) {
			r = s.getRangeAt(0);
			if(is(r.getClientRects()[0],rect)){
				return r;
			}
			if(!Ext.fly(node).contains(r.startContainer)){
				console.log('overextended');
				break;
			}
			r = null;

			s.modify('move', 'forward', 'line');
			s.modify('extend', 'forward', 'line');
		}
	},


	noteOverlayMouseOver: function(evt,t){
		evt.stopEvent();

		var data = this.noteOverlayData;
		var o = this.getAnnotationOffsets(),
			y = evt.getY() - o.top,
			b = data.inputBox,
			n = this.resolveNodeAt(y),
			a;

		try {
			a = this.findLine(y,n);
			if(a){
				Ext.get(b).setHeight(a.rect.height).setY(a.rect.top + o.top).hide().show();
			}
		}
		catch(e){
			console.warn(Globals.getError(e));
		}
	}
});
