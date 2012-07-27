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
		'annotations.note.Window',
		'sharing.Window',
		'content.Reader',
		'definition.Window',
		'whiteboard.Window'
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
				'redact'		: this.redact,
				'save-new-note' : this.saveNewNote,
				'bubble-replys-up':this.replyBubble
			},

			'note-gutter-widget': {
				'share': this.shareWith,
				'chat': this.replyAsChat
			},

			'note-reply': {
				'share': this.shareWith,
				'chat': this.replyAsChat
			},

			'note-window': {
				'save-new-reply' : this.saveNewReply,
				'share': this.shareWith,
				'chat': this.replyAsChat
			},

			'note-entry':{
				'action': this.onNoteAction,
				'load-transcript': this.onLoadTranscript,
				'unmute': this.toggleMuteConversation
			},

			//'noteeditor button[action=save]':{ 'click': this.onSaveNote },
			'noteeditor button[action=discuss]':{ 'click': this.onDiscussNote },
			//'noteeditor button[action=cancel]':{ 'click': this.onCancelNote },

			'share-window[record] button[action=save]':{
				'click': this.onShareWithSaveClick
			},

			'chat-log-view': {
				'load-transcript': this.onLoadTranscript
			}
		},{});
	},

	define: function(term, boundingScreenBox){
		var url = $AppConfig.server.host + '/dictionary/' + encodeURIComponent(term);

		if(this.definition){
			this.definition.close();
			delete this.definition;
		}

		this.definition = Ext.widget({
			xtype: 'definition-window',
			src:url,
			pointTo: boundingScreenBox}).show();
	},


	onShareWithSaveClick: function(btn){
		var win = btn.up('window'),
			shbx= win.down('user-list'),
			cb = win.down('checkbox'),
			saveAsDefault = cb ? cb.checked : false,
			v = shbx.getValue(),
			rec = win.record,
			me = this;

		//extra check here for a close...
		if (btn.text === 'Close'){
			win.close();
			return;
		}

		if (!rec){return;}

		win.el.mask('Sharing...');

		SharingUtils.setSharedWith(rec,v,function(newRec,op){
			if(op.success){
				rec.fireEvent('updated',newRec);
				win.close();
				if (saveAsDefault){
					//update default sharing setting if we have a shareWith:
					me.getController('Library').saveSharingPrefs(v, function(){
						console.log('callback pref save', arguments);
					});
				}
			}
			else{
				console.error('Failed to save object');
				win.el.unmask();
			}
		});
	},


	replyBubble: function(replies){
		var me = this,
			e = this.self.events;

		Ext.each(replies,function(r){
			if(!r.placeHolder && r.store && r.stores.length > 0){
				delete r.parent;
				r.pruned = true;
				e.fireEvent('new-note', r, null);
			}
			else if(r.children){
				me.replyBubble(r.children);
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


	saveNewNote: function(body, range, shareWith, style, callback, opts){
		//check that our inputs are valid:
		if (!body || (Ext.isArray(body) && body.length < 1) || !range){
			console.error('Note creating a note, either missing content or range.');
			return;
		}

		//Define our vars and create our content range description:
		var doc = this.getReader().getDocumentElement(),
			noteRecord,
			rangeDescription = Anchors.createRangeDescriptionFromRange(range, doc);

		//make sure the body is an array:
		if(!Ext.isArray(body)){body = [body];}

		//update default sharing setting if we have a shareWith:
//		if (shareWith){
//			this.getController('Library').saveSharingPrefs(shareWith, function(){
//				console.log('callback pref save', arguments);
//			}, true);
//		}

		//define our note object:
		noteRecord = Ext.create('NextThought.model.Note', {
			applicableRange: rangeDescription,
			body: body,
			sharedWith: shareWith,
			style: style,
			ContainerId: LocationProvider.currentNTIID
		});

		//now save this:
		noteRecord.save({
			scope: this,
			callback:function(record, request){
				var success = request.success,
					rec = success ? record: null;
				if (success){
					LocationProvider.getStore().add(record);
					this.self.events.fireEvent('new-note', rec, range);
				}
				Ext.callback(callback, this, [success, rec]);
			}
		});
	},


	saveNewReply: function(recordRepliedTo, replyBody, shareWith, callback) {
		//some validation of input:
		if(!recordRepliedTo){Ext.Error.raise('Must supply a record to reply to');}
		if (!Ext.isArray(replyBody)){ replyBody = [replyBody];}

		//define our note object:
		var replyRecord = recordRepliedTo.makeReply();
		replyRecord.set('body', replyBody);

		//update default sharing setting if we have a shareWith:
//		if (shareWith){
//			this.getController('Library').saveSharingPrefs(shareWith, function(){
//				console.log('callback pref save', arguments);
//			}, true);
//		}

		//now save this:
		replyRecord.save({
			scope: this,
			callback:function(record, request){
				var success = request.success,
					rec = success ? record: null,
					store;
				if (success){
					this.self.events.fireEvent('new-note', rec);
					store = this.getController('Library').pageStores[rec.get('ContainerId')];
					if (store){store.add(rec);}
				}
				Ext.callback(callback, this, [success, rec]);
			}
		});
	},

	replyAsChat: function(record) {
		var top = record;

		//go to the top, it has the info we need:
		while(top.parent) {
			top = top.parent;
		}


		var people = Ext.Array.unique([record.get('Creator')].concat(top.get('sharedWith')).concat(top.get('Creator'))),
			cId = record.get('ContainerId'),
			parent = record.get('NTIID'),
			refs = Ext.Array.clone(record.get('references') || []);

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

		if (Ext.ComponentQuery.query('share-window[record]').length > 0) {
			//already a share with window, they are modal, just don't do this:
			return;
		}

		if (arguments[arguments.length-1] === true) {
			options = {
				btnLabel : 'Discuss',
				titleLabel : 'Discuss This...'
			};
		}

		Ext.widget(Ext.apply({xtype: 'share-window',record: record}, options)).show();
	},

	editNote: function(record){
		Ext.widget({xtype:'noteeditor', record: record}).show();
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
