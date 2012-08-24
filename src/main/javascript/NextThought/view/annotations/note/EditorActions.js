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
			paste: me.handlePaste,
			click: me.handleClick
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
		catch(e2){
			console.log(pasteddata);
		}
	},


	editorMouseDown: function(e){
		var s = window.getSelection();
//		if(e.getTarget('.action')){
			if (s.rangeCount) {
				this.lastRange = s.getRangeAt(0);
			}
//		}
	},


	updateShareWithLabel: function(){
		this.editor.down('.action.share').update(this.shareMenu.getLabel());
	},


	editorSelectionStart: function(e){
		e.stopPropagation();//re-enable selection, and prevent the handlers higher up from firing.
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
			this.cmp.updateLayout();
		}
	},
	editorStylingFallback: function(action,doc) {
		tags = {bold: 'b', italic: 'i', underline: 'u'}
		var tb = this.editor.dom.querySelector('[contenteditable=true]');
		var selection = window.rangy.getSelection();
		if (selection.rangeCount > 0) {
			function getStyleAtPoint(node, given) {
				if (!given) { given = {bold: false, italic: false, underline: false}; }
				if (!node || node.contentEditable == 'true') { return given; }
				if (node.tagName == 'B') { given.bold = true; }
				if (node.tagName == 'I') { given.italic = true; }
				if (node.tagName == 'U') { given.underline = true; } 
				return getStyleAtPoint(node.parentNode,given);
			}
			//Wrap the existing selection
			newNode = document.createElement(tags[action] || 'span');
			newNode.innerHTML = selection.toHtml();
			selection.deleteFromDocument();
			selection.getRangeAt(0).insertNode(newNode);
			setTimeout(function(){
				//Create our new environment
				origNode = selection.getRangeAt(0).startContainer;
				origOffset = selection.getRangeAt(0).startOffset;
				selection.removeAllRanges();
				preRange = window.rangy.createRange();
				preRange.selectNodeContents(tb);
				preRange.setEnd(origNode,origOffset);
				left = preRange.toHtml();
				postRange = window.rangy.createRange();
				postRange.selectNodeContents(tb);
				postRange.setStart(origNode,origOffset);
				right = postRange.toHtml();
				style = getStyleAtPoint(origNode);
				style[action] = !(style[action]);
				id = new Date().getTime();
				mid = '<span id="'+id+'"></span>';
				if (style.bold) { mid = '<b>' + mid + '</b>'; }
				if (style.italic) { mid = '<i>' + mid + '</i>'; }
				if (style.underline) { mid = '<u>' + mid + '</u>'; }
				tb.innerHTML = left + mid + right;
				setTimeout(function(){
					selectRange = window.rangy.createRange();
					selectRange.selectNodeContents(doc.getElementById(id));
					selection.addRange(selectRange);
				},1);
			},1);
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
				if (!Ext.isIE) {
					sel = window.rangy.getSelection();
					range = sel.rangeCount > 0 ? sel.getRangeAt(0) : window.rangy.createRange();
					sn = range.startContainer, so = range.startOffset;
					en = range.endContainer, eo = range.endOffset;
					document.execCommand(action, null, null);
					sel.removeAllRanges();
					range.setStart(sn,so);
					range.setEnd(en,eo);
					sel.addRange(range);
				}
				else {
					this.editorStylingFallback(action,t.dom.ownerDocument);
					this.editor.dom.querySelector('[contenteditable=true]').focus();
				}
			}
		}
		return false;
	},

	handleClick: function(e,dom){
		var guid;
		var t = e.getTarget('img.wb-thumbnail');

		if(t){
			guid = t.getAttribute('id');
			this.openWhiteboards[guid].show();
		}
	},

	addWhiteboard: function(data){
		//pop open a whiteboard:
		data = data?data:(function(){}()); //force the falsy value of data to always be undefinded.

		var me = this,
			wbWin = Ext.widget({ xtype: 'wb-window', height: '75%', width: '50%', value: data }),
			guid = guidGenerator(),
			content = me.editor.down('.content');

		//remember the whiteboard window:
		wbWin.guid = guid;
		this.openWhiteboards[guid] = wbWin;

		if(data){
			me.insertWhiteboardThumbnail(content, guid, wbWin.down('whiteboard-editor'));
		}

		//hook into the window's save and cancel operations:
		this.cmp.mon(wbWin, {
			save: function(win, wb, e){
				me.insertWhiteboardThumbnail(content, guid, wb);
				wbWin.hide();
			},
			cancel: function(win, wb, e){
				//if we haven't added the wb to the editor, then clean up, otherwise let the window handle it.
				if(!Ext.get(guid)){
					me.cleanOpenWindows(win.guid);
					wbWin.close();
				}
			}
		});

		if(!data){
			wbWin.show();
		}
	},


	insertWhiteboardThumbnail: function(content, guid, wb){
		var me = this;
		var el = content.query('[id='+guid+']')[0];

		if(!el){
			el = me.wbThumbnailTpm.append(content, [Ext.BLANK_IMAGE_URL, guid]);
		}

		wb.getThumbnail(function(data){
			Ext.fly(el).setStyle({ backgroundImage: 'url('+data+')' });
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


	editBody: function(body){
		var me = this,
			c = this.editor.down('.content').dom;

		Ext.each(body, function(part){
			if(typeof part === 'string'){
				c.innerHTML += part;
			}
			else {
				me.addWhiteboard(part);
			}
		});
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
		try { window.getSelection().removeAllRanges(); }
		catch(e) { console.log("Removing all ranges from selection failed: ",e.message); }
	},

	updatePrefs: function(v){
		this.shareMenu.reload(v);
		this.updateShareWithLabel();
	}



}, function(){
	window.NoteEditorActions = this;
});
