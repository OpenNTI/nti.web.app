Ext.define('NextThought.view.annotations.note.EditorActions', {
	requires: [
		'NextThought.util.Ranges',
		'NextThought.view.menus.Share'
	],

	mixins: {
		observable: 'Ext.util.Observable',
		placeholderFix: 'NextThought.view.form.fields.PlaceholderPolyfill'
	},

	statics: {
		supportedTypingAttributes : ['bold', 'underline', 'italic']
	},

	//default value (allow the cursor into the placeholder div, but don't take any space)
	defaultValue: '&#8203;',

	wbThumbnailTpm: Ext.DomHelper.createTemplate({
		contentEditable: false,
		cls: 'whiteboard-divider',
		unselectable: 'on',
		cn:[{
			cls: 'whiteboard-wrapper',
			cn:[{
				tag   : 'img',
				src   : '{0}',
				id    : '{1}',
				cls   : 'wb-thumbnail',
				alt   : 'Whiteboard Thumbnail',
				unselectable: 'on',
				border: 0
			},{
				cls: 'fill', unselectable: 'on'
			},{
				cls:'centerer',
				unselectable: 'on',
				cn: [{
					unselectable: 'on',
					cls:'edit',
					html:'Edit'
				}]
			}]
		}]
	}).compile(),


	constructor: function (cmp, editorEl) {
		var me = this,
			Ce = Ext.CompositeElement;

		me.mixins.observable.constructor.call(me);
		me.mixins.placeholderFix.constructor.call(me);

		me.editor = editorEl;
		me.cmp = cmp;
		me.openWhiteboards = {};
		me.shareMenu = Ext.widget('share-menu');

		me.titleEl = editorEl.down('.title input');
		if( me.titleEl ){
			me.renderPlaceholder(me.titleEl);
			me.mon(me.titleEl,{
				'click':function(e){e.stopPropagation();},
				'mousedown':function(e){e.stopPropagation();},
				'keydown':function(e){
					var t = e.getTarget();
					Ext.callback((t||{}).setAttribute, t, ['value',t.value]);
				}
			});
		}

		this.updateShareWithLabel();

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
			click      : function (e) {
				if(!e.getTarget('.content') && !e.getTarget('.action')){
					editorEl.down('.content').focus();
					this.collapseToEnd();
				}
			}
		});

		editorEl.down('.content').selectable();

		cmp.mon(editorEl.down('.content'), {
			scope      : me,
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

		this.typingAttributes = [];
	},


	activate: function () {
		this.updatePrefs();
		this.editor.addCls('active');
	},


	isActive: function(){ return this.editor.hasCls('active'); },


	disable: function(){
		this.deactivate();
		this.editor.addCls(['active','disabled']);
		this.editor.down('.content').set({'contenteditable':undefined});
	},


	enable: function(){
		this.editor.removeCls('disabled');
		this.editor.down('.content').set({'contenteditable':'true'});
	},


	deactivate: function () {
		this.editor.removeCls('active');
		this.lastRange = null;
		this.cleanOpenWindows();
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
		offScreenBuffer.innerHTML = '';
		this.waitForPasteData(offScreenBuffer, savedRange, elem);
		return true;
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


	openShareMenu: function (e) {
		e.stopEvent();
		this.shareMenu.showBy(this.editor.down('.action.share'), 't-b?');
		return false;
	},


	editorFocus: function (e) {
		var s = window.getSelection();
		if (this.lastRange) {
			if(s.rangeCount > 0){
				s.removeAllRanges();
			}
			s.addRange(this.lastRange);
		}
		else if (s.rangeCount > 0) {
			this.lastRange = s.getRangeAt(0);
		}
	},


	handleOnKeyup: function(e){
		this.maybeResizeContentBox();
		this.detectTypingAttributes();
		this.checkWhiteboards();
	},


	maybeResizeContentBox: function () {
		var p = this.previousEditorHeight || 0,
				h = this.editor.getHeight();

		this.previousEditorHeight = h;

		if (h !== p) {
			this.cmp.updateLayout();
		}
	},


	syncTypingAttributeButtons: function(){
		var me = this,
			buttonsName = ['bold', 'italic', 'underline'];

		Ext.each(buttonsName, function(bn){
			var b = me.editor.down('.'+bn);
			b[Ext.Array.contains(me.typingAttributes, bn) ? 'addCls' : 'removeCls']('selected');
		});
	},


	setTypingAttributes: function(attrs, alreadyFocused){
		this.typingAttributes = attrs.slice();
		if(!alreadyFocused){
			this.editor.down('.content').focus();
			this.editorFocus();
		}
		this.syncTypingAttributeButtons();
		this.applyTypingAttributesToEditable();
	},


	getTypingAttributes: function(){
		if(this.typingAttributes === undefined){
			this.typingAttributes = [];
		}
		return this.typingAttributes;
	},


	applyTypingAttributesToEditable: function(){
		var actions = this.self.supportedTypingAttributes, me = this;
		Ext.each(actions, function(action){
			if(   document.queryCommandSupported(action)
			   && document.queryCommandState(action) !== Ext.Array.contains(me.getTypingAttributes(), action)){
				document.execCommand(action, false, false);
			}
		});
	},


	editorContentAction: function(e){
		var t = e.getTarget('.action', undefined, true), action;
		if (t) {
			if (t.is('.whiteboard')) {
				this.addWhiteboard();
			}
			else{
				action = (t.getAttribute('class')||'').split(' ')[1];
				this.toggleTypingAttribute(action);
			}
		}
	},


	toggleTypingAttribute: function(action){
		var attrs = this.getTypingAttributes().slice();
		if(Ext.Array.contains(attrs, action)){
			Ext.Array.remove(attrs, action);
		}
		else{
			Ext.Array.push(attrs, action);
		}
		this.setTypingAttributes(attrs);
	},


	detectTypingAttributes: function(){
		var actions = this.self.supportedTypingAttributes;
		var attrs = [];
		Ext.each(actions, function(action){
			if(document.queryCommandState(action)){
				attrs.push(action);
			}
		});
		this.setTypingAttributes(attrs, true);
	},


	handleClick: function (e) {
		var guid, t = e.getTarget('.whiteboard-wrapper');

		if (t) {
			guid = Ext.fly(t).down('img').getAttribute('id');
			t = this.openWhiteboards[guid];
			if( t && !t.isDestroyed ){
				t.show();
			}
			else {
				alert('No whiteboard');
			}
		}
		else{
			this.detectTypingAttributes(e);
		}
	},


	checkWhiteboards: function(){
		var me = this;
		Ext.Object.each(this.openWhiteboards,function(guid){
			if(!Ext.get(guid)){
				me.removeWhiteboard(guid);
				me.fireEvent('droped-whiteboard',guid);
			}
		});
	},


	removeWhiteboard: function(guid){
		var w = this.openWhiteboards[guid],
			el = Ext.get(guid);

		if(el){ el.parent('.whiteboard-divider').remove();}

		if(w){
			w.destroy();
			delete this.openWhiteboards[guid];
		}
	},


	addWhiteboard: function (data,guid) {
		data = data || (function () {}()); //force the falsy value of data to always be undefinded.

		var me = this, wbWin, content;

		if(typeof(guid) !== 'string'){
			guid = guidGenerator();
		}
		if(this.openWhiteboards[guid]){
			return;
		}

		//pop open a whiteboard:
		wbWin = Ext.widget('wb-window', { width: 802, value: data, closeAction: 'hide' });

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
			el = Ext.get(guid), placeholder, test;

		//We need empty divs to allow to insert text before or after a WB.
		placeholder = Ext.DomHelper.createTemplate({html: me.defaultValue});

		if (!el) {

			Ext.each(content.query('> div'),function(n){
				if(n.firstChild === n.lastChild && n.firstChild && n.firstChild.nodeValue === '\u200B'){
					Ext.removeNode(n);
				}
			});

			placeholder.append(content);

			el = me.wbThumbnailTpm.append(content, ['', guid]);
			Ext.fly(el).unselectable();

			placeholder.append(content);
		}


		wb.getThumbnail(function (data) {
			el = Ext.get(guid).up('.whiteboard-divider');
			var p = placeholder.insertBefore(el),
				wbt;
			el.remove();
			//recreate image with data
			wbt = me.wbThumbnailTpm.insertBefore(p, [data, guid], true);
			wbt.select('img').on('load',function(){
				me.fireEvent('size-changed');
				me.editor.repaint();
			});
			wbt.unselectable();
			Ext.fly(p).remove();

			me.fireEvent('size-changed');
			me.focus(true);
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


	getNoteBody: function (parts) {
		var r = [],
			regex = /<img.*?>/i, i, part, me = this;

		function whiteboardFromPart(wp){
			var wbid = wp.match(/id="(.*?)"/)[1];
			return me.openWhiteboards[wbid].getEditor().getValue();
		}

		function stripTrailingBreak(text){
			return text.replace(/<br\/?>$/, '');
		}

		parts = parts || [];

		for(i = 0; i<parts.length; i++){
			part = parts[i];
			//if its a whiteboard do our thing
			if(regex.test(part)){
				r.push(whiteboardFromPart(part));
			}
			else{
				part = stripTrailingBreak(part);
				//if this is the first part or the thing before us
				//is not an array push this part as an array,
				//otherwise push us onto the previos part which should be an array
				if(r.length === 0 || !Ext.isArray(r[r.length-1])){
					r.push([part]);
				}
				else{
					r[r.length-1].push(part);
				}
			}
		}

		//Now make a pass over r joining any multiple text parts by <br>
		for(i = 0; i<r.length; i++){
			if(Ext.isArray(r[i])){
				r[i] = r[i].join('<br/>');
			}
		}

		r = Ext.Array.filter(r, function(i){
			var tmp;

			if(!Ext.isString(i)){
				return true;
			}

			if(Ext.isEmpty(i)){
				return false;
			}
			//if we are just whitespace and html whitespace
			tmp = i.replace(/<br\/?>/g, '');
			return !Ext.isEmpty(tmp.trim());
		});

		return r;
	},


	collapseToEnd: function(){
		var s, me = this, content, c = me.editor.down('.content').dom, r;
		if (c.innerHTML) {
			try {
				s = window.getSelection();
				r = document.createRange();
				r.selectNodeContents(c.lastChild);
				s.removeAllRanges();
				r.collapse(false);
				me.lastRange = r;
				s.addRange(me.lastRange);

			}
			catch (e) {
				console.warn('focus issue: ' + e.message, '\n\n\n', content);
			}
		}
	},


	focus: function (collapse) {
		this.editor.down('[contenteditable=true]').focus();
		if (collapse) {
			this.collapseToEnd();
		}
	},


	editBody: function (body) {
		var me = this,
			c = this.editor.down('.content').dom;

		if(body && body.length > 0){
			c.innerHTML = '';
		}
		Ext.each(body, function (part) {
			var d = document.createElement('div');
			if (typeof part === 'string') {
				d.innerHTML += part.replace(/\u200B/g,'');
				c.appendChild(d);
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
				if(div.is('.whiteboard-divider') || div.is('.whiteboard-wrapper')){
					html = '';
					div = div.down('img');
				}

				if(!html && div.dom.tagName === 'IMG'){
					tmp = document.createElement("div");
					tmp.appendChild(div.dom);
					html = tmp.innerHTML || '';
				}
				html = html.replace(/\u200B/g,'');
				out.push(html);
			}
			catch(er){
				console.warn('Oops, '+er.message);
			}
		});

		return {
			body : this.getNoteBody(out),
			shareWith : this.shareMenu.getValue(),
			publish: false,
			title: this.titleEl ? this.titleEl.getValue() : undefined//,
//			tags: this.tagList.toList()
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
		var buttonsName = ['bold', 'italic', 'underline'], me = this, selection;
		this.editor.down('.content').innerHTML = '<div>'+this.defaultValue+'</div>';
		this.cleanOpenWindows();
		try {
			// Deselect btns.
			Ext.each(buttonsName, function(bn){
				var b = me.editor.down('.'+bn);
				if(b){ b.removeCls('selected'); }
			});
			delete this.typingAttributes;
			this.lastRange = null;

			if(window.getSelection){
				selection = window.getSelection();
				selection.removeAllRanges();
			}
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
