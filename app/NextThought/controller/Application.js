

Ext.define('NextThought.controller.Application', {
    extend: 'Ext.app.Controller',

	views: [
		'Viewport',
		'modes.Reader',
		'modes.Groups',
		'navigation.Breadcrumb',
		'widgets.Highlight',
		'widgets.Note',
		'widgets.NoteEditor',
		'widgets.PeopleList',
		'widgets.RelatedItemsList',
		'widgets.ShareWithWindow',
		'widgets.MiniStreamList',
		'widgets.GroupEditorWindow',
		'content.Reader',
		'widgets.Tracker'
	],
	
	refs: [
        {
            ref: 'viewport',
            selector: 'master-view'
        },{
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
    	 	'master-view':{
				'edit-note': this.editNote,
				'share-with': this.shareWith
    	 	},
    	 	
    	 	'breadcrumbbar':{
    	 		'navigate': this.navigate
    	 	},
    	 	
    	 	'reader-panel':{
    	 		'location-changed': this.readerLocationChanged,
    	 		'publish-contributors': this.readerPublishedContributors
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
    	 	},
    	 	
    	 	'sharewithwindow button':{
    	 		'click': this.shareWithButton
    	 	},
    	 	
    	 	'groups-mode-container dataview':{
    	 		'itemdblclick':function(a, rec){
    	 			console.log(arguments);
    	 			Ext.create('NextThought.view.widgets.GroupEditorWindow',{record: rec}).show();
    	 		}
    	 	},
    	 	'groupeditor':{
    	 		
    	 	}
    	 });
    },
    
    onLaunch: function(){
    },
    
    
    shareWithButton: function(btn){
		var win = btn.up('window'),
			form= win.down('form'),
			shbx= win.down('sharewithinput'),
			rec = win.record;
		
		if(btn.isCancel){
			win.close();
		}
		
		if(!form.getForm().isValid()){
			return false;
		}
		
		rec.set('shareWith',shbx.valueModels);
		rec.save({
			scope: this,
			success:function(newRecord,operation){
				win.close();
				rec.fireEvent('updated',newRecord);
			}
		});
	},
    
    
    readerLocationChanged: function(id){
		this.getReaderStream().setContainer(id);
		this.getReaderRelated().setLocation(
			this.getReaderBreadcrumb().getLocation());
	},
	
	
	readerPublishedContributors: function(c){
		var t = this.getReaderPeople(),
			b = Ext.Function.createBuffered(t.setContributors,100,t,[c]);
		
		for(k in c){
			if(c.hasOwnProperty(k))
 				UserDataLoader.resolveUser(k,b);
		}
		
		b();
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
    		r = p._owner,
    		e = btn.eventName,
    		rec = p._annotation.getRecord();
    	
    	if(/delete/i.test(e)){
    		c.remove();
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
 	},
    
    navigate: function(book, ref){
    	this.getReader().setActive(book, ref);
    }
    
    
    
});