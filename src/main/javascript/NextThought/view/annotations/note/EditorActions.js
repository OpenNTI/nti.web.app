Ext.define('NextThought.view.annotations.note.EditorActions',{

	constructor: function(cmp, editorEl){

		var me = this;
		me.editor = editorEl;
		me.openWhiteboards = {};

		cmp.mon(new Ext.CompositeElement(editorEl.query('.left .action')),{
			scope: me,
			click: me.editorContentAction
		});

		cmp.mon(editorEl,{
			scope: me,
			mousedown: me.editorMouseDown,
			selectstart: me.editorSelectionStart
		});

		cmp.mon(editorEl.down('.content'),{
			scope: me,
			selectstart: me.editorSelectionStart,
			focus: me.editorFocus,
			blur: me.editorBlur
		});
	},

	editorMouseDown: function(e){
		if(e.getTarget('.action')){
			this.lastRange = window.getSelection().getRangeAt(0);
		}
	},


	editorSelectionStart: function(e){
		e.stopPropagation();//re-enable selection, and prevent the handlers higher up from firing.
		delete this.lastRange;
		return true;//re-enable selection
	},


	editorBlur: function(){},


	editorFocus: function(){
		var s = window.getSelection();
		if(this.lastRange){
			s.removeAllRanges();
			s.addRange(this.lastRange);
		}
	},


	editorContentAction: function(e){
		e.stopEvent();
		var t = e.getTarget('.action',undefined,true), action;
		if(t){
			this.editorFocus();//reselect
			if(t.is('.whiteboard')){
				this.addWhiteboard();
			}
			else {
				action = t.getAttribute('class').split(' ').pop();
				document.execCommand(action);
			}
		}
		return false;
	},


	addWhiteboard: function(){
		//pop open a whiteboard:
		var wbWin = Ext.widget({ xtype: 'wb-window', height: '50%', width: '50%' }),
			guid = guidGenerator(),
			content = this.editor.down('.content');

		//remember the whiteboard window:
		wbWin.guid = guid;
		this.openWhiteboards[guid] = wbWin;

		//hook into the window's save and cancel operations:
		this.cmp.mon(wbWin, {
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
		var me = this;

		wb.getThumbnail(function(data){
			var existingImg = content.query('[id='+guid+']'),
				el;

			if (existingImg.length === 1) {
				el = existingImg[0];
				el.src = data;
			}
			else {
				el = Ext.fly(this.wbThumbnailTpm.append(content, [data, guid]));
				//listen on clicks and do stuff:
				el.on('click', function(evt, img, opt){
					var w = me.openWhiteboards[guid];
					if (w) {w.show();}
					else {Ext.Error.raise('No whiteboard for' + guid);}
				});
			}
			this.editor.repaint();
		});
	},


	cleanOpenWindows: function(guids) {
		var me = this;

		if (!Ext.isArray(guids)){guids = [guids];}

		Ext.each(guids, function(g){
			delete me.openWhiteboards[g];
		});
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


	focus: function(){
		this.editor.down('.content').focus();
	},


	getValue: function(){
		return this.getNoteBody(this.editor.down('.content').getHTML())
	},


	setValue: function(text, putCursorAtEnd, focus) {
		var r,
			c = this.editor.down('.content').dom,
			s = window.getSelection();
		this.setHTML(Ext.String.htmlEncode( text ));
		if(putCursorAtEnd){
			try {
				s.removeAllRanges();
				r = document.createRange();
				r.setStart(c.firstChild, c.innerHTML.length);
				r.collapse(true);
				s.addRange(r);
			}
			catch (e){
				console.warn('focus issue: '+e.message);

			}
		}

		if(focus){
			this.focus();
		}
	},


	setHTML: function(html){
		this.editor.down('.content').dom.innerHTML = html;
	},


	reset: function(){
		this.editor.down('.content').innerHTML = '';
		window.getSelection().removeAllRanges();
	}



}, function(){
	window.NoteEditorActions = this;
});
