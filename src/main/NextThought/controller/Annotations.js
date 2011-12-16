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
                'share-with'    : this.actionMap.share
			},

            'note-entry':{
                'action': this.onNoteAction,
                'load-transcript': this.onLoadTranscript
            },

			'noteeditor button[action=save]':{ 'click': this.onSaveNote },
			'noteeditor button[action=cancel]':{ 'click': this.onCancelNote },

			'sharewithwindow button':{
				'click': this.shareWithButton
			}
		},{});
    },

    getContext: function(){
         return this.getViewport().getActive().getMainComponent();
    },

    getContainerId: function(){
        return this.getContext().getContainerId();
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

        rec.set('sharedWith',shbx.getValue());
		rec.save({
			scope: this,
			success:function(newRecord,operation){
				win.close();
				rec.fireEvent('updated',newRecord);
			},
            failure:function(){
                console.error('Failed to save object');
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
		else if(action in this.actionMap){
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
						win.close();
					}
				});
			}
			else win.close();
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
			}
		});
	},


	attemptToAddWidget: function(record){
		//check to see if reply is already there, if so, don't do anything...
		if (Ext.get(IdCache.getComponentId(record))) return;

		var parent = record.get('inReplyTo');
		if(parent){
			parent = Ext.getCmp(IdCache.getComponentId(parent));
			parent.addReply(record);
		}
		else
			this.getContext().createNoteWidget(record);

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
		Ext.create('NextThought.view.windows.ShareWithWindow',{record: record}).show();
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
