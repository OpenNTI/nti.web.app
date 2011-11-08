Ext.define('NextThought.controller.Annotations', {
    extend: 'Ext.app.Controller',

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
                'share-with'    : this.actionMap['share']
			},

            'note-entry':{
                'action': this.onNoteAction,
                'load-transcript': this.onLoadTranscript
            },

    	 	'noteeditor button[action=save]':{ 'click': this.onSaveNote },
    	 	'noteeditor button[action=cancel]':{ 'click': this.onCancelNote },
    	 	'noteeditor button[action=whiteboard]':{ 'click': this.toggleWhiteboardForNote },

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
    	var p = note,
    		e = action,
    		r = p._owner,
            a = p._annotation,
    		rec = a.getRecord();

    	if(/delete/i.test(e)){
    		a.remove();
    	}
    	else if(e in this.actionMap){
	    	this.actionMap[e].call(this, rec);
    	}
    },


    onLoadTranscript: function(record, cmp, elm, eOpts) {
        var id = record.get('RoomInfo').getId();

        this.getModel('Transcript').load(id,{
            scope: this,
            failure: function(record, operation) {
                elm.animate({listeners: { beforeanimate: function(){ elm.show(true); } }});
            },
            success: function(record, operation) {
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
		var body = win.record.get('body') || [];

		body[0] = cmp.getValue().replace(/\u200b/g,'');

		win.record.set('body',body);
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


	toggleWhiteboardForNote: function(btn, event){
		var win = btn.up('window');

		alert('!!')

	},


    attemptToAddWidget: function(record){
        //check to see if reply is already there, if so, don't do anything...
        if (Ext.get('cmp-' + record.get('OID'))) return;

        var parent = record.get('inReplyTo');
        if(parent){
            parent = Ext.getCmp('cmp-'+parent);
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
		Ext.create('NextThought.view.windows.NoteEditor',{record: record}).show();
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
