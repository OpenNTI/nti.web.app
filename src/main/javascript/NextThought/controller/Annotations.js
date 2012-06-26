Ext.define('NextThought.controller.Annotations', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.cache.IdCache',
		'NextThought.util.Sharing'
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
		'annotations.Highlight',
		'annotations.Note',
		'annotations.NoteEditor',
		'annotations.ShareWith',
		'content.Reader'
	],

	refs: [
		{ ref: 'reader', selector: 'reader-panel'}
	],

	statics: {
		events: new Ext.util.Observable()
	},

	init: function() {

		this.actionMap = {
			'chat'  : this.replyAsChat,
			'edit'  : this.editNote,
			'reply' : this.replyToNote,
			'mute' : this.toggleMuteConversation,
			'share' : this.shareWith
		};


		this.control({
			'reader-panel':{
				'create-note'   : this.addNote,
				'share-with'	: this.actionMap.share,
				'define'		: this.define,
				'redact'		: this.redact
			},

			'note-entry':{
				'action': this.onNoteAction,
				'load-transcript': this.onLoadTranscript,
				'unmute': this.toggleMuteConversation
			},

			'noteeditor button[action=save]':{ 'click': this.onSaveNote },
			'noteeditor button[action=discuss]':{ 'click': this.onDiscussNote },
			'noteeditor button[action=cancel]':{ 'click': this.onCancelNote },

			'share button[action=save]':{
				'click': this.onShareWithSaveClick
			},

			'chat-log-view': {
				'load-transcript': this.onLoadTranscript
			}
		},{});
	},

	define: function(term){
		var url = $AppConfig.server.host + '/dictionary/' + encodeURIComponent(term);

		if(this.definition){
			this.definition.close();
			delete this.definition;
		}

		this.definition = Ext.widget('nti-window',{
			title: 'Define: '+term,
			closeAction: 'destroy',
			width: 300,
			height: 400,
			layout: 'fit',
			items: {
				xtype: 'component',
				cls: 'definition',
				autoEl: {
					tag: 'iframe',
					src: url,
					frameBorder: 0,
					marginWidth: 0,
					marginHeight: 0,
					scrolling: 'no',
					seamless: true,
					transparent: true,
					allowTransparency: true,
					style: 'overflow: hidden'
				},
				xhooks: {

				}
			}
		}).show().center();
	},


	onShareWithSaveClick: function(btn){
		var win = btn.up('window'),
			shbx= win.down('sharewith'),
			rec = win.record;

		win.el.mask('Sharing...');

		SharingUtils.setSharedWith(rec,shbx.getValue(),function(newRec,op){
			if(op.success){
				win.close();
				rec.fireEvent('updated',newRec);
			}
			else{
				console.error('Failed to save object');
				win.el.unmask();
			}
		});
	},

	onNoteAction: function(action, note, event){
		var r = note.owner,
			a = note.annotation,
			rec = a.getRecord();

		if(/delete/i.test(action)){
			a.remove();
		}
		else if(this.actionMap.hasOwnProperty(action)){
			this.actionMap[action].call(this, rec, note);
		}
	},


	onLoadTranscript: function(record, cmp, eOpts) {
		var model = this.getModel('Transcript'),
			id = record.get('RoomInfo').getId();

		model.proxy.url = record.getLink('transcript');

		model.load(id,{
			scope: this,
			failure: function() {
				cmp.failedToLoadTranscript();
			},
			success: function(record) {
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
				this.self.events.fireEvent('new-note',newRecord);
			},
			failure:function(){
				console.error('failed to save note');
				win.el.unmask();
			}
		});
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


	toggleMuteConversation: function(record, panel, unmute) {
		var me = this,
			data,
			url = $AppConfig.userObject.getLink('edit');

		if (unmute){
			data = {unmute_conversation: record.get('OID')};
		}
		else {
			data = {mute_conversation: record.get('OID')};
		}

		Ext.Ajax.request({
			url: url,
			jsonData: Ext.JSON.encode(data),
			method: 'PUT',
			scope: me,
			callback: function(){ },
			failure: function(){
				console.error("mute fail", arguments);
			},
			success: function(r){
				console.log('mute success', arguments);
				if (unmute){
					panel.enable();
				}
				else {
					panel.disable();
				}
			}
		});
	},


	shareWith: function(record){
		var options = {};

		if (arguments[arguments.length-1] === true) {
			options = {
				btnLabel : 'Discuss',
				titleLabel : 'Discuss This...'
			};
		}

		Ext.widget(Ext.apply({xtype: 'share',record: record}, options)).show();
	},

	editNote: function(record){
		Ext.widget('noteeditor',{record: record}).show();
	},

	addNote: function(range){
		if(!range) {
			return;
		}

		var note = AnnotationUtils.selectionToNote(range, this.getReader().getDocumentElement());
		note.set('ContainerId', LocationProvider.currentNTIID);

		this.editNote(note);
	},

	redact: function(record){
		if(!record) {
			return;
		}
		this.self.events.fireEvent('new-redaction',record);
	}

});
