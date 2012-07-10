Ext.define('NextThought.view.content.reader.NoteOverlay', {

	requires: [
		'NextThought.util.Line'
	],

	openWhiteboards: {},

	constructor: function(){
		var data = this.noteOverlayData;

		data.wbThumbnailTpm = Ext.DomHelper.createTemplate(
			'<img src="{0}" id="{1}" class="wb-thumbnail"/>'
		);
		data.wbThumbnailTpm.compile();


		this.on({
			scope: this,
			'content-updated': function(){
				var r = this.getContentRoot().getBoundingClientRect();
				data.left = r.left;
				data.width = r.width;
			},
			'afterRender': this.insertNoteOverlay
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
				},{
					cls: 'editor',
					cn:[{
						cls: 'main',
						cn:[{
							cls: 'toolbar',
							cn: [{
								cls: 'left',
								cn: [{cls: 'action bold'},{cls:'action italic'},{cls:'action underline'}]
							},{
								cls: 'right',
								cn: [{cls: 'action share', html: 'Only Me'}]
							}]
						},{
							cls: 'content',
							contentEditable: true,
							unselectable: 'off',
							html: '&nbsp;'
						}]
					},{
						cls: 'footer',
						cn: [{
							cls: 'left',
							cn: [{cls: 'action whiteboard'}]
						},{
							cls: 'right',
							cn: [{cls:'action save', html: 'Save'},{cls:'action cancel', html: 'Cancel'}]
						}]
					}]
				}]
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

		me.mon(new Ext.CompositeElement(data.editor.query('.left .action')),{
			scope: me,
			click: me.noteOverlayEditorContentAction
		});

		me.mon(data.editor,{
			scope: me,
			mousedown: me.noteOverlayEditorMouseDown,
			selectstart: me.noteOverlayEditorSelectionStart
		});

		me.mon(data.editor.down('.content'),{
			scope: me,
			selectstart: me.noteOverlayEditorSelectionStart,
			focus: me.noteOverlayRichEditorFocus,
			blur: me.noteOverlayRichEditorBlur,
			keypress: me.noteOverlayEditorKeyPressed,
			keydown: me.noteOverlayEditorKeyDown,
			keyup: me.noteOverlayEditorKeyUp
		});

		me.mon(txt,{
			scope: me,
			blur: me.noteOverlayEditorBlur,
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
				box.setY( lineInfo.rect.bottom + offsets.top - box.getHeight())
						.hide()
						.show();
			}
		}
		catch(e){
			console.warn(Globals.getError(e));
		}
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
			t = o.textarea.dom,
			s = window.getSelection(),
			c,r;

		if(o.richEditorActive){
			return;
		}
		o.richEditorActive = true;

		s.removeAllRanges();
		o.editor.addCls('active');

		c = o.editor.down('.content').dom;

		c.innerHTML = Ext.String.htmlEncode( t.value );

		try {
			r = document.createRange();
			r.setStart(c.firstChild, c.innerHTML.length);
			r.collapse(true);
			s.addRange(r);
		}
		catch (e){
			console.warn('focus issue.');

		}
		c.focus();

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
		o.editor.down('.content').innerHTML = '';
		window.getSelection().removeAllRanges();
		this.noteOverlayMouseOut();
	},


	noteOverlayRichEditorBlur: function(){},


	noteOverlayRichEditorFocus: function(){
		var o = this.noteOverlayData,
			s = window.getSelection();
		if(o.lastRange){
			s.removeAllRanges();
			s.addRange(o.lastRange);
		}
	},


	noteOverlayEditorMouseDown: function(e){
		var o = this.noteOverlayData;
		if(e.getTarget('.action')){
			o.lastRange = window.getSelection().getRangeAt(0);
		}
	},


	noteOverlayEditorSelectionStart: function(e){
		e.stopPropagation();//re-enable selection, and prevent the handlers higher up from firing.

		var o = this.noteOverlayData;
		delete o.lastRange;

		return true;//re-enable selection
	},


	noteOverlayEditorContentAction: function(e){
		e.stopEvent();
		var o = this.noteOverlayData;
		var t = e.getTarget('.action',undefined,true), action;
		if(t){
			this.noteOverlayRichEditorFocus();//reselect
			if(t.is('.whiteboard')){
				this.noteOverlayAddWhiteboard();
			}
			else {
				action = t.getAttribute('class').split(' ').pop();
				document.execCommand(action);
			}

		}
		return false;
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
		var note = o.textarea.dom.value || this.getNoteBody(o.editor.down('.content').getHTML());
		console.log('firing event: "save-new-note" with ', note);
		me.fireEvent('save-new-note', note, o.lastLine.range, callback);
		return false;
	},


	getNoteBody: function(str) {
		var r = [],
			regex = /<img.*?>/gi,
			splits,
			whiteboards,
			s, w = 0, t, wbid;

		//split it up, then interleave:
		splits = str.split(regex);
		whiteboards = str.match(regex) || [];
		if (splits.length === 0){splits.push('');} //no text before WB?  just trick it.
		for (s=0; s<splits.length; s++) {
			t = splits[s];
			if (t && t.length > 0){r.push(t);}
			for (w; w<whiteboards.length; w++){
				wbid = whiteboards[w].match(/id="(.*?)"/)[1];
				r.push(this.openWhiteboards[wbid].getEditor().getValue());
			}
		}

		return r;
	},


	noteOverlayEditorBlur: function(){
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
		delete o.lastRange;
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
	},


	noteOverlayAddWhiteboard: function(){
		//pop open a whiteboard:
		var wbWin = Ext.widget({ xtype: 'wb-window', height: '50%', width: '50%' }),
			guid = guidGenerator(),
			o = this.noteOverlayData,
			content = o.editor.down('.content');

		//remember the whiteboard window:
		wbWin.guid = guid;
		this.openWhiteboards[guid] = wbWin;

		//hook into the window's save and cancel operations:
		this.mon(wbWin, {
			scope: this,
			save: function(win, wb, e){
				this.insertWhiteboardThumbnail(content, guid, wb);
				wbWin.hide();
			},
			cancel: function(win, wb, e){
				console.log('cancel', arguments);
				this.cleanOpenWindows(win.guid);
				wbWin.close();
			}
		});

		wbWin.show();
	},


	insertWhiteboardThumbnail: function(content, guid, wb){
		var me = this,
			o = me.noteOverlayData;

		wb.getThumbnail(function(data){
			var existingImg = content.query('[id='+guid+']'),
				el;

			if (existingImg.length === 1) {
				el = existingImg[0];
				el.src = data;
			}
			else {
				el = Ext.fly(o.wbThumbnailTpm.append(content, [data, guid]));
				//listen on clicks and do stuff:
				el.on('click', function(evt, img, opt){
					var w = me.openWhiteboards[guid];
					if (w) {w.show();}
					else {Ext.Error.raise('No whiteboard for' + guid);}
				});
			}
			o.editor.repaint();
		});
	},


	cleanOpenWindows: function(guids) {
		var me = this;

		if (!Ext.isArray(guids)){guids = [guids];}

		Ext.each(guids, function(g){
			delete me.openWhiteboards[g];
		});
	}
});
