Ext.define('NextThought.view.content.reader.NoteOverlay', {

	requires: [
		'NextThought.util.Line',
		'NextThought.view.annotations.note.EditorActions',
		'NextThought.view.annotations.note.Templates',
		'NextThought.view.whiteboard.Window'
	],

	openWhiteboards: {},

	constructor: function(){
		var data = this.noteOverlayData;

		this.on({
			scope: this,
			'content-updated': function(){
				var r = this.getContentRoot();
				try {
					r = r.getBoundingClientRect();
				}
				catch(e) {
					r = {left:0,width:0};
				}
				data.left = r.left;
				data.width = r.width;
			},
			'afterRender': this.insertNoteOverlay
		});

		this.mon(LocationProvider, {
			scope: this,
			changed: this.noteOverlayLocationChanged
		});

		return this;
	},


	/**
	 * This property block serves as a namespace shell so that functions needed by this mixin do not clobber other
	 * mixin/subclass methods.
	 */
	noteOverlayData: {
		/** @private */
		visibilityCls: 'note-overlay-hidden'
	},


	/**
	* This is invoked by an event in the context of the mixed in class... so this function exists in this helper
	* object but it's "this" will be of the owner object.
	* @private
	*/
	insertNoteOverlay: function(){
		var me = this,
			data = me.noteOverlayData,
			box, txt;

		var container = {
			cls:'note-gutter',
			style: {
				height: me.getHeight()
			},
			cn: [{
				cls: 'note-here-control-box',
				cn: [{
					cls: 'entry',
					cn: [{
						cls: 'clear', html: '&nbsp;'
					},{
						cls: 'advanced', html: '&nbsp;'
					},{
						tag: 'textarea',
						cls: 'note-input'
					},{
						cls: 'shadow-text',html: 'Write a note...'
					}]
				},{
					cls: 'bottom-border',
					html: '&nbsp;'
				},
					TemplatesForNotes.getEditorTpl()
				]
			}]
		};

		container = Ext.DomHelper.insertAfter(me.getInsertionPoint().first(),container,true);
		data.box = box = container.down('.note-here-control-box');
		data.textarea = txt = box.down('textarea');
		data.lineEntry = box.down('.entry');
		data.editor = box.down('.editor');

		box.hide();

		(new Ext.CompositeElement( box.query('.action.save'))).on('click', me.noteOverlayEditorSave, me);
		(new Ext.CompositeElement( box.query('.entry .advanced'))).on('click', me.noteOverlayActivateRichEditor, me);
		(new Ext.CompositeElement( box.query('.cancel,.clear'))).on('click', me.noteOverlayEditorCancel, me);

		function onResize(){
			me.noteOverlayDeactivateEditor();
		}

		me.on({
			scope: me,
			destroy: function(){ container.remove(); },
			resize: onResize,
			'sync-height': function(h){ container.setHeight(h); },
			'content-updated': onResize
		});

		me.mon(data.editor.down('.content'),{
			scope: me,
			keypress: me.noteOverlayEditorKeyPressed,
			keydown: me.noteOverlayEditorKeyDown,
			keyup: me.noteOverlayEditorKeyUp
		});

		me.mon(txt,{
			scope: me,
			keypress: me.noteOverlayEditorKeyPressed,
			keydown: me.noteOverlayEditorKeyDown,
			keyup: me.noteOverlayEditorKeyUp
		});

		me.mon(container,{
			scope: me,
			mousemove: me.noteOverlayMouseOver,
			mouseover: me.noteOverlayMouseOver,
			mouseout: me.noteOverlayMouseOut,
			click: me.noteOverlayActivateEditor
		});

		data.editorActions = new NoteEditorActions(me, data.editor);
	},



	noteOverlayXYAllowed: function(x,y){
		var o = this.noteOverlayData,
			r = o.restrictedRanges;
		//test to see if line is occupied
		return ! (r && r[y]===true);
	},


	noteOverlayClearRestrictedRanges: function(){
		delete this.noteOverlayData.restrictedRanges;
	},


	noteOverlayAddRestrictedRange: function(rect){
		var o = this.noteOverlayData,
			y = rect? rect.bottom :0,
			l = rect? rect.top : 0;
		o.restrictedRanges = o.restrictedRanges || [];
		for(; y>l && y>=0; y--){
			o.restrictedRanges[y] = true;
		}
	},


	noteOverlayRegisterAddNoteNib: function(applicableRange, nib){
		nib.on('click',this.noteOverlayAddNoteNibClicked,this, {applicableRange: applicableRange});
		//should keep track of this and cleanup if its detected to not be in the dom any more.
	},


	noteOverlayAddNoteNibClicked: function(e, dom, options){
		var o = this.noteOverlayData,
			w = e.getTarget('.widgetContainer',null,true),
			r = options.applicableRange;
		if(w){
			e.stopEvent();
//			w.hide();

			r = Anchors.toDomRange(r, this.getDocumentElement());

			o.lastLine = {
				range: r,
				rect:r.getBoundingClientRect()
			};

			Ext.get(o.box).setY(0);

			//this.noteOverlayTrackLineAtEvent(e);
			this.noteOverlayPositionInputBox();
			this.noteOverlayActivateRichEditor();
			this.noteOverlayScrollEditorIntoView();
			return false;
		}
	},


	noteOverlayTrackLineAtEvent:function(e){
		var o = this.noteOverlayData,
			offsets = this.getAnnotationOffsets(),
			y = e.getY() - offsets.top, lineInfo,
			box = Ext.get(o.box);

		try {
			clearTimeout(o.mouseLeaveTimeout);
			lineInfo = LineUtils.findLine(y,this.getDocumentElement());
			if(lineInfo && (lineInfo !== o.lastLine || !o.lastLine)){
				o.lastLine = lineInfo;
				e.stopEvent();
				if(!lineInfo.range){
					box.hide();
					this.noteOverlayMouseOut();
					return;
				}

				this.noteOverlayPositionInputBox();
				return true;
			}
		} catch(er){
			console.warn(Globals.getError(er));
		}
	},


	noteOverlayPositionInputBox: function(){
		var o = this.noteOverlayData,
			offsets = this.getAnnotationOffsets(),
			box = Ext.get(o.box),
			oldY = box.getY(),
			newY = 0;

		if (o.lastLine && o.lastLine.rect){
			newY = Math.round(o.lastLine.rect.bottom + offsets.top - box.getHeight());
		}

		//check for minute scroll changes to prevent jitter:
		if(Math.abs(oldY - newY) > 4){
			box.setY(o.lastLine.rect.bottom + offsets.top - box.getHeight());
		}
		//show thew box:
		box.hide().show();
	},


	noteOverlayMouseOver: function(evt){
		var o = this.noteOverlayData, xy = evt.getXY().splice();

		xy[1] += this.body.getScroll().top;

		if(o.suspendMoveEvents){
			return;
		}
		else if(!this.noteOverlayXYAllowed.apply(this,xy)){
			Ext.get(o.box).hide();
			return;
		}

		return this.noteOverlayTrackLineAtEvent(evt);
	},


	noteOverlayLocationChanged: function(ntiid) {
		var o = this.noteOverlayData;

		if (o.editorActions) {o.editorActions.updatePrefs();}
	},


	noteOverlayMouseOut: function(){
		var o = this.noteOverlayData,
			sel = this.getDocumentElement().parentWindow.getSelection();
		if(o.suspendMoveEvents){
			return;
		}
		if (sel) { sel.removeAllRanges(); }
		clearTimeout(o.mouseLeaveTimeout);
		o.mouseLeaveTimeout = setTimeout(function(){
			delete o.lastLine;
			o.box.hide();
		},100);
	},


	noteOverlayScrollEditorIntoView: function(){
		var o = this.noteOverlayData, e = o.textarea;
		if(!o.suspendMoveEvents){ return; }

		if(o.richEditorActive){
			e = o.editor;
		}

		e.scrollIntoView(this.body);
	},


	noteOverlayActivateRichEditor: function(){
		var o = this.noteOverlayData,
			t = o.textarea.dom;

		o.suspendMoveEvents = true;
		if(o.richEditorActive){
			return;
		}
		o.richEditorActive = true;

		o.editor.addCls('active');
		o.editorActions.setValue( t.value, true, true );
		t.value = '';
		this.noteOverlayScrollEditorIntoView();
	},


	noteOverlayActivateEditor: function(evt){
		evt.stopEvent();
		if(!this.noteOverlayMouseOver(evt)){
			return;
		}
		var o = this.noteOverlayData;
		if(o.suspendMoveEvents){
			return;
		}
		if (!o.lastLine || !o.lastLine.range || o.lastLine.range.collapsed) {
			return;
		}

		o.suspendMoveEvents = true;
		o.lineEntry.addCls('active');
		o.textarea.focus().dom.value = "";
		this.noteOverlayScrollEditorIntoView();
		return false;//stop the click in IE
	},


	noteOverlayDeactivateEditor: function(){
		var o = this.noteOverlayData;
		delete o.suspendMoveEvents;
		delete o.richEditorActive;
		o.textarea.dom.value = "";
		o.lineEntry.removeCls('active');
		o.editor.removeCls('active');
		o.editorActions.reset();
		this.noteOverlayMouseOut();
	},


	noteOverlayEditorCancel: function(e){
		e.stopEvent();
		this.noteOverlayDeactivateEditor();
		return false;
	},


	noteOverlayEditorSave: function(e){
		e.stopEvent();

		function callback(success, record){
			if(success){
				me.noteOverlayDeactivateEditor();
			}
		}


		var me = this;
		var o = me.noteOverlayData;
		var note = o.textarea.dom.value;
		var style = o.lastLine.style || 'suppressed';
		var v, sharing = []; //TODO - load from page??

		if (o.richEditorActive){
			v = o.editorActions.getValue();
			note = v.body;
			sharing = v.shareWith;
		}

		me.fireEvent('save-new-note', note, o.lastLine.range, sharing, style, callback);
		return false;
	},


	noteOverlayEditorKeyDown: function(event){
		var k = event.getKey();
		if(k === event.ESC){
			this.noteOverlayDeactivateEditor();
		}
		else if(k === event.ENTER && !this.noteOverlayData.richEditorActive){
			event.stopEvent();
			this.noteOverlayEditorSave(event);
		}
		return this.noteOverlayEditorKeyPressed(event);
	},


	noteOverlayEditorKeyPressed: function(event){
		event.stopPropagation();
		//control+enter & command+enter submit?

		//document.queryCommandState('bold')


		var o = this.noteOverlayData;
		delete o.editorActions.lastRange;
		if(o.richEditorActive){
			o.editor.repaint();
			this.noteOverlayScrollEditorIntoView();
		}
	},


	noteOverlayEditorKeyUp: function(){
		var o = this.noteOverlayData,
				t = o.textarea,
				h = t.dom.scrollHeight;

		//TODO: Use a better way to detect the note has gotten 'complex' and or too long for the line-box.
		if(h > t.getHeight()) {
			//transition to rich editor
			this.noteOverlayActivateRichEditor();
		}
	}
});
