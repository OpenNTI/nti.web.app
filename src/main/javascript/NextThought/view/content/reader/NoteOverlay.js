Ext.define('NextThought.view.content.reader.NoteOverlay', {

	constructor: function(){
		var data = this.noteOverlayHelpers;
		this.on({
			scope: this,
			'content-updated': function(){
				var doc = this.getDocumentElement();
				var root = doc.querySelector('#NTIContent > .page-contents');
				var r = root.getBoundingClientRect();
				data.left = r.left;
				data.width = r.width;
				data.root = root;
			},
			'afterRender': data.insertNoteOverlay
		});

		return this;
	},


	/**
	 * This property block serves as a namespace shell so that functions needed by this mixin do not clobber other
	 * mixin/subclass methods.
	 */
	noteOverlayHelpers: {
		/** @private */
		blockElementRe: /(inline.*)|(none)|(fixed)/i,
		visibilityCls: 'note-overlay-hidden',


		/**
		 * This is invoked by an event in the context of the mixed in class... so this function exists in this helper
		 * object but it's "this" will be of the owner object.
		 * @private
		 */
		insertNoteOverlay: function(){
			var me = this, //note: "this" is not "noteOverlayHelpers" its the 'NoteOverlay'ed class. (where this mixin was included)
				data = me.noteOverlayHelpers,
				o = me.getAnnotationOffsets(),
				width = o.gutter + 'px',
				box, txt;

			var container = {
				cls:'note-gutter',
				style: {
					width: width,
					height: me.getHeight()
				},
				cn: [{
						cls: 'note-here-control-box',
						cn: [{
							tag: 'textarea',
							cls: 'note-input'
							},{
							cls: 'bottom-border',
							html: '&nbsp;'
						}]
				}]
			};

			container = Ext.DomHelper.insertAfter(me.body.first(),container);
			box = Ext.get(data.box = container.firstChild);
			txt = box.down('textarea');
			box.visibilityCls = data.visibilityCls;
			box.setVisibilityMode(Ext.Element.ASCLASS);
			txt.setVisibilityMode(Ext.Element.VISIBILITY);
			box.hide();
			txt.hide();

			data.textarea = txt.dom;
			data.defaultHeight = Ext.util.TextMetrics.measure(box,'TEST',1000).height+5;
			txt.setHeight(data.defaultHeight);

			me.on({
				destroy: function(){ Ext.fly(container).remove(); },
				'sync-height': function(h){ Ext.get(container).setHeight(h); },
				'content-updated': function(){
					var e = Ext.get(me.noteOverlayHelpers.root);
					width = o.gutter + e.getMargin('l') + e.getPadding('l');
					Ext.get(container).setWidth(width);
					box.setWidth(width);
				}
			});


			me.mon(txt,{
				scope: me,
				blur: me.noteOverlayEditorBlur,
				keypress: me.noteOverlayEditorKeyPressed,
				keydown: me.noteOverlayEditorKeyDown,
				keyup: me.noteOverlayEditorKeyUp
			});

			me.mon(Ext.get(container),{
				scope: me,
				mousemove: me.noteOverlayMouseOver,
				mouseover: me.noteOverlayMouseOver,
				mouseout: me.noteOverlayMouseOut,
				click: me.noteOverlayActivateEditor
			});
		},


		/** @private */
		firstElementOnLine: function (y,doc){
			var right = this.width,
				el = null;
			while(right > this.left && (!el || el === this.root || !Ext.fly(this.root).contains(el))){
				el = doc.elementFromPoint(right,y);
				right -= 2;
			}
			return el;
		},


		/** @private */
		findBlockParent: function(e,doc){
			if(!e || e===this.root){return null;}
			var d = doc.defaultView.getComputedStyle(e).getPropertyValue('display');
			if(this.blockElementRe.test(d)){
				return this.findBlockParent(e.parentNode);
			}
			return e;
		},


		/** @private */
		resolveNodeAt: function(y,doc){
			var e = this.findBlockParent( this.firstElementOnLine(y,doc), doc);
			return Ext.fly(this.root).contains(e)
					? e
					: null;
		},


		/** @private */
		buildRangeFromRect: function(rect, node, parentWindow){
			var s = parentWindow.getSelection(),
					r, c = 0;

			function is(rectA,rectB){
				return rectA.top === rectB.top
					&& rectA.height === rectB.height;
			}

			s.removeAllRanges();
			s.selectAllChildren(node);
			s.collapseToStart();
			s.modify('extend', 'forward', 'line');

			while(!r && c < 100000) {
				c++;
				r = s.getRangeAt(0);
				if(is(r.getClientRects()[0],rect)){
					return r;
				}
				if(!Ext.fly(node).contains(r.startContainer)){
					s.removeAllRanges();
					s.selectAllChildren(node);
					break;
				}
				r = null;

				s.modify('move', 'forward', 'line');
				s.modify('extend', 'forward', 'line');
			}

			return s.getRangeAt(0);
		},


		/** @private */
		isCloseToMiddle: function(y,rect){
			var m = rect.top + (rect.height/2);
			return Math.abs((m - y)/rect.height) < 1;
		},


		/** @private */
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


		/**
		 * This is the main exported function in this utility scoped block.
		 *
		 * @param y
		 * @param doc
		 * @return {*}
		 */
		findLine: function(y, doc){
			var node = this.resolveNodeAt(y,doc);
			var rects = this.resolveClientRects( node )||[];
			var i=0;
			for(; i<rects.length; i++){
				if(this.isCloseToMiddle(y,rects[i])){
					return {
						rect: rects[i],
						range: this.buildRangeFromRect(rects[i],node,doc.parentWindow)
					};
				}
			}
			return null;
		}
	},


	noteOverlayMouseOver: function(evt,t){
		evt.stopEvent();

		var o = this.noteOverlayHelpers,
			offsets = this.getAnnotationOffsets(),
			y = evt.getY() - offsets.top,
			box = Ext.get(o.box),
			lineInfo;

		if(o.suspendMoveEvents){
			return;
		}

		clearTimeout(o.mouseLeaveTimeout);
		try {
			lineInfo = o.findLine(y,this.getDocumentElement());
			if(lineInfo && (lineInfo !== o.lastLine || !o.lastLine)){
				o.lastLine = lineInfo;
				box.setY( lineInfo.rect.bottom + offsets.top - box.getHeight() ).hide().show();
			}
		}
		catch(e){
			console.warn(Globals.getError(e));
		}
	},


	noteOverlayMouseOut: function(){
		var o = this.noteOverlayHelpers;
		if(o.suspendMoveEvents){
			return;
		}
		clearTimeout(o.mouseLeaveTimeout);
		o.mouseLeaveTimeout = setTimeout(function(){
			delete o.lastLine;
			Ext.get(o.box).hide().repaint();
		},500);
	},


	noteOverlayActivateEditor: function(evt){
		evt.stopEvent();
		var o = this.noteOverlayHelpers;
		if(o.suspendMoveEvents){
			return;
		}


		o.suspendMoveEvents = true;
		o.textarea.value = "";
		Ext.get(o.textarea).setHeight(o.defaultHeight).show().focus();
		return false;//stop the click in IE
	},


	noteOverlayDeactivateEditor: function(){
		var o = this.noteOverlayHelpers;
		delete o.suspendMoveEvents;
		o.textarea.value = "";
		Ext.get(o.textarea).hide();
		this.noteOverlayMouseOut();
	},


	noteOverlayEditorBlur: function(){
		//check value, save?

	//	this.noteOverlayDeactivateEditor();
	},


	noteOverlayEditorKeyDown: function(event){
		var k = event.getKey();
		if(k === event.ESC){
			this.noteOverlayDeactivateEditor();
		}
		event.stopPropagation();
		return this.noteOverlayEditorKeyPressed(event);
	},


	noteOverlayEditorKeyPressed: function(event){
		//control+enter & command+enter submit?


	},


	//handle resizing the editor
	noteOverlayEditorKeyUp: function(){
		var o = this.noteOverlayHelpers,
			t = Ext.get(o.textarea),
			b = Ext.get(o.box),
			h = t.dom.scrollHeight;

		if(h > t.getHeight()) {
			t.setHeight(h+5);
			b.repaint();
		}
	}
});
