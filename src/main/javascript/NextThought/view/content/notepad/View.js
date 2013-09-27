Ext.define('NextThought.view.content.notepad.View',{
	extend: 'Ext.Component',
	alias: 'widget.content-notepad',

	//<editor-fold desc="Config">
	requires:[
		'NextThought.ux.ComponentReferencing',
		'NextThought.view.content.notepad.Item',
		'NextThought.view.content.notepad.Editor'
	],

	plugins:[
		'component-referencing'
	],

	ui: 'reader-notepad',

	renderTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{ cls: 'scroller', cn:[
			{ cls: 'note-here', html:'Add a note...' }
		] }
	])),


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
		this.notepadItems = {};
		this.on({
			'detect-overflow': {fn:'detectOverflow', buffer: 100},
			afterRender: 'setupBindsToReaderRef',
			el: {
				scroll: 'onSyncScroll',
				contextmenu: 'eat',
				mousemove: 'onMouseTrack',
				mouseover: 'onMouseTrack',
				mouseout: 'onMouseOut',
				mousewheel: 'onPushScroll',
				DOMMouseScroll: 'onPushScroll'
			},
			boxEl: {
				click: 'onClick',
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
		if (this.editor && !this.editor.isDestroyed) {
			return false;
		}
		var me = this;

		this.suspendMoveEvents = true;

		this.editor = Ext.widget({
			xtype: 'notepad-editor',
			lineInfo: lineInfo || {},
			ownerCmp: this,
			renderTo: this.scroller
		});

		this.editor.setLocalY(this.boxEl.getLocalY());
		this.boxEl.hide();
		this.editor.focus();


		this.mon(this.editor,{
			blur: 'commitEditor',
			destroy: function(){
				delete me.suspendMoveEvents;
			}
		});


		return true;
	},


	commitEditor: function(editor){
		console.log(editor.getValue());
		this.saveNewNote(editor);
	},


	saveNewNote: function (editor) {
		var me = this,
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g,
			note = editor.getValue(),
			reader = me.getReaderRef(),
			style = editor.lineInfo.style || 'suppressed',
			rangeInfo;

		function afterSave(success) {
			editor.unmask();
			if (success) {
				editor.destroy();
			}
		}

		//Avoid saving empty notes or just returns.
		if (!Ext.isArray(note) || note.join('').replace(re, '') === '') {
			editor.destroy();
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

		var lineY = this.getContentY(e),
			lineInfo = this.getLineInfo(lineY);

		if( lineInfo ){
			clearTimeout(this.hideTimer);
			this.boxEl.show().setLocalY(lineInfo.rect.top);
			this.lastLine = lineInfo;
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


	updateBuckets: function(){
		var k,
			m = this.notepadItems || {};

		for(k in m){
			if(m.hasOwnProperty(k)){
				Ext.destroy(m[k]);
				delete m[k];
			}
		}
	},


	noteHereMenu: function(e){
		return this.eat(e);//maybe show a context menu?
	},


	detectOverflow: function(){
		console.log('overflow detection');

		var collided = {}, els;

		function doesCollide(el, set){
			var top = el.getLocalY(),
				height = el.getHeight(),
				bottom = height + top,
				id = el.getAttribute('id'),
				cut = 0;

			console.log(id, top, height, bottom);

			set.each(function(e){
				var t = e.getLocalY(),
					h = e.getHeight(),
					i = e.getAttribute('id'),
					b = h + t;

				if(i !== id){
					//overlay
					if(top === t && bottom === b){
						//shouldn't be possible with this UI
						console.warn(id,'is on top of, or below ',i, [top, t], [bottom, b]);
						cut = -2;
					}
					//contained
					else if(top >= t && bottom <= b){
						//shouldn't be possible with this UI
						console.warn(id,'is contained within ',i, [top, t], [bottom, b]);
						cut = -1;
					}
					//collided into
					else if(top <= t && bottom >= t){
						console.log(id,'collided into',i, [top, t], [bottom, b]);
						cut = t;
					}
					//collided by
//					else if(top > t && top < b && bottom <= b){
//						shouldn't be possible with the current sort order
//						console.log(id,'collided by',i, [top, t], [bottom, b]);
//						cut = -3;
//					}

				}
				return !cut;
			});

			return cut > 0 ? (cut-top) : cut;
		}

		els = this.el.select('.scroller > *:not(.note-here)').slice();
		els.sort(function(a,b){
			return Ext.fly(a).getLocalY() - Ext.fly(b).getLocalY();
		});

		(new Ext.dom.CompositeElement(els)).removeCls('collide').setHeight('auto').each(function(el,c){
			var i = doesCollide(el,c);
			if(i>0){
				el.addCls('collide');
				el.setHeight(i);
				el.setStyle({minHeight: i+'px'});
			}
		});
	},


	addOrUpdate: function(annotation, yPlacement){
		yPlacement = Math.round(yPlacement);

		var map = this.notepadItems,
			data = {
				annotation: annotation,
				record: annotation.getRecord(),
				placement: yPlacement
			};

		if(!map.hasOwnProperty(annotation.id) ){
			map[annotation.id] = Ext.widget({
				xtype: 'notepad-item',
				floatParent: this,
				renderTo: this.scroller
			});
		}

		map[annotation.id].updateWith(data);
	}
});
