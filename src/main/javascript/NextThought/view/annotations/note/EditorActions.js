Ext.define('NextThought.view.annotations.note.EditorActions',{
	requires: [
		'NextThought.util.Ranges',
		'NextThought.view.menus.Share'
	],

	mixins: {
		observable: 'Ext.util.Observable'
	},

	wbThumbnailTpm: Ext.DomHelper.createTemplate( {
		tag: 'img',
		src: Ext.BLANK_IMAGE_URL,
		id: '{1}',
		style: {
			backgroundImage: 'url({0});'
		},
		cls: 'wb-thumbnail',
		alt: 'Whiteboard Thumbnail',
		border: 0
	} ).compile(),

	constructor: function(cmp, editorEl){
		var me = this;
		var ce = Ext.CompositeElement;
		me.editor = editorEl;
		me.cmp = cmp;
		me.openWhiteboards = {};
		me.shareMenu = Ext.widget({xtype: 'share-menu'});
		this.updateShareWithLabel();
		me.mixins.observable.constructor.call(me);


		(new ce(editorEl.query('.action,.content'))).set({tabIndex:1});

		cmp.mon(me.shareMenu, {
			scope: me,
			changed: me.updateShareWithLabel
		});

		cmp.mon(new ce(editorEl.query('.left .action')),{
			scope: me,
			click: me.editorContentAction
		});

		cmp.mon(editorEl,{
			scope: me,
			mousedown: me.editorMouseDown,
			selectstart: me.editorSelectionStart,
			click: function(e){editorEl.down('.content').focus();}
		});

		cmp.mon(editorEl.down('.content'),{
			scope: me,
			selectstart: me.editorSelectionStart,
			focus: me.editorFocus,
			blur: me.editorBlur,
			keyup: me.maybeResizeContentBox,
			paste: me.handlePaste
		});

		cmp.mon(editorEl.down('.action.share'), {
			scope: me,
			click: me.openShareMenu
		});
	},


	/**
	 *  @see http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser/
	 */
	handlePaste: function(e,elem) {
		elem = e.getTarget('.content');
		var be = e.browserEvent,
			cd = be ? be.clipboardData : null,
			sel = window.getSelection(),
			savedRange = RangeUtils.saveRange(sel.getRangeAt(0)),
			savedcontent;

		sel.selectAllChildren(elem);
		savedcontent = sel.getRangeAt(0).extractContents();

	    // Webkit - get data from clipboard, put into editdiv, cleanup, then cancel event
	    if(cd && cd.getData) {
			e.stopEvent();
	        if(/text\/html/.test(cd.types)) {
	            elem.innerHTML = cd.getData('text/html');
	        }
	        else if(/text\/plain/.test(cd.types)) {
	            elem.innerHTML = cd.getData('text/plain');
	        }
	        else {
	            elem.innerHTML = "";
	        }
	        this.waitForPasteData(elem, savedcontent, savedRange);
	        return false;
	    }
	    // Everything else - empty editdiv and allow browser to paste content into it, then cleanup
	    else {
	        elem.innerHTML = "";
	        this.waitForPasteData(elem, savedcontent, savedRange);
	        return true;
	    }
	},

	waitForPasteData: function (elem, savedcontent, savedRange, callCount) {
		callCount = callCount || 0;
	    if (elem.childNodes && elem.childNodes.length > 0) {
	        this.processPaste(elem, savedcontent, savedRange);
	    }
	    else if(callCount < 100){
			var me = this;
	        setTimeout(function(){me.waitForPasteData(elem, savedcontent, savedRange, callCount+1); },20);
	    }
		else {
			console.log('timedout waiting for paste');
		}
	},

	processPaste: function(elem, savedcontent, rangeDesc) {
		var range;
	    var pasteddata = elem.innerHTML;
		var gcc;
		var frag;

		elem.innerHTML = '';
	    elem.appendChild(savedcontent);

		try {
			range = RangeUtils.restoreSavedRange(rangeDesc);
			gcc = range.commonAncestorContainer;
			if(elem === gcc || Ext.fly(elem).contains(gcc)){
				range.deleteContents();
			}
		} catch(e){
			range = document.createRange();
			range.selectNodeContents(elem);
		}

		range.collapse(false);

		try {
			pasteddata = pasteddata.replace(/\s*(style|class)=".+?"\s*/ig,' ').replace(/<span.*?>&nbsp;<\/span>/ig,'&nbsp;').replace(/<meta.*?>/ig,'');
			frag = range.createContextualFragment(pasteddata);
			range.insertNode(frag);
		}
		catch(e){
			console.log(pasteddata);
		}
	},



	editorMouseDown: function(e){
		var s = window.getSelection();
		if(e.getTarget('.action')){
			if (s.rangeCount) {
				this.lastRange = s.getRangeAt(0);
			}
		}
	},


	updateShareWithLabel: function(){
		this.editor.down('.action.share').update(this.shareMenu.getLabel());
	},


	editorSelectionStart: function(e){
		e.stopPropagation();//re-enable selection, and prevent the handlers higher up from firing.
		delete this.lastRange;
		return true;//re-enable selection
	},


	openShareMenu: function(e){
		e.stopEvent();
		this.shareMenu.showBy(this.editor.down('.action.share'),'t-b?');
		return false;
	},


	editorBlur: function(){},


	editorFocus: function(){
		var s = window.getSelection();
		if(this.lastRange){
			s.removeAllRanges();
			s.addRange(this.lastRange);
		}
	},


	maybeResizeContentBox: function(e) {
		var p = this.previousEditorHeight || 0,
			h = this.editor.getHeight();

		this.previousEditorHeight = h;

		if (h !== p) {
			if(this.cmp.doLayout){
				this.cmp.doLayout();
			}
			else {
				this.cmp.doComponentLayout();
			}
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
		var wbWin = Ext.widget({ xtype: 'wb-window', height: '75%', width: '50%' }),
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
				el = Ext.fly(me.wbThumbnailTpm.append(content, [data, guid]));
				//listen on clicks and do stuff:
				el.on('click', function(evt, img, opt){
					var w = me.openWhiteboards[guid];
					if (w) {w.show();}
					else {Ext.Error.raise('No whiteboard for' + guid);}
				});
			}
			me.editor.repaint();
			me.fireEvent('size-changed');
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
		return {
			body: this.getNoteBody(this.editor.down('.content').getHTML()),
			shareWith: this.shareMenu.getValue()
		};
	},


	setValue: function(text, putCursorAtEnd, focus) {
		var r,
			c = this.editor.down('.content').dom,
			s = window.getSelection(),
			content;
		this.setHTML(Ext.String.htmlEncode( text ));
		content = c.innerHTML;
		if(putCursorAtEnd && content && content.length>0){
			try {
				s.removeAllRanges();
				r = document.createRange();
				r.setStart(c.firstChild, content.length);
				r.collapse(true);
				s.addRange(r);
			}
			catch (e){
				console.warn('focus issue: '+e.message, "\n\n\n", content);
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
	},

	updatePrefs: function(v){
		this.shareMenu.reload(v);
		this.updateShareWithLabel();
	}



}, function(){
	window.NoteEditorActions = this;
});
