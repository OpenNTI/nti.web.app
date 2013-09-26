Ext.define('NextThought.view.content.notepad.View',{
	extend: 'Ext.Component',
	alias: 'widget.content-notepad',

	//<editor-fold desc="Config">
	requires:[
		'NextThought.ux.ComponentReferencing',
		'NextThought.view.content.notepad.Item'
	],

	plugins:[
		'component-referencing'
	],

	ui: 'reader-notepad',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'scroller', cn:[
			{ cls: 'note-here' }
		] }
	]),


	renderSelectors: {
		scroller: '.scroller',
		boxEl: '.note-here'
	},


	//reference functions will not exist until after the constructor returns. #initComponent() is called in the middle
	// of the constructor, so we cannot us that. AfterRender maybe the best place to setup, or subclass constructor.
	refs: [
		{ ref: 'readerRef', selector: '' }//set this in config.
	],
	//</editor-fold>


	//<editor-fold desc="Setup & Init">
	constructor: function() {
		this.callParent(arguments);
		this.on({
			afterRender: 'setupBindsToReaderRef',
			el: {
				click: 'onClick',
				scroll: 'onSyncScroll',
				contextmenu: 'eat',
				mousemove: 'onMouseTrack',
				mouseover: 'onMouseTrack',
				mouseout: 'onMouseOut',
				mousewheel: 'onPushScroll',
				DOMMouseScroll: 'onPushScroll'
			},
			boxEl: {
				   mouseover:'eat',
				   mousemove:'eat',
				   contextmenu: 'noteHereMenu'
			}
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.boxEl.setVisibilityMode(Ext.Element.ASCLASS).visibilityCls = 'hidden';
	},


	setupBindsToReaderRef: function() {
		var ref = this.getReaderRef();

		try{
			this.syncHight();

			ref.notepadRef = this;

			this.mon(ref,{
				'sync-height':'syncHight',
				'scroll':'syncScroll',
				'set-content':'updateBuckets'
			});
		}
		catch(e){
			console.error(e.stack||e.message||e);

			Ext.defer(this.setupBindsToReaderRef,1,this);
		}
	},
	//</editor-fold>


	//<editor-fold desc="Editor">
	editorCleanup: function(){
		if( this.editor ){
			this.editor.destroy();
		}
		delete this.suspendMoveEvents;
		delete this.editor;
	},


	openEditor: function (lineInfo) {
		var tabPanel,
			targetEl = this.getEl().up('.x-container-reader.reader-container');

		if (this.editor && !this.editor.isDestroyed) {
			return false;
		}

		this.suspendMoveEvents = true;

		tabPanel = targetEl.down('.x-panel-notes-and-discussion');
		tabPanel = tabPanel && Ext.getCmp(tabPanel.id);
		if (!tabPanel) {
			console.error('No tab panel!');
			return false;
		}

		tabPanel.mask();

		this.editor = Ext.widget({
			xtype: 'nti-editor',
			lineInfo: lineInfo || {},
			ownerCmp: this,
			floating: true,
			renderTo: targetEl,
			enableObjectControls: false,
			enableTextControls: false,
			enableShareControls: false,
			enableTitle: false,
			preventBringToFront: true
		}).addCls('active in-gutter');

		this.editor.toFront();
		this.editor.focus();

		this.editor.alignTo(this.boxEl, 't-t?');
		this.editor.rtlSetLocalX(0);
		if (this.editor.getLocalY() < 59) {
			this.editor.setLocalY(59);
		}


		this.mon(this.editor,{
			save: 'saveNewNote',
			destroy: {fn:'unmask', scope:tabPanel},
			'deactivated-editor': 'editorCleanup',
			grew: function () {
				if (Ext.is.Tablet) { return; }
				var h = this.getHeight(),
					b = h + this.getY(),
					v = Ext.Element.getViewportHeight();
				if (b > v) {
					this.setY(v - h);
				}
			}
		});


		return true;
	},


	saveNewNote: function (editor, r, v) {
		var me = this,
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g,
			note = v.body,
			reader = me.getReaderRef(),
			style = editor.lineInfo.style || 'suppressed',
			rangeInfo;

		function afterSave(success) {
			editor.unmask();
			if (success) {
				editor.deactivate();
			}
		}

		//Avoid saving empty notes or just returns.
		if (!Ext.isArray(note) || note.join('').replace(re, '') === '') {
			editor.deactivate();
			return false;
		}

		editor.mask('Saving...');
		try {
			rangeInfo = reader.getNoteOverlay().rangeForLineInfo(editor.lineInfo, style);
			reader.fireEvent('save-new-note', null, note, rangeInfo.range,
					rangeInfo.container || reader.getLocation().NTIID, null, style, afterSave);
		}
		catch (error) {
			console.error('Error saving note - ' + Globals.getError(error));
			alert('There was an error saving your note.');
			editor.unmask();
		}
		return false;
	},
	//</editor-fold>


	//<editor-fold desc="Mouse Event Handlers">
	cleanupLine: function(){
		this.boxEl.hide();
		delete this.lastLine;
	},


	eat: function(e){
		clearTimeout(this.hideTimer);
		e.stopEvent();
		return false;
	},


	onClick: function(e){
		if(this.suspendMoveEvents){return;}
		this.openEditor(this.lastLine);
	},


	onMouseOut: function(){
		if(this.suspendMoveEvents){return;}
		clearTimeout(this.hideTimer);
		this.hideTimer = Ext.defer(this.cleanupLine,500,this);
	},


	onMouseTrack: function(e){
		if(this.suspendMoveEvents){return;}

		var t = e.getTarget('.bucket'),
			lineY = this.getContentY(e),
			lineInfo = this.getLineInfo(lineY),
			cache = this.bucketLineInfoCache = (this.bucketLineInfoCache || {}),
			bucketInfo,
			elKey,
			h;

		if( lineInfo ){
			clearTimeout(this.hideTimer);
			bucketInfo = this.resolveBucket(lineInfo);
			if(bucketInfo){
				h = bucketInfo.height;
				elKey = bucketInfo && ('el-'+bucketInfo.top);
				cache = elKey && cache[elKey];
				if(t && (!cache || cache.dom !== t)){
					return;
				}
				if(cache){
					h = cache.getHeight();
				}
				this.boxEl.show()
						.setHeight(h)
						.setLocalY(bucketInfo.top);
				this.lastLine = lineInfo;
			}
		}
	},
	//</editor-fold>


	//<editor-fold desc="Synchronizing Handlers">
	syncHight: function(){
		this.scroller.setHeight(this.getReaderRef().getIframe().get().getHeight());
	},


	syncScroll: function(){
		this.getEl().setScrollTop( this.getReaderRef().getScroll().top() );
	},


	onSyncScroll: function(){},


	onPushScroll: function pushScroll(e){
		var d = e.getWheelDelta(),
			h = (this.scroller.getHeight()/this.getHeight())/2; //make sure the scale kinda matches

		this.getReaderRef().getScroll().by(d*h);
	},
	//</editor-fold>


	getContentY: function(e){
		var ref = this.getReaderRef(),
			t = ref.getAnnotationOffsets().top;
		return e.getY() - t;
	},


	getLineInfo: function(y){
		return this.getReaderRef().getNoteOverlay().lineInfoForY(y);
	},


	getStartingNode: function(range){
		var start = range.startContainer,
			offset = range.startOffset;

		if(!Ext.isTextNode(start)){
			start = start.firstChild;
			while(offset--){
				start = start.nextSibling;
			}
		}

		return start;
	},


	resolveBucket: function(lineInfo){
		var start, rect;

		if(Ext.isNumber(lineInfo)){
			lineInfo = this.getLineInfo(lineInfo);
		}

		if(!lineInfo || !lineInfo.range){
			return null;
		}

		try {
			start = this.getStartingNode(lineInfo.range);
			while(start && !AnnotationUtils.isBlockNode(start)) {
				start = start.parentNode;
			}
			rect = start.getBoundingClientRect();
			return {
				top: rect.top,
				height: rect.bottom - rect.top,
				container: start
			};
		}
		catch( e ) {
			console.error(e.stack || e.stacktrace || e.message || e);
		}
		return null;
	},


	updateBuckets: function(){
		var k, o = this.bucketLineInfoCache || {},
			m = this.notepadItems || {};

		for(k in m){
			if(m.hasOwnProperty(k)){
				Ext.destroy(m[k]);
				delete m[k];
			}
		}

		for(k in o){
			if(o.hasOwnProperty(k)){
				Ext.destroy(o[k]);
				delete o[k];
			}
		}
	},


	noteHereMenu: function(e){
		return this.eat(e);//maybe show a context menu?
	},


	addOrUpdate: function(annotation, yPlacement){
		yPlacement = Math.round(yPlacement);

		var cache = this.bucketLineInfoCache = (this.bucketLineInfoCache || {}),
			map = (this.notepadItems = (this.notepadItems || {})),
			bucket = cache[yPlacement] = (cache[yPlacement] || this.resolveBucket(yPlacement)),
			elKey = bucket && ('el-'+bucket.top),
			data = {
				annotation: annotation,
				record: annotation.getRecord(),
				placement: yPlacement
			};

		if(!elKey){
			//console.warn('No key for y',yPlacement, annotation.getRecord().getBodyText());
			return;
		}

		if(!cache.hasOwnProperty(elKey)){
			cache[elKey] = Ext.DomHelper.append(this.scroller,{
				cls:'bucket',style:{
					top:bucket.top+'px',
					minHeight: bucket.height+'px',
					maxHeight: bucket.height+'px'
				}
			},true);
		}

		if(!map.hasOwnProperty(annotation.id) ){
			map[annotation.id] = Ext.widget({
				xtype: 'notepad-item',
				renderTo: cache[elKey]
			});
		}

		map[annotation.id].updateWith(data);
	}
});
