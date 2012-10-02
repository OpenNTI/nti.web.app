Ext.define('NextThought.view.annotations.note.EditorActions', {
	requires:[
		'NextThought.util.Ranges', 'NextThought.view.menus.Share'
	],

	mixins:{
		observable:'Ext.util.Observable'
	},

	wbThumbnailTpm:Ext.DomHelper.createTemplate({
		tag:'img',
		src:'{0}',
		id:'{1}',
		cls:'wb-thumbnail',
		alt:'Whiteboard Thumbnail',
		border:0
	}).compile(),

	constructor:function (cmp, editorEl) {
		var me = this, Ce = Ext.CompositeElement;
		me.editor = editorEl;
		me.cmp = cmp;
		me.openWhiteboards = {};
		me.shareMenu = Ext.widget('share-menu');
		this.updateShareWithLabel();
		me.mixins.observable.constructor.call(me);


		(new Ce(editorEl.query('.action,.content'))).set({tabIndex:1});

		cmp.mon(me.shareMenu, {
			scope:me,
			changed:me.updateShareWithLabel
		});

		cmp.mon(new Ce(editorEl.query('.left .action')), {
			scope:me,
			click:me.editorContentAction
		});

		cmp.mon(editorEl, {
			scope:me,
			mousedown:me.editorMouseDown,
			selectstart:me.editorSelectionStart,
			click:function () {
				editorEl.down('.content').focus();
			}
		});

		editorEl.down('.content').selectable();

		cmp.mon(editorEl.down('.content'), {
			scope:me,
			selectstart:me.editorSelectionStart,
			focus:me.editorFocus,
			keyup:me.maybeResizeContentBox,
			paste:me.handlePaste,
			click:me.handleClick
		});

		if (!$AppConfig.service.canShare()) {
			editorEl.down('.action.share').hide();
		}
		cmp.mon(editorEl.down('.action.share'), {
			scope:me,
			click:me.openShareMenu
		});
	},


	activate:function () {
		this.updatePrefs();
		this.editor.addCls('active');
	},


	deactivate:function () {
		this.editor.removeCls('active');
		this.lastRange = null;
	},


	/**
	 *  @see http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser/
	 */
	handlePaste:function (e, elem) {
		elem = e.getTarget('.content');
		var be = e.browserEvent, cd = be ? be.clipboardData : null, sel = window.getSelection(), savedRange = RangeUtils.saveRange(sel.getRangeAt(0)), offScreenBuffer = document.createElement('div');

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
			} else if (/text\/plain/.test(cd.types)) {
				offScreenBuffer.innerHTML = cd.getData('text/plain');
			} else {
				offScreenBuffer.innerHTML = "";
			}
			this.waitForPasteData(offScreenBuffer, savedRange, elem);
			return false;
		}
		// Everything else allow browser to paste content into it, then cleanup
		else {
			offScreenBuffer.innerHTML = "";
			this.waitForPasteData(offScreenBuffer, savedRange, elem);
			return true;
		}
	},


	waitForPasteData:function (offScreenBuffer, savedRange, elem, callCount) {
		var me = this;
		callCount = callCount || 0;
		if (offScreenBuffer.childNodes && offScreenBuffer.childNodes.length > 0) {
			setTimeout(function () {
				me.processPaste(offScreenBuffer, savedRange, elem);
			}, 20);
		} else if (callCount < 100) {
			setTimeout(function () {
				me.waitForPasteData(offScreenBuffer, savedRange, elem, callCount + 1);
			}, 20);
		} else {
			console.log('timedout waiting for paste');
			document.body.removeChild(offScreenBuffer);
		}
	},


	processPaste:function (offScreenBuffer, savedRange, elem) {
		var pasteddata = offScreenBuffer.innerHTML, range, frag;

		try {
			range = RangeUtils.restoreSavedRange(savedRange);
		} catch (e) {
			console.log('Error recreating rangeDesc during processPaste.', rangeDesc, pasteddata);
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
		} catch (e2) {
			console.log(pasteddata, e2);
		}
		elem.focus();
		document.body.removeChild(offScreenBuffer);
	},


	editorMouseDown:function (e) {
		var s = window.getSelection();
		if (e.getTarget('.action', undefined, true)) {
			if (s.rangeCount) {
				this.lastRange = s.getRangeAt(0);
			}
		}
	},


	updateShareWithLabel:function () {
		this.editor.down('.action.share').update(this.shareMenu.getLabel());
	},


	editorSelectionStart:function (e) {
		e.stopPropagation();//re-enable selection, and prevent the handlers higher up from firing.
		return true;//re-enable selection
	},


	openShareMenu:function (e) {
		e.stopEvent();
		this.shareMenu.showBy(this.editor.down('.action.share'), 't-b?');
		return false;
	},


	editorBlur:function () {
		console.log('editor blur');
		var s = window.getSelection();
		if (s.rangeCount) {
			this.lastRange = s.getRangeAt(0);
		}
	},


	editorFocus:function () {
		var s = window.getSelection();
		if (this.lastRange) {
			s.removeAllRanges();
			s.addRange(this.lastRange);
		} else if (s.rangeCount > 0) {
			this.lastRange = s.getRangeAt(0);
			s.removeAllRanges();
			s.addRange(this.lastRange);
		}
	},


	maybeResizeContentBox:function () {
		var p = this.previousEditorHeight || 0, h = this.editor.getHeight();

		this.previousEditorHeight = h;

		if (h !== p) {
			this.cmp.updateLayout();
		}
	},


	editorContentAction:function (e) {
		var t = e.getTarget('.action', undefined, true), action;
		if (t) {
			this.editorFocus();//reselect
			if (t.is('.whiteboard')) {
				this.addWhiteboard();
			} else {
				action = t.getAttribute('class').split(' ').pop();
				this.editor.dom.querySelector('[contenteditable=true]').focus();
				document.execCommand(action, null, null);
			}
		}
		e.stopEvent();
		return false;
	},

	handleClick:function (e) {
		var guid, t = e.getTarget('img.wb-thumbnail');

		if (t) {
			guid = t.getAttribute('id');
			this.openWhiteboards[guid].show();
		}
	},

	addWhiteboard:function (data) {
		//pop open a whiteboard:
		data = data || (function () {
		}()); //force the falsy value of data to always be undefinded.

		var me = this, wbWin = Ext.widget('wb-window', {height:'75%', width:'50%', value:data }), guid = guidGenerator(), content = me.editor.down('.content');

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
			save:function (win, wb) {
				me.insertWhiteboardThumbnail(content, guid, wb);
				if (Ext.query('.nav-helper')[0]) {
					Ext.fly(Ext.query('.nav-helper')[0]).show();
				}
				wbWin.hide();
			},
			cancel:function (win) {
				//if we haven't added the wb to the editor, then clean up, otherwise let the window handle it.
				if (!Ext.get(guid)) {
					me.cleanOpenWindows(win.guid);
					wbWin.close();
				}
			}
		});

		if (!data) {
			wbWin.show();
		}
	},


	insertWhiteboardThumbnail:function (content, guid, wb) {
		var me = this, el = Ext.get(guid), placeholder, p;

		//We need empty divs to allow to insert text before or after a WB.
		placeholder = Ext.DomHelper.createTemplate({cn:[
			{tag:'br'}
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


	cleanOpenWindows:function (guids) {
		var me = this;

		if (!Ext.isArray(guids)) {
			guids = [guids];
		}

		Ext.each(guids, function (g) {
			delete me.openWhiteboards[g];
		});
	},


	getNoteBody:function (str) {
		var r = [], regex = /<img.*?>/gi, splits, whiteboards, s, w = 0, t, wbid;

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


	focus:function (collapse) {
		var me = this;

		function collapseToEnd() {
			var s, content, c = me.editor.down('.content').dom, r;
			if (c.innerHTML) {
				try {
					s = window.getSelection();
					r = document.createRange();
					r.selectNodeContents(c.lastChild);
					s.removeAllRanges();
					r.collapse(false);
					s.addRange(r);
				} catch (e) {
					console.warn('focus issue: ' + e.message, "\n\n\n", content);
				}
			}
		}

		this.editor.down('.content').focus();
		if (collapse) {
			collapseToEnd();
		}
	},


	editBody:function (body) {
		var me = this, c = this.editor.down('.content').dom;

		Ext.each(body, function (part) {
			if (typeof part === 'string') {
				c.innerHTML += part;
			} else {
				me.addWhiteboard(part);
			}
		});
	},


	getValue:function () {
		return {
			body:this.getNoteBody(this.editor.down('.content').getHTML()),
			shareWith:this.shareMenu.getValue()
		};
	},


	setValue:function (text, putCursorAtEnd, focus) {
		var r, c = this.editor.down('.content').dom, s = window.getSelection(), content;
		this.setHTML(Ext.String.htmlEncode(text));
		content = c.innerHTML;

		this.updatePrefs();

		if (putCursorAtEnd && content && content.length > 0) {
			try {
				s.removeAllRanges();
				r = document.createRange();
				r.setStart(c.firstChild, content.length);
				r.collapse(true);
				s.addRange(r);
			} catch (e) {
				console.warn('focus issue: ' + e.message, "\n\n\n", content);
			}
		}

		if (focus) {
			this.focus();
		}
	},


	setHTML:function (html) {
		this.editor.down('.content').dom.innerHTML = html;
	},


	reset:function () {
		this.editor.down('.content').innerHTML = '';
		try {
			window.getSelection().removeAllRanges();
			this.lastRange = null;
		} catch (e) {
			console.log("Removing all ranges from selection failed: ", e.message);
		}
	},


	updatePrefs:function (v) {
		this.shareMenu.reload(v);
		this.updateShareWithLabel();
	}


}, function () {
	window.NoteEditorActions = this;
});
