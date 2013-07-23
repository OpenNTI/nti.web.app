Ext.define('NextThought.view.slidedeck.transcript.NoteOverlay', {
	alias:'widget.presentation-note-overlay',

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

		me.editorEl = me.editor.el;

		me.mon(me.editorEl.down('.save'),{ scope: me, click: me.editorSaved });
		me.editorEl.setVisibilityMode(Ext.dom.Element.DISPLAY);

		me.reader.relayEvents(me,['save-new-note', 'save-new-series-note']);
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


	editorSaved: function(e){
		if(e) { e.stopEvent(); }

		function callback(success, record){
			me.editorEl.unmask();
			if(success){
				me.deactivateEditor();
			}
		}

		function onError(error){
			console.error('Error saving note - ' + (error ? Globals.getError(error) : ''));
			alert('There was an error saving your note.');
			me.editorEl.unmask();
		}

		var me = this,
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g,
			style = 'suppressed',
			v = me.editor.getValue(),
			note = v.body,
			title = v.title,
			sharing = [],
			range = me.data.range,
			container = me.data.containerId;

		if(v.sharingInfo){
			sharing = SharingUtils.sharedWithForSharingInfo(v.sharingInfo);
		}

		//Avoid saving empty notes or just returns.
		if( !Ext.isArray(note) || note.join('').replace(re,'') === '' ){
			me.editor.markError(me.editor.el.down('.content'), 'Please enter text before you save');
			return false;
		}

		me.editorEl.mask('Saving...');
		try {
			me.fireEvent('save-new-series-note', title, note, range, me.data, container, sharing, style, callback);
		}
		catch (error) {
			onError(error);
		}
		return false;
	},


	noteHere: function(){
		console.log('To Be Implemented');
	},


	syncHeight: function(){
		console.warn('Sync-height to be implemented');
	},


	getFrameHeight: function(){
		return this.readerHeight+'px';
	},


	activateEditor: function(info){
		if(this.editor){
			this.data = info; //Ext.apply(this.data || {}, cueInfo);
			this.editor.reset();
			this.editor.activate();
		}
	},

	deactivateEditor: function(){
		this.editor.deactivate();
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