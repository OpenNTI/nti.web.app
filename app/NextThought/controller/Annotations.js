Ext.define('NextThought.controller.Annotations', {
    extend: 'Ext.app.Controller',

	views: [
        'Viewport',
        'widgets.Highlight',
		'widgets.Note',
		'widgets.NoteEditor',
        'widgets.ShareWithWindow'
    ],

    refs: [
        {
            ref: 'viewport',
            selector: 'master-view'
        }
    ],

    init: function() {
        this.control({
            'master-view':{
                'create-note': this.addNote,
                'reply-to-note': this.replyToNote,
				'edit-note': this.editNote,
				'share-with': this.shareWith
    	 	},

            'notepanel button':{
                'click': this.onNoteAction
            },

    	 	'noteeditor button':{
				'click': this.onNoteEditorButton
    	 	},

            'sharewithwindow button':{
    	 		'click': this.shareWithButton
    	 	}
        });
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
			}
		});
	},

    onNoteAction: function(btn, event){
    	var p = btn.up('notepanel');
    		r = p._owner,
    		e = btn.eventName,
            a = p._annotation,
    		rec = a.getRecord();

    	if(/delete/i.test(e)){
    		a.remove();
    	}
    	else {
	    	this.getViewport().fireEvent(e, rec);
    	}
    },

    onNoteEditorButton: function(btn, event){
    	var win = btn.up('window'),
    		cmp = win.down('htmleditor');

		if(!btn.isCancel){
			win.el.mask('Saving...');
			win.record.set('text',cmp.getValue());
			win.record.save({
				scope: this,
				success:function(newRecord,operation){
					win.close();
					win.record.fireEvent('updated',newRecord);
                    this.attemptToAddWidget(newRecord);
				}
			});
		}
    	else {
	    	win.close();
    	}
    },

    attemptToAddWidget: function(record){
        var parent = record.get('inReplyTo');
        if(parent){
            parent = Ext.getCmp('note-'+parent);
            parent.addReply(record);
        }
        else
            this.getContext().createNoteWidget(record);

        this.getContext().fireEvent('resize');
    },

    replyToNote: function(record){
        this.editNote(AnnotationUtils.noteToReply(record));
    },

    shareWith: function(record){
    	Ext.create('NextThought.view.widgets.ShareWithWindow',{record: record}).show();
    },

    editNote: function(record){
		Ext.create('NextThought.view.widgets.NoteEditor',{record: record}).show();
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