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
			'mute' : this.toggleMuteConversation,
			'share' : this.shareWith
		};


		this.control({
			'reader-panel':{
				'share-with'	: this.actionMap.share,
				'define'		: this.define,
				'redact'		: this.redact,
				'save-new-note' : this.saveNewNote,
				'bubble-replys-up':this.replyBubble
			},


			'activity-preview': {
				'share': this.shareWith,
				'chat': this.replyAsChat
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


			'share-window[record] button[action=save]':{
				'click': this.onShareWithSaveClick
			},

			'share-window button[action=save]':{
				'click': this.onShareSettingsSaveClick
			},

			'chat-log-view': {
				'load-transcript': this.onLoadTranscript
			}
		},{});
	},

	define: function(term, boundingScreenBox){

		if( this.definition ){
			this.definition.close();
			delete this.definition;
		}
		this.definition = Ext.widget(
			'definition-window',{
			term: term,
			pointTo: boundingScreenBox
		}).show();

		setTimeout(function(){
			var head = document.querySelector('iframe.definition');
			head.style.overflowX = 'hidden';
			head.style.overflowY = 'scroll';
		},250);
	},


	onShareSettingsSaveClick: function(btn){
		var win = btn.up('window'),
			shbx= win.down('user-list'),
			cb = win.down('checkbox'),
			saveAsDefault = cb ? cb.checked : false,
			v = shbx.getValue(),
			me = this;

		cb.setValue(false);

		if (saveAsDefault){
			//update default sharing setting if we have a shareWith:
			me.getController('Library').saveSharingPrefs(v, function(){});
		}
	},


	onShareWithSaveClick: function(btn){
		var win = btn.up('window'),
			shbx= win.down('user-list'),
			v = shbx.getValue(),
			rec = win.record;

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
			}
			else{
				console.error('Failed to save object');
				alert('Opps!\nCould not save');
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


	onNoteAction: function(action, note){
		var a = note.annotation,
			rec = a.getRecord();

		if(/delete/i.test(action)){
			a.remove();
		}
		else if(this.actionMap.hasOwnProperty(action)){
			this.actionMap[action].call(this, rec, note);
		}
	},


	onLoadTranscript: function(record, cmp) {
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


	saveNewNote: function(body, range, shareWith, style, callback){
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

		//If a user it not allowed to share, remove any shared with fields
		if (!$AppConfig.service.canShare()){
			shareWith = [];
		}

		//define our note object:
		noteRecord = this.getNoteModel().create({
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


		//now save this:
		replyRecord.save({
			scope: this,
			callback:function(record, request){
				var success = request.success,
					rec = success ? record: null,
					store;
				if (success){
					store = this.getController('Library').pageStores[rec.get('ContainerId')];
					if (store){store.add(rec);}
					this.self.events.fireEvent('new-note', rec);
					(rec.parent?rec:recordRepliedTo).fireEvent('child-added',rec);
				}
				Ext.callback(callback, this, [success, rec]);
			}
		});
	},

	replyAsChat: function(record) {
		var top = record,
			people, cId, parent, refs;

		//go to the top, it has the info we need:
		while(top.parent) {
			top = top.parent;
		}


		people = Ext.Array.unique([record.get('Creator')].concat(top.get('sharedWith')).concat(top.get('Creator')));
		cId = record.get('ContainerId');
		parent = record.get('NTIID');
		refs = Ext.Array.clone(record.get('references') || []);

		this.getController('Chat').enterRoom(people, {ContainerId: cId, references: refs, inReplyTo: parent});
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


	redact: function(record){
		if(!record) {
			return;
		}
		this.self.events.fireEvent('new-redaction',record);
	}

});
