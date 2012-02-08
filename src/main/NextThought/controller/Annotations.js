Ext.define('NextThought.controller.Annotations', {
	extend: 'Ext.app.Controller',

	required: [
		'NextThought.cache.IdCache'
	],

	models: [
		'Highlight',
		'Note',
		'QuizQuestion',
		'QuizQuestionResponse',
		'QuizResult',
		'TranscriptSummary',
		'Transcript'
	],

	views: [
		'Viewport',
		'windows.ChatWindow',
		'widgets.annotations.Highlight',
		'widgets.annotations.Note',
		'windows.NoteEditor',
		'windows.ShareWithWindow'
	],

	refs: [
		{ref: 'viewport', selector: 'master-view'},
		{ref: 'chatWindow', selector: 'chat-window'}
	],

	init: function() {

		this.actionMap = {
			'chat'  : this.replyAsChat,
			'edit'  : this.editNote,
			'reply' : this.replyToNote,
			'share' : this.shareWith
		};


		this.control({
			'reader-panel':{
				'create-note'   : this.addNote,
				'share-with'	: this.actionMap.share,
				'define'		: this.define
			},

			'note-entry':{
				'action': this.onNoteAction,
				'load-transcript': this.onLoadTranscript
			},

			'noteeditor button[action=save]':{ 'click': this.onSaveNote },
			'noteeditor button[action=discuss]':{ 'click': this.onDiscussNote },
			'noteeditor button[action=cancel]':{ 'click': this.onCancelNote },

			'sharewithwindow button':{
				'click': this.shareWithButton
			}
		},{});
	},

	getContext: function(){
		return this.getController('Reader').getReader();
	},

	getContainerId: function(){
		return this.getContext().getContainerId();
	},


	define: function(term){
		var url = _AppConfig.server.host + '/dictionary/' + encodeURIComponent(term);

		if(this.definition){
			this.definition.close();
			delete this.definition;
		}

		this.definition = Ext.widget('window',{
			title: 'Define: '+term,
			closeAction: 'destroy',
			width: 300,
			height: 400,
			layout: 'fit',
			items: {
				xtype: 'component',
				autoEl: {
					tag: 'iframe',
					src: url,
					frameBorder: 0,
					marginWidth: 0,
					marginHeight: 0
				}
			}
		}).show().center();
	},


	shareWithButton: function(btn){
		var win = btn.up('window'),
			form= win.down('form'),
			shbx= win.down('sharewith'),
			rec = win.record;

		if(btn.isCancel){
			win.close();
			return;
		}

		if(!form.getForm().isValid()){
			return false;
		}

		win.el.mask('Sharing...');

		rec.set('sharedWith',shbx.getValue());
		rec.save({
			scope: this,
			success:function(newRecord,operation){
				win.close();
				rec.fireEvent('updated',newRecord);
			},
			failure:function(){
				console.error('Failed to save object');
				win.el.unmask();
			}
		});
	},

	onNoteAction: function(action, note, event){
		var r = note._owner,
			a = note._annotation,
			rec = a.getRecord();

		if(/delete/i.test(action)){
			a.remove();
		}
		else if(this.actionMap.hasOwnProperty(action)){
			this.actionMap[action].call(this, rec);
		}
	},


	onLoadTranscript: function(record, cmp, elm, eOpts) {
		var model = this.getModel('Transcript'),
			id = record.get('RoomInfo').getId();

		model.proxy.url = record.getLink('transcript');

		model.load(id,{
			scope: this,
			failure: function() {
				elm.animate({listeners: { beforeanimate: function(){ elm.show(true); } }});
			},
			success: function(record) {
				//elm.remove();
				cmp.insertTranscript(record);
			}
		});
	},


	onCancelNote: function(btn, event){
		btn.up('window').close();
	},


	onDiscussNote: function(btn, event){
		var win = btn.up('window'),
			record = win.record,
			me = this;

		record.on('updated', function(r){
				r.on('updated', function(r){
						me.replyAsChat(r);
					},
					this,
					{single:true});

				me.shareWith(r, true);
			},
			this,
			{single: true});

		//start the process
		this.onSaveNote(btn, event);


		//1) present sharewith selector
		//2) save note
		//3) open chat with saved with group
	},


	onSaveNote: function(btn, event){
		var win = btn.up('window'),
			cmp = win.down('htmleditor');

		win.el.mask('Saving...');
		win.record.set('body',Ext.Array.clean(win.getValue()));

		if (win.record.data.body.length === 0) {
			//note has no data, we need to just remove it
			if(!win.record.phantom){
				win.record.destroy({
					scope: this,
					success: function(){
						win.record.fireEvent('updated',win.record);
						win.close();
					},
					failure: function(){
						console.error('failed to delete empty note');
						win.el.unmask();
					}
				});
			}
			else {
				win.close();
			}
			return;
		}

		//If we are here, save it.
		win.record.save({
			scope: this,
			success:function(newRecord,operation){
				win.close();
				win.record.fireEvent('updated',newRecord);
				this.attemptToAddWidget(newRecord);
			},
			failure:function(){
				console.error('failed to save note');
				win.el.unmask();
			}
		});
	},


	attemptToAddWidget: function(record){
		//check to see if reply is already there, if so, don't do anything...
		if (Ext.get(IdCache.getComponentId(record))) {
			return;
		}

		var parent = record.get('inReplyTo');
		if(parent){
			parent = Ext.getCmp(IdCache.getComponentId(parent));
			parent.addReply(record);
		}
		else {
			this.getContext().createNoteWidget(record);
		}

		this.getContext().fireEvent('resize');
	},

	replyAsChat: function(record) {
		var reply = AnnotationUtils.noteToReply(record),
				people = Ext.Array.unique([record.get('Creator')].concat(record.get('sharedWith'))),
				cId = record.get('ContainerId'),
				parent = reply.get('inReplyTo'),
				refs = reply.get('references');

		this.getController('Chat').enterRoom(people, {ContainerId: cId, references: refs, inReplyTo: parent});
	},

	replyToNote: function(record){
		this.editNote(AnnotationUtils.noteToReply(record));
	},

	shareWith: function(record){
		var options = {};

		if (arguments[arguments.length-1] === true) {
			options = {
				btnLabel : 'Discuss',
				titleLabel : 'Discuss This...'
			};
		}

		Ext.create('NextThought.view.windows.ShareWithWindow',Ext.apply({record: record}, options)).show();
	},

	editNote: function(record){
		Ext.widget('noteeditor',{record: record}).show();
	},

	addNote: function(range){
		if(!range) {
			return;
		}

		var note = AnnotationUtils.selectionToNote(range);
		note.set('ContainerId', this.getContainerId());

		this.editNote(note);
	}
});
