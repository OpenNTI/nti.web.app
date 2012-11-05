Ext.define('NextThought.view.annotations.note.EditorActions', {
	requires: [
		'NextThought.util.Ranges',
		'NextThought.view.menus.Share'
	],

	mixins: {
		observable: 'Ext.util.Observable'
	},

	//default value (allow the cursor into the placeholder div, but don't take any space)
	defaultValue: '&#8203;',

	wbThumbnailTpm: Ext.DomHelper.createTemplate({
		cls: 'editWhitebaord',
		cn:[{
				cls:'centerer'
			},{
				tag   : 'img',
				src   : '{0}',
				id    : '{1}',
				cls   : 'wb-thumbnail',
				alt   : 'Whiteboard Thumbnail',
				border: 0
			}
		]
	}).compile(),

	constructor: function (cmp, editorEl) {
		var me = this,
			Ce = Ext.CompositeElement;

		me.editor = editorEl;
		me.cmp = cmp;
		me.openWhiteboards = {};
		me.shareMenu = Ext.widget('share-menu');
		this.updateShareWithLabel();
		me.mixins.observable.constructor.call(me);


		(new Ce(editorEl.query('.action,.content'))).set({tabIndex: 1});

		cmp.mon(me.shareMenu, {
			scope  : me,
			changed: me.updateShareWithLabel
		});

		cmp.mon(new Ce(editorEl.query('.left .action')), {
			scope: me,
			click: me.editorContentAction
		});

		cmp.mon(editorEl, {
			scope      : me,
			mousedown  : me.editorMouseDown,
			selectstart: me.editorSelectionStart,
			click      : function (e) {
				if(!e.getTarget('.content')){ editorEl.down('.content > *').focus(); }
			}
		});

		editorEl.down('.content').selectable();

		cmp.mon(editorEl.down('.content'), {
			scope      : me,
			selectstart: me.editorSelectionStart,
			focus      : me.editorFocus,
			keyup      : me.handleOnKeyup,
			paste      : me.handlePaste,
			click      : me.handleClick,
			contextmenu: me.handleContext
		});

		if (!$AppConfig.service.canShare()) {
			editorEl.down('.action.share').hide();
		}
		cmp.mon(editorEl.down('.action.share'), {
			scope: me,
			click: me.openShareMenu
		});

		cmp.on('destroy',function(){
			Ext.Object.each(me.openWhiteboards,function(k,v){v.destroy();}); });

		//Keep state of text treatments
		me.bold = false;
		me.underline = false;
		me.italic = false;
	},


	activate: function () {
		this.updatePrefs();
		this.editor.addCls('active');
	},


	deactivate: function () {
		this.editor.removeCls('active');
		this.lastRange = null;
	},


	handleContext: function(e){
		e.stopPropagation();
		return true;
	},


	/**
	 *  @see http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser/
	 */
	handlePaste: function (e, elem) {
		elem = e.getTarget('.content');
		var be = e.browserEvent,
		cd = be ? be.clipboardData : null,
		sel = window.getSelection(),
		savedRange = RangeUtils.saveRange(sel.getRangeAt(0)),
		offScreenBuffer = document.createElement('div');

		document.body.appendChild(offScreenBuffer);
		offScreenBuffer.style.position = 'absolute';
		offScreenBuffer.style.left = '-1000px';
		offScreenBuffer.style.top = '-1000px';
		offScreenBuffer.contentEditable = true;
		offScreenBuffer.focus();

		// Webkit - get data from clipboard, put into editdiv, cleanup, then cancel event
		if (cd && cd.getData) {
			e.stopEvent();
			if (/text\/html/.test(cd.types)) {
				offScreenBuffer.innerHTML = cd.getData('text/html');
			}
			else if (/text\/plain/.test(cd.types)) {
				offScreenBuffer.innerHTML = cd.getData('text/plain');
			}
			else {
				offScreenBuffer.innerHTML = '';
			}
			this.waitForPasteData(offScreenBuffer, savedRange, elem);
			return false;
		}
		// Everything else allow browser to paste content into it, then cleanup
		else {
			offScreenBuffer.innerHTML = '';
			this.waitForPasteData(offScreenBuffer, savedRange, elem);
			return true;
		}
	},


	waitForPasteData: function (offScreenBuffer, savedRange, elem, callCount) {
		var me = this;
		callCount = callCount || 0;
		if (offScreenBuffer.childNodes && offScreenBuffer.childNodes.length > 0) {
			setTimeout(function () {
				me.processPaste(offScreenBuffer, savedRange, elem);
			}, 20);
		}
		else if (callCount < 100) {
			setTimeout(function () {
				me.waitForPasteData(offScreenBuffer, savedRange, elem, callCount + 1);
			}, 20);
		}
		else {
			console.log('timedout waiting for paste');
			document.body.removeChild(offScreenBuffer);
		}
	},


	processPaste: function (offScreenBuffer, savedRange, elem) {
		var pasteddata = offScreenBuffer.innerHTML, range, frag;

		try {
			range = RangeUtils.restoreSavedRange(savedRange);
		} catch (e) {
			console.log('Error recreating rangeDesc during processPaste.', savedRange, pasteddata);
			document.body.removeChild(offScreenBuffer);
			return;
		}

		try {
			pasteddata = pasteddata.replace(/\s*(style|class)=".+?"\s*/ig, ' ').replace(/<span.*?>&nbsp;<\/span>/ig, '&nbsp;').replace(/<meta.*?>/ig, '');
			frag = range.createContextualFragment(pasteddata);
			range.deleteContents();
			range.insertNode(frag);
			range.collapse(false);
			//Note this I think this breaks badily in IE < 9
			window.getSelection().removeAllRanges();
			this.lastRange = range;
			window.getSelection().addRange(range);
		}
		catch (e2) {
			console.log(pasteddata, e2);
		}
		elem.focus();
		document.body.removeChild(offScreenBuffer);
	},


	editorMouseDown: function (e) {
		var s = window.getSelection();
		if (e.getTarget('.action', undefined, true)) {
			if (s.rangeCount) {
				this.lastRange = s.getRangeAt(0);
			}
		}
	},


	updateShareWithLabel: function () {
		this.editor.down('.action.share').update(this.shareMenu.getLabel());
	},


	editorSelectionStart: function (e) {
		e.stopPropagation();//re-enable selection, and prevent the handlers higher up from firing.
		return true;//re-enable selection
	},


	openShareMenu: function (e) {
		e.stopEvent();
		this.shareMenu.showBy(this.editor.down('.action.share'), 't-b?');
		return false;
	},


	editorFocus: function () {
		var s = window.getSelection();
		if (this.lastRange) {
			s.removeAllRanges();
			s.addRange(this.lastRange);
		}
		else if (s.rangeCount > 0) {
			this.lastRange = s.getRangeAt(0);
		}
	},


	handleOnKeyup: function(e){
		this.maybeResizeContentBox();
		this.detectFontStyleAction();
	},


	maybeResizeContentBox: function () {
		var p = this.previousEditorHeight || 0,
				h = this.editor.getHeight();

		this.previousEditorHeight = h;

		if (h !== p) {
			this.cmp.updateLayout();
		}
	},


	editorContentAction: function (e) {
		var t = e.getTarget('.action', undefined, true), action;
		if (t) {
			if (t.is('.whiteboard')) {
				this.addWhiteboard();
			}
			else {
				action = t.getAttribute('class').split(' ')[1];

				if(action === 'bold'){ this.bold = !this.bold; }
				if(action === 'italic'){ this.italic = !this.italic; }
				if(action === 'underline'){ this.underline = !this.underline; }
			}
			this.applyTextTreatments();
		}
	},


	applyTextTreatments: function(){
		var b =  this.editor.down('.bold'),
			i =  this.editor.down('.italic'),
			u = this.editor.down('.underline');

		this.editor.dom.querySelector('[contenteditable=true]').focus();

		if(this.bold !== document.queryCommandState('bold')){
			document.execCommand('bold', null, null);
		}
		if(this.italic !== document.queryCommandState('italic')){
			document.execCommand('italic', null, null);
		}
		if(this.underline !== document.queryCommandState('underline')){
			document.execCommand('underline', null, null);
		}

		b[document.queryCommandState('bold') ? 'addCls':'removeCls']('selected');
		i[document.queryCommandState('italic') ? 'addCls' : 'removeCls']('selected');
		u[document.queryCommandState('underline') ? 'addCls':'removeCls']('selected');
	},


	detectFontStyleAction: function(){
		var b =  this.editor.down('.bold'),
			i =  this.editor.down('.italic'),
			u = this.editor.down('.underline');

		b[document.queryCommandState('bold') ? 'addCls':'removeCls']('selected');
		i[document.queryCommandState('italic') ? 'addCls' : 'removeCls']('selected');
		u[document.queryCommandState('underline') ? 'addCls':'removeCls']('selected');
	},


	handleClick: function (e) {
		var guid, t = e.getTarget('img.wb-thumbnail');

		if (t) {
			guid = t.getAttribute('id');
			t = this.openWhiteboards[guid];
			if( t && !t.isDestroyed ){
				t.show();
			}
			else {
				alert('No whiteboard');
			}
		}
		else{
			this.detectFontStyleAction(e);
		}
	},


	addWhiteboard: function (data) {
		//pop open a whiteboard:
		data = data || (function () {
		}()); //force the falsy value of data to always be undefinded.

		var me = this,
				wbWin = Ext.widget('wb-window', { width: 802, value: data, closeAction: 'hide' }),
				guid = guidGenerator(),
				content = me.editor.down('.content');

		//remember the whiteboard window:
		wbWin.guid = guid;
		this.openWhiteboards[guid] = wbWin;

		//Hide note nav-helper - to avoid it from being on top of the WB
		if (Ext.query('.nav-helper')[0]) {
			Ext.fly(Ext.query('.nav-helper')[0]).hide();
		}


		if (data) {
			me.insertWhiteboardThumbnail(content, guid, wbWin.down('whiteboard-editor'));
		}

		//hook into the window's save and cancel operations:
		this.cmp.mon(wbWin, {
			save  : function (win, wb) {
				data = wb.getValue();
				me.insertWhiteboardThumbnail(content, guid, wb);
				if (Ext.query('.nav-helper')[0]) {
					Ext.fly(Ext.query('.nav-helper')[0]).show();
				}
				wbWin.hide();
			},
			cancel: function() {
				//if we haven't added the wb to the editor, then clean up, otherwise let the window handle it.
				if(!data){
					me.cleanOpenWindows(guid);
					wbWin.close();
				}

			}
		});

		if (!data) {
			wbWin.show();
		}
	},


	insertWhiteboardThumbnail: function (content, guid, wb) {
		var me = this,
			el = Ext.get(guid), placeholder, p;

		//We need empty divs to allow to insert text before or after a WB.
		placeholder = Ext.DomHelper.createTemplate({cn: [
			{tag: 'br'}
		]});

		if (!el) {
			el = me.wbThumbnailTpm.append(content, ['', guid]);

			if (content.dom.firstChild === Ext.select('img.wb-thumbnail').elements[0]) {
				placeholder.insertBefore(el);
			}
			placeholder.insertAfter(el);
		}


		wb.getThumbnail(function (data) {
			el = Ext.get(guid);
			var p = placeholder.insertBefore(el);
			el.remove();

			//recreate image with data
			me.wbThumbnailTpm.insertBefore(p, [data, guid]);
			Ext.fly(p).remove();

			me.editor.repaint();
			me.fireEvent('size-changed');
		});
	},


	cleanOpenWindows: function (guids) {
		var me = this;

		if(!guids){
			guids = Ext.Object.getKeys(me.openWhiteboards);
		}

		if (!Ext.isArray(guids)) {
			guids = [guids];
		}

		Ext.each(guids, function (g) {
			var w = me.openWhiteboards[g];
			delete me.openWhiteboards[g];
			if(w && w.destroy){
				w.destroy();
			}
		});
	},


	getNoteBody: function (str) {
		var r = [],
			regex = /<img.*?>/gi,
			splits,
			whiteboards,
			s, w = 0, t, wbid;

		//split it up, then interleave:
		splits = str.split(regex);
		whiteboards = str.match(regex) || [];
		if (splits.length === 0) {
			splits.push('');
		} //no text before WB?  just trick it.
		for (s = 0; s < splits.length; s++) {
			t = splits[s];
			if (t && t.length > 0) {
				r.push(t);
			}
			for (w; w < whiteboards.length; w++) {
				wbid = whiteboards[w].match(/id="(.*?)"/)[1];
				r.push(this.openWhiteboards[wbid].getEditor().getValue());
			}
		}

		return r;
	},


	focus: function (collapse) {
		var me = this;

		function collapseToEnd() {
			var s, content, c = me.editor.down('.content').dom, r;
			if (c.innerHTML) {
				try {
					s = window.getSelection();
					r = document.createRange();
					r.selectNodeContents(c.firstChild);
					s.removeAllRanges();
					r.collapse(false);
					me.lastRange = r;
					s.addRange(me.lastRange);

				}
				catch (e) {
					console.warn('focus issue: ' + e.message, '\n\n\n', content);
				}
			}
		}

		this.editor.down('.content').focus();
		if (collapse) {
			collapseToEnd();
		}
	},


	editBody: function (body) {
		var me = this,
			c = this.editor.down('.content > div').dom;

		c.innerHTML = "";//clear what ever is in there

		Ext.each(body, function (part) {
			if (typeof part === 'string') {

				c.innerHTML += part.replace(/\u200B/g,'');
			}
			else {
				me.addWhiteboard(part);
			}
		});
	},


	getValue: function () {
		//Sanitize some new line stuff that various browsers produce.
		//See http://stackoverflow.com/a/12832455 and http://jsfiddle.net/sathyamoorthi/BmTNP/5/
		var out =[], sel = this.editor.select('.content > *');
		sel.each(function(div){
			var html, tmp;
			try {
				html = div.getHTML() || '';
				if(!html && div.dom.tagName === 'IMG'){
					tmp = document.createElement("div");
					tmp.appendChild(div.dom);
					html = tmp.innerHTML || '';
				}
				out.push(html.replace(/\u200B|<br\/?>/g,''));
			}
			catch(er){
				console.warn('Oops, '+er.message);
			}
		});

		return {
			body     : this.getNoteBody(out.join('<br/>')),
			shareWith: this.shareMenu.getValue()
		};
	},


	setValue: function (text, putCursorAtEnd, focus) {
		this.setHTML(Ext.String.htmlEncode(text));
		this.updatePrefs();
		if (focus || putCursorAtEnd) {
			this.focus(putCursorAtEnd);
		}
	},


	setHTML: function (html) {
		//if we are given a blank value, or the value doesn't begin with a div, wrap it.
		if(!html || !/^<div/im.test(html)){
			//the div wrapper is for IE
			html = '<div>'+(html||this.defaultValue)+'</div>';
		}
		this.editor.down('.content').dom.innerHTML = html;
	},


	reset: function () {
		this.editor.down('.content').innerHTML = '<div>'+this.defaultValue+'</div>';
		this.cleanOpenWindows();
		try {
			window.getSelection().removeAllRanges();
			this.lastRange = null;
		}
		catch (e) {
			console.log('Removing all ranges from selection failed: ', e.message);
		}
	},


	updatePrefs: function (v) {
		this.shareMenu.reload(v);
		this.updateShareWithLabel();
	}


}, function () {
	window.NoteEditorActions = this;
});
