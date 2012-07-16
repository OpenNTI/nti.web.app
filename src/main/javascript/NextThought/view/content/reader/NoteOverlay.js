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
				var r = this.getContentRoot().getBoundingClientRect();
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
					cls: 'entry',
					cn: [{
						cls: 'clear', html: '&nbsp;'
					},{
						cls: 'save', html: '&nbsp;'
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

		container = Ext.DomHelper.insertAfter(me.body.first(),container,true);
		data.box = box = container.down('.note-here-control-box');
		data.textarea = txt = box.down('textarea');
		data.lineEntry = box.down('.entry');
		data.editor = box.down('.editor');

		box.hide();

		(new Ext.CompositeElement( box.query('.save'))).on('click', me.noteOverlayEditorSave, me);
		(new Ext.CompositeElement( box.query('.cancel,.clear'))).on('click', me.noteOverlayEditorCancel, me);

		function sizer(){
			try {
				var o = me.getAnnotationOffsets();
				if(o){
					width = o.gutter + o.contentLeftPadding;
					container.setWidth(width);
					box.setWidth(width-box.getMargin('lr'));
				}
			}
			catch(er){
				console.error(er.stack);
			}
		}

		me.on({
			scope: me,
			destroy: function(){ container.remove(); },
			resize: sizer,
			'sync-height': function(h){ container.setHeight(h); },
			'content-updated': sizer
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


	noteOverlayMouseOver: function(evt){
		evt.stopEvent();

		var o = this.noteOverlayData,
				offsets = this.getAnnotationOffsets(),
				y = evt.getY() - offsets.top,
				box = Ext.get(o.box),
				lineInfo;

		if(o.suspendMoveEvents){
			return;
		}

		clearTimeout(o.mouseLeaveTimeout);
		try {
			lineInfo = LineUtils.findLine(y,this.getDocumentElement());
			if(lineInfo && (lineInfo !== o.lastLine || !o.lastLine)){
				o.lastLine = lineInfo;

				if(!lineInfo.range){
					box.hide();
					this.noteOverlayMouseOut();
					return;
				}

				box.setY( lineInfo.rect.bottom + offsets.top - box.getHeight())
						.hide()
						.show();
			}
		}
		catch(e){
			console.warn(Globals.getError(e));
		}
	},


	noteOverlayLocationChanged: function(ntiid) {
		var o = this.noteOverlayData;

		if (o.editorActions) {o.editorActions.updatePrefs();}
	},


	noteOverlayMouseOut: function(){
		var o = this.noteOverlayData;
		if(o.suspendMoveEvents){
			return;
		}
		clearTimeout(o.mouseLeaveTimeout);
		o.mouseLeaveTimeout = setTimeout(function(){
			delete o.lastLine;
			o.box.hide();
		},500);
	},


	noteOverlayAcivateRichEditor: function(){
		var o = this.noteOverlayData,
			t = o.textarea.dom;

		if(o.richEditorActive){
			return;
		}
		o.richEditorActive = true;

		o.editor.addCls('active');
		o.editorActions.setValue( t.value, true, true );
		t.value = '';
	},


	noteOverlayActivateEditor: function(evt){
		evt.stopEvent();
		this.noteOverlayMouseOver(evt);
		var o = this.noteOverlayData;
		if(o.suspendMoveEvents){
			return;
		}


		o.suspendMoveEvents = true;
		o.lineEntry.addCls('active');
		o.textarea.focus().dom.value = "";
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
		var v, sharing = []; //TODO - load from page??

		if (o.richEditorActive){
			v = o.editorActions.getValue();
			note = v.body;
			sharing = v.shareWith;
		}

		me.fireEvent('save-new-note', note, o.lastLine.range, sharing, callback);
		return false;
	},


	noteOverlayEditorKeyDown: function(event){
		var k = event.getKey();
		if(k === event.ESC){
			this.noteOverlayDeactivateEditor();
		}
		else if(k === event.ENTER && !this.noteOverlayData.richEditorActive){
			this.noteOverlayAcivateRichEditor();
			event.stopEvent();
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
		}
	},


	noteOverlayEditorKeyUp: function(){
		var o = this.noteOverlayData,
				t = o.textarea,
				h = t.dom.scrollHeight;

		//TODO: Use a better way to detect the note has gotten 'complex' and or too long for the line-box.
		if(h > t.getHeight()) {
			//transition to rich editor
			this.noteOverlayAcivateRichEditor();
		}
	}
});
