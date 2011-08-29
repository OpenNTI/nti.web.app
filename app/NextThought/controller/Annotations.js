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
    	 	},
        });
    },

    shareWithButton: function(btn){
		var win = btn.up('window'),
			form= win.down('form'),
			shbx= win.down('sharewithinput'),
			rec = win.record;

		if(btn.isCancel){
			win.close();
            return;
		}

		if(!form.getForm().isValid()){
			return false;
		}

        rec.set('sharedWith',Ext.data.Types.SHARED_WITH.convert(shbx.valueModels));
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
				}
			});
		}
    	else {
	    	win.close();
    	}
    },

    shareWith: function(record){
    	Ext.create('NextThought.view.widgets.ShareWithWindow',{record: record}).show();
    },

    editNote: function(note){
		Ext.create('NextThought.view.widgets.NoteEditor',{record: note}).show();
 	}
});