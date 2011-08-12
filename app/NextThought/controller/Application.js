

Ext.define('NextThought.controller.Application', {
    extend: 'Ext.app.Controller',

	views: [
		'modes.Reader',
		'navigation.Breadcrumb',
		'widgets.Highlight',
		'widgets.Note',
		'widgets.NoteEditor',
		'widgets.PeopleList',
		'content.Reader',
		'widgets.Tracker'
	],
	
	refs: [
        {
            ref: 'reader',
            selector: 'reader-panel'
        },
        {
            ref: 'readerPeople',
            selector: 'reader-mode-container people-list'
        }
    ],

    init: function() {
    	 var l = NextThought.librarySource = Ext.create('NextThought.Library');
    	 l.on('loaded', function(){
    	 	var b = l._library.titles[0];
			this.getReader().setActive(b, b.root+'sect0001.html');
    	 },
    	 this);
    	 
    	 
    	 this.control({
    	 	'breadcrumbbar':{
    	 		'navigate': this.navigate
    	 	},
    	 	
    	 	'reader-panel':{
    	 		'edit-note': function(note){
    	 			Ext.create('NextThought.view.widgets.NoteEditor',{record: note}).show();
    	 		},
    	 		
    	 		'publish-contributors': function(c){
    	 			this.getReaderPeople().setContributors(c);
    	 		}
    	 	},
    	 	
    	 	'notepanel button':{
    	 		'click': this.onNoteAction
    	 	},
    	 	
    	 	'noteeditor button':{
				'click': this.onNoteEditorButton
    	 	},
    	 	
    	 	'reader-mode-container filter-control':{
    	 		'filter-changed': this.readerFilterChanged
    	 	}
    	 });
    },
    
    onLaunch: function(){
    },
    
    
    readerFilterChanged: function(newFilter){
    	this.getReader().applyFilter(newFilter);
    	this.getReaderPeople().applyFilter(newFilter);
    },
    
    
    onNoteAction: function(btn, event){
    	var p = btn.up('notepanel');
    		r = p._owner;
    		c = p._annotation;
    	if(btn.isEdit){
    		r.fireEvent('edit-note', c.getRecord());
    	}
    	else if(btn.isDelete){
    		c.remove();
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
    
    
    navigate: function(book, ref){
    	this.getReader().setActive(book, ref);
    }
    
    
    
});