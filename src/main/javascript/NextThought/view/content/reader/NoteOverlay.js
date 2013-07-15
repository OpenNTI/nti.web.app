Ext.define('NextThought.view.content.reader.NoteOverlay', {
	alias: 'reader.noteOverlay',
	mixins: { observable: 'Ext.util.Observable' },
	requires: [
		'NextThought.util.Line',
		'NextThought.view.whiteboard.Utils',
		'NextThought.editor.Editor'
	],


	constructor: function (config) {
		Ext.apply(this,config);
		this.mixins.observable.constructor.call(this);
		this.mon(this.reader,{
			scope: this,
			destroy:'destroy',
			afterRender: 'insertOverlay',
			'content-updated': 'onContentUpdate',
			'markupenabled-action': 'contentDefinedAnnotationAction',
			'sync-height': 'syncHeight',
			'create-note': 'noteHere',
			'beforenavigate': 'onNavigation'
		});


		this.data = {
			/** @private */
			visibilityCls: 'note-overlay-hidden'
		};


		this.reader.fireEvent('uses-page-preferences', this);
	},


	insertOverlay: function () {

		var me = this,
			box,
			container = {
				cls: 'note-gutter',
				style: {
					height: me.reader.getIframe().get().getHeight()
				},
				cn: [
					{ cls: 'note-here-control-box' }
				]
			};

		me.container = container = Ext.DomHelper.insertAfter(me.reader.getInsertionPoint().first(), container, true);

		box = me.data.box = container.down('.note-here-control-box');
		box.visibilityCls = this.data.visibilityCls;
		box.setVisibilityMode(Ext.Element.ASCLASS);
		box.hide();

		me.mon(box,{
			click: 'openEditor',
			mouseover:'overNib',
			mousemove:'overNib',
			mouseout:'offNib',
			scope:me
		});

		me.reader.getScroll().registerHandler(me.onScroll, me);

		me.reader.on('destroy','destroy',
			me.mon(container.parent(), {
				scope: me,
				destroyable: true,
				mousemove: 'mouseOver',
				mouseover: 'mouseOver',
				mouseout: 'mouseOut'
			}));

		me.reader.on({
		//no buffer
			'iframe-mouseout':'mouseOut',
			'iframe-mousedown':'suspendResolver',
			'iframe-mouseup':'resumeResolver',
			scope:me
		});
		me.reader.on({
			scope: me,
			'iframe-mousemove':'mouseOver',
			buffer: 400
		});
	},


	getAnnotationOffsets: function(){
		return this.reader.getAnnotationOffsets();
	},

	onNavigation: function(){
		if(this.editor && this.editor.isActive()){
			var msg = "You are currently creating a note. Please save or cancel it first.";
			Ext.defer(function(){ alert({msg: msg}); }, 1);

			return false;
		}

		return true;
	},

	onScroll: function (e, dom) {},


	onContentUpdate: function() {},


	editorCleanup: function(){
		delete this.suspendMoveEvents;
		delete this.editor;
	},


	openEditor: function(){
		var tabPanel, lineInfo = this.data.box.activeLineInfo,
			prefs = this.getPagePreferences(this.reader.getLocation().NTIID),
			sharing = prefs && prefs.sharing,
			sharedWith = sharing && sharing.sharedWith,
			shareInfo =  SharingUtils.sharedWithToSharedInfo(
							SharingUtils.resolveValue(sharedWith));

		if( this.editor && !this.editor.isDestroyed ){
			return false;
		}

		this.mouseOut();
		this.suspendMoveEvents = true;

		this.editor = Ext.widget('nti-editor', {
			lineInfo: lineInfo || {},
			ownerCmp: this.reader,
			sharingValue: shareInfo,
			floating: true,
			renderTo: this.reader.getEl().up('.x-container-reader.reader-container'),
			enableShareControls: true,
			enableTitle: true,
			preventBringToFront:true,
			listeners:{
				'deactivated-editor':'destroy',
				grew: function(){
					var h = this.getHeight(),
						b = h + this.getY(),
						v = Ext.Element.getViewportHeight();
					if(b>v){
						this.setY(v-h);
					}
				}
			}
		}).addCls('active in-gutter');

		this.editor.focus();

		this.editor.alignTo(this.data.box,'t-t?');
		this.editor.rtlSetLocalX(0);
		if(this.editor.getLocalY()<59){
			this.editor.setLocalY(59);
		}

		tabPanel = this.editor.getEl().prev('.x-panel-notes-and-discussion');
		tabPanel = tabPanel && Ext.getCmp(tabPanel.id);
		if(!tabPanel){
			console.error('No tab panel!');
			return false;
		}

		tabPanel.mask();

		this.editor.on('destroy','unmask',tabPanel);
		this.editor.on('save','saveNewNote',this);
		this.editor.on('destroy','editorCleanup',this);
		this.editor.mon(tabPanel,'resize','syncEditorWidth',this);

		this.syncEditorWidth(tabPanel,tabPanel.getWidth());
		return true;
	},


	syncEditorWidth: function(c,w){
		var edEl = this.editor.getEl(),
			minW,
			nW = w + 65;
		if(!edEl){return;}

		minW = parseInt(edEl.getStyle('min-width'),10);
		this.editor.setWidth( minW > nW ? minW : nW );
		this.editor.fireEvent('grew');
	},


	syncHeight: function (h) {
		var c = this.container;
		if( c ){
			c.setHeight(h);
		}
	},


	saveNewNote: function(editor, r, v){
		var me = this,
			note = v.body,
			title = v.title,
			sharing = SharingUtils.sharedWithForSharingInfo(v.sharingInfo),
			style = editor.lineInfo.style || 'suppressed',
			rangeInfo;

		function afterSave(success) {
			editor.unmask();
			if (success) {
				editor.deactivate();
			}
		}

		editor.mask('Saving...');
		try {
			rangeInfo = me.rangeForLineInfo(editor.lineInfo, style);
			me.reader.fireEvent('save-new-note',
					title, note, rangeInfo.range,
					rangeInfo.container || me.reader.getLocation().NTIID,
					sharing, style, afterSave);
		}
		catch (error) {
			console.error('Error saving note - ' + Globals.getError(error));
			alert('There was an error saving your note.');
			editor.unmask();
		}
		return false;
	},


	noteHere: function(range, rect, style){
		this.positionInputBox( Ext.apply(this.lineInfoForRangeAndRect(range,rect),{style: style}) );
		if(!this.openEditor()){
			alert('You already have a note in progress.');
			return false;
		}
		return true;
	},


	contentDefinedAnnotationAction: function (dom, action) {
		var d = Ext.fly(dom).up('[itemprop~=nti-data-markupenabled]').down('[id]:not([id^=ext])'),
			id = d ? d.id : null, me = this,
			img = d && d.is('img') ? d.dom : null,
			doc = dom ? dom.ownerDocument : null,
			range, offsets, rect;

		if (/mark/i.test(action)) {
			range = doc.createRange();
			range.selectNode(img);
			rect = img.getBoundingClientRect();

			if(this.noteHere(range, rect)){
				WBUtils.createFromImage(img, function (data) {
					me.editor.reset();
					me.editor.setValue('');
					me.editor.addWhiteboard(data);
					me.editor.focus(true);
				});
			}
		}
	},


	getAnnotationGutter: function(){
		if(!this.annotationGutter){
			this.annotationGutter = this.reader.el.down('.annotation-gutter');
		}

		return this.annotationGutter;
	},


	isOccupied: function(y){
		var g = this.getAnnotationGutter(),
			r = g && g.select('[data-line]'),
			o = false;

		if(r){
			r.each(function(e){
				var i = parseInt(e.getAttribute('data-line'),10);
				o = i===y || Math.abs(i-y) < 5;
				return !o;
			});
		}

		return o;
	},


	copyClientRect: function (rect) {
		return {
			top: rect.top,
			bottom: rect.bottom,
			height: rect.height,
			left: rect.left,
			right: rect.right,
			width: rect.width
		};
	},


	adjustContentRectForTop: function (rect, top) {
		var adjusted = this.copyClientRect(rect);
		adjusted.top += top;
		adjusted.bottom += top;
		return adjusted;
	},


	lineInfoForRangeAndRect: function (range, rect, offsets) {
		return {range: range, rect: offsets ? this.adjustContentRectForTop(rect, offsets.top) : rect};
	},


	lineInfoForY: function (y) {
		var overlay = this.reader.getComponentOverlay().overlayedPanelAtY(y),
			result = null,
			top;

		//If there is an overlay at that position it gets
		//the decision as to if there is a line there.  After
		if (overlay) {
			if (overlay.findLine) {
				//TODO normalize y into overlay space and send it along
				result = overlay.findLine(y);

				//Ok this was from the iframe so we need to adjust it slightly
				if (result && result.rect) {
					//use the negative of the top to adjust y coordinates for this overlayed panel. (its coordinate
					// space the same as the gutter's so all our conversions need to be undone.)
					top = -this.getAnnotationOffsets().top;
					result.rect = this.adjustContentRectForTop(result.rect,top);
				}
			}
			return result;
		}
		result = LineUtils.findLine(y, this.reader.getDocumentElement());

		//Ok this was from the iframe so we need to adjust it slightly
		if (result && result.rect) {
			result.rect = this.copyClientRect(result.rect);
		}
		return result;
	},


	trackLineAtEvent: function (e) {
		var o = this.data,
			offsets = this.getAnnotationOffsets(),
			y = e.getY() - offsets.top, lineInfo,
			box = Ext.get(o.box);

		try {
			clearTimeout(this.mouseLeaveTimeout);
			lineInfo = this.lineInfoForY(y);

			if (e.type === 'click' && !lineInfo && o.lastLine && Math.abs(y - o.lastLine.rect.bottom) < 50) {
				lineInfo = o.lastLine;
				delete o.lastLine;
			}


			if (lineInfo && (lineInfo !== o.lastLine || !o.lastLine)) {
				o.lastLine = lineInfo;
				e.stopEvent();

				if (!lineInfo.range) {
					box.hide();
					this.mouseOut();
					return false;
				}
				this.positionInputBox(lineInfo);
				return true;
			}
		} catch (er) {
			console.warn(Globals.getError(er));
		}
		return false;
	},


	positionInputBox: function (lineInfo) {
		var o = this.data,
			offset = this.getAnnotationOffsets(),
			box = Ext.get(o.box),
			oldY = box.getY() - offset.top,
			newY = 0, occ,
			activeY = oldY,
			line = lineInfo || o.lastLine;

		if (line && line.rect) {
			newY = Math.round(line.rect.top);
		}

		//check for minute scroll changes to prevent jitter:
		if (oldY < 0 || Math.abs(oldY - newY) > 4) {
			box.setStyle({top:newY+'px'});
			activeY = newY;
		}

		occ = this.isOccupied(activeY);

		box[occ? 'addCls':'removeCls']('occupied');
		//show the box:

		box.activeLineInfo = line;
		box.show();
	},


	offNib: function(e){
		e.stopEvent();
		this.mouseOut(e);
	},


	overNib: function(e){
		e.stopEvent();
		clearTimeout(this.mouseLeaveTimeout);
		return false;
	},


	suspendResolver: function(){
		this.suspendMoveEvents = true;
	},


	resumeResolver: function(){
		delete this.suspendMoveEvents;
	},


	mouseOver: function (evt) {
		if (this.suspendMoveEvents || this.reader.creatingAnnotation) {
			return false;
		}

		return this.trackLineAtEvent(evt);
	},


	mouseOut: function (e) {

		if (this.suspendMoveEvents || this.reader.creatingAnnotation) {
			return;
		}

		var o = this.data,
			sel = this.reader.getDocumentElement().parentWindow.getSelection();
		if (sel) {
			sel.removeAllRanges();
		}

		clearTimeout(this.mouseLeaveTimeout);
		this.mouseLeaveTimeout = setTimeout(function () {
			delete o.lastLine;
			delete o.box.activeLineInfo;
			o.box.hide();
		}, 100);
	},


	rangeForLineInfo: function (line, style) {
		var ancestor = line.range.commonAncestorContainer ? Ext.fly(line.range.commonAncestorContainer) : null,
			containerSelector = 'object[data-nti-container]',
			container, c;

		if (style !== 'suppressed') {
			return {range: line.range, container: null};
		}

		//OK we are style suppressed
		container = ancestor.is(containerSelector) ? ancestor : ancestor.up(containerSelector);
		c = container ? container.getAttribute('data-ntiid') : null;
		if (container && c) {
			return {range: null, container: c};
		}
		return {range: line.range, container: null};
	}

});
