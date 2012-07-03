Ext.define('NextThought.view.content.reader.NoteOverlay', {

	noteOverlayData: {},

	constructor: function(){
		this.on({
			scope: this,
			'content-updated': this.resolveNewClientRects,
			'afterRender': this.insertOverlay
		});

		return this;
	},


	resolveNewClientRects: function(){
		var doc = this.getDocumentElement(),
			range = doc.createRange(),
			old = this.noteOverlayData.range,
			n = doc.querySelector('#NTIContent > .page-contents');

		if(old){ old.detach(); }

		range.selectNode(n);
		this.noteOverlayData.range = range;
		this.noteOverlayData.bound = n;
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
						height: '20px',
						'border-bottom': '2px dotted red'
					}
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


	isNotablePlace: function(rect){
		return true;
	},


	findRect: function (y, direction){
		var r = Array.prototype.slice.call(this.noteOverlayData.range.getClientRects());
		var i = r.length-1;
		var sign = direction ? -1 : 1;
		Ext.Array.sort(r,function(a,b){
			var ab = a.bottom;
			var bb = b.bottom;
			return sign*(ab === bb
					? 0
					: ab < bb
						?  1
						: -1);
		});

		for(; i>=0; i--){
			if((direction && r[i].bottom < y)
			|| (!direction && r[i].top > y)){
				break;
			}
		}

		if(!this.isNotablePlace(r[i])){
			return null;
		}

		return r[i];
	},

	noteOverlayMouseOver: function(evt,t){
		evt.stopEvent();

		var data = this.noteOverlayData;
		var o = evt.getTarget('.note-gutter').getBoundingClientRect(),
			y = evt.getY(),
			dY = (data.lastY||0) - y,
			direction = dY === 0 && data.hasOwnProperty('lastDirection') ? data.lastDirection : (dY > 0),
			b = data.inputBox,
			r;

		if( dY ){//not zero
			data.lastY = y;
			data.lastDirection = direction;
			clearTimeout(data.lastMove);
			data.lastMove = setTimeout(function(){
				delete data.lastY;
				delete data.lastDirection;
				delete data.lastMove;
			},500);
		}

		r = this.findRect(y - o.top, direction);
		if(r){
			Ext.get(b).setY(r.top + o.top);
		}
	}
});
