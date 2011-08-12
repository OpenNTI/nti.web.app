

Ext.define('NextThought.controller.Application', {
    extend: 'Ext.app.Controller',

	views: [
		'modes.Reader',
		'navigation.Breadcrumb',
		'widgets.Highlight',
		'widgets.Note',
		'widgets.NoteEditor',
		'widgets.PeopleList',
		'widgets.RelatedItemsList',
		'widgets.MiniStreamList',
		'content.Reader',
		'widgets.Tracker'
	],
	
	refs: [
        {
            ref: 'reader',
            selector: 'reader-panel'
        },{
            ref: 'readerBreadcrumb',
            selector: 'reader-mode-container breadcrumbbar'
        },{
            ref: 'readerPeople',
            selector: 'reader-mode-container people-list'
        },{
            ref: 'readerRelated',
            selector: 'reader-mode-container related-items'
        },{
            ref: 'readerStream',
            selector: 'reader-mode-container mini-stream'
        }
    ],

    init: function() {
    	 var l = NextThought.librarySource = Ext.create('NextThought.Library');
    	 l.on('loaded', function(){
    	 	var b = l._library.titles[0];
			this.navigate(b, b.root+'sect0001.html');
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
    	 		
    	 		'location-changed': function(id){
    	 			this.getReaderStream().setContainer(id);
    	 			this.getReaderRelated().setLocation(
    	 				this.getReaderBreadcrumb().getLocation());
    	 		},
    	 		
    	 		'publish-contributors': function(c){
    	 			var t = this.getReaderPeople(),
    	 				b = Ext.Function.createBuffered(t.setContributors,100,t,[c]);
    	 			
    	 			for(k in c){
    	 				if(c.hasOwnProperty(k))
	    	 				UserDataLoader.resolveUser(k,b);
    	 			}
    	 			
    	 			b();
    	 		}
    	 	},
    	 	
    	 	'reader-mode-container related-items':{
    	 		'navigate': this.navigate
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
    	var o = [
	    	this.getReader(),
	    	this.getReaderPeople(),
	    	this.getReaderRelated(),
	    	this.getReaderStream()
	    	];
	    	
    	Ext.each(o,function(i){i.applyFilter(newFilter);});
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