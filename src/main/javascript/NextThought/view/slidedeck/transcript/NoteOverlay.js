Ext.define('NextThought.view.slidedeck.transcript.NoteOverlay', {
	alias:'widget.transcript-note-overlay',

	requires:[
		'NextThought.util.Line',
		'NextThought.view.whiteboard.Utils',
		'NextThought.editor.Editor'
	],
	mixins: {
		'observable': 'Ext.util.Observable'
	},

	constructor: function(config){
		Ext.apply(this, config);
		this.mixins.observable.constructor.call(this);

		var me = this;

		if(!me.noteOverlayManager){
			//TODO: we will something more robust to manage different reader views that get added.
			// But for now, use just an array.
			me.noteOverlayManager = [];
		}
		this.mon(this.reader, {
			scope: this,
			destroy: 'destroy',
//			'reader-view-ready': 'insertOverlay',
			'create-note': 'noteHere',
			'sync-height': 'syncHeight',
			'show-editor': 'showEditorByEl',
			'show-editor-inline':'showEditorAtPosition'
		});

		this.data = {};

		this.editor = Ext.widget('nti-editor', {
			ownerCt: this.reader,
			floating: true,
			renderTo: Ext.getBody(),
			enableShareControls: true,
			enableTitle: true,
			listeners:{
				'deactivated-editor': function(){ me.reader.suspendMoveEvents = false; },
				'activated-editor': function(){ me.reader.suspendMoveEvents = true; },
				grew: function(){
					var h = this.getHeight(),
						b = h + this.getY(),
						v = Ext.Element.getViewportHeight();
					if(b>v){
						this.setY(v-h);
					}
				}
			}
		}).addCls('in-gutter');

		this.editor.el.setVisibilityMode(Ext.dom.Element.DISPLAY);
	},




	registerReaderView: function(view){
		this.noteOverlayManager.push(view);
		this.mon(view, {
			scope: this,
			destroy: 'destroy',
//			'reader-view-ready': 'insertOverlay',
			'create-note': 'noteHere',
			'sync-height': 'syncHeight',
			'show-editor': 'showEditorByEl',
			'show-editor-inline':'showEditorAtPosition'
		});
	},


//	insertOverlay: function(){
//		var me = this,
//			box,
//			container = {
//				cls: 'note-gutter',
//				style: {
//					height: me.getFrameHeight()
//				},
//				cn: [
//					{ cls: 'note-here-control-box' }
//				]
//			};
//
//		me.container = Ext.DomHelper.insertAfter(me.reader.getInsertionPoint().first(), container, true);
//
//		box = me.data.box = me.container.down('.note-here-control-box');
//		box.setVisibilityMode(Ext.dom.Element.DISPLAY);
//		box.hide();
//
//		me.mon(box,{
//			click: 'openEditor',
////			mouseover:'overNib',
////			mousemove:'overNib',
////			mouseout:'offNib',
//			scope:me
//		});
//	},


	noteHere: function(){
		console.log('To Be Implemented');
	},


	syncHeight: function(){
		console.warn('Sync-height to be implemented');
	},


	getFrameHeight: function(){
		return this.readerHeight+'px';
	},


	activateEditor: function(cueInfo){
		if(this.editor){
			this.data.cueInfo = Ext.apply(this.cueInfo || {}, cueInfo);
			this.editor.reset();
			this.editor.activate();
		}
	},


	showEditorByEl: function(cueInfo, el){
		this.activateEditor(cueInfo);
		this.editor.alignTo( el,'tl-tr?');
	},


	showEditorAtPosition: function(cueInfo, xy){
		this.activateEditor(cueInfo);
		this.editor.showAt(xy);
	}

});