

Ext.define('NextThought.controller.Application', {
    extend: 'Ext.app.Controller',
    requires: ['NextThought.proxy.UserDataLoader'],

	views: [
		'Viewport',
		'modes.Reader',
		'modes.Groups',
        'modes.Stream',
		'navigation.Breadcrumb',
        'widgets.ItemNavigator',
		'widgets.Highlight',
		'widgets.Note',
		'widgets.NoteEditor',
		'widgets.PeopleList',
		'widgets.RelatedItemsList',
		'widgets.ShareWithWindow',
		'widgets.MiniStreamList',
		'widgets.GroupEditorWindow',
		'content.Reader',
        'content.Stream',
		'widgets.Tracker',
        'widgets.LeftColumn',
        'widgets.RightColumn'
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
        },{
            ref: 'streamPeople',
            selector: 'stream-mode-container people-list'
        },{
            ref: 'stream',
            selector: 'stream-mode-container stream-panel'
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
				'share-with': this.shareWith,
                'object-changed' : this.objectChanged
    	 	},

            'leftColumn button[objectExplorer]': {
                'click': this.objectExplorerClicked
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

            'stream-mode-container filter-control':{
    	 		'filter-changed': this.streamFilterChanged
    	 	},
    	 	
    	 	'sharewithwindow button':{
    	 		'click': this.shareWithButton
    	 	},
    	 	
    	 	'groups-mode-container toolbar button[createItem]':{
    	 		'click':function(){
    	 			var rec = Ext.create('NextThought.model.FriendsList');
    	 			Ext.create('NextThought.view.widgets.GroupEditorWindow',{record: rec}).show();
    	 		}
    	 	},

    	 	'groups-mode-container toolbar button[deleteItem]':{
    	 		'click':function(){
    	 			var q = 'groups-mode-container dataview';
    	 			Ext.each(Ext.ComponentQuery.query(q),function(v){
    	 				Ext.each(v.getSelectionModel().getSelection(), function(r){
    	 					r.destroy();
    	 				});
    	 			});
    	 			
    	 			this.reloadGroups();
    	 		}
    	 	},
    	 	
    	 	'groups-mode-container dataview':{
    	 		'itemdblclick':function(a, rec){
    	 			if(rec.get('Creator')==_AppConfig.server.username)
    	 				Ext.create('NextThought.view.widgets.GroupEditorWindow',{record: rec}).show();
    	 		},
    	 		'selectionchange': function(a, sel){
    	 			var q = 'groups-mode-container toolbar button[deleteItem]';
    	 			Ext.each(Ext.ComponentQuery.query(q),function(v){
    	 				sel.length ? v.enable() : v.disable();
    	 			});
    	 		}
    	 	},
    	 	'group-editor button':{
    	 		'click': this.groupEditorButtonClicked
    	 	},
            'item-navigator gridpanel': {
                'itemdblclick': this.itemNavigatorItemActivated
            },
            'item-navigator': {
                'annotation-destroyed': this.removeAnnotation
            }
    	 });
    },

    removeAnnotation: function(oid){
        this.getReader().removeAnnotation(oid);
    },

    objectChanged: function() {
        if (!this.objectExplorer || !this.objectExplorer.isVisible()) return;
        Ext.ComponentQuery.query('window item-navigator')[0].reload();
    },

    itemNavigatorItemActivated: function(control, record, dom, index) {
        var containerId = record.get('ContainerId'),
            bookInfo = NextThought.librarySource.findLocation(containerId),
            book = bookInfo.book,
            href = bookInfo.location.getAttribute('href');

        this.navigate(book, book.root + href);
    },

    objectExplorerClicked: function(btn, e, o) {
        if (!this.objectExplorer) {
            this.objectExplorer = 	Ext.create('Ext.Window', {
				id:'object-explorer',
				title: 'My Stuff',
				x:100,
				y:100,
				width: 500,
				height: 350,
				maximizable:true,
				minimizable:true,
				layout: 'fit',
				closeAction: 'hide',
				items: Ext.create('widget.item-navigator', {})
			});
        }

        this.objectExplorer.show();
    },
	
	reloadGroups: function(){
		UserDataLoader.getFriendsListsStore().load();
		Ext.each(Ext.ComponentQuery.query('filter-control'), function(g){g.reload()});
	},


	groupEditorButtonClicked: function(btn){
		var win = btn.up('window'),
			frm = win.down('form'),
			str = win._store,
			rec = win.record;
		
		
		if(btn.actionName == 'save') {
			if(!frm.getForm().isValid()){
				return;
			}
			
			win.el.mask('Saving...');
			var names = [],
				values = frm.getValues();
			Ext.each(str.data.items, function(u){ names.push(u.get('Username')); });
			
			if(rec.phantom){
				var n = values.name;
					n = n.replace(/[^0-9A-Za-z\-\@]/g, '.');
					n = n.replace(/^[\.\-_]+/g, '');
				rec.set('Username',n+'@nextthought.com');
			}
			rec.set('realname', values.name);
			rec.set('friends', names);
			rec.save({
				scope: this,
				success: function(newRecord){
					this.reloadGroups();
					win.close();
				},
				failed: function(){
					console.log('failed to save group',arguments);
					win.close();
					this.reloadGroups();
				}
			});
			return;
		}
		
		win.close();
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

    streamFilterChanged: function(newFilter){
    	var o = [
	    	this.getStream(),
	    	this.getStreamPeople()
	    	];

    	Ext.each(o,function(i){i.applyFilter(newFilter);});
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
 	},
    
    navigate: function(book, ref){
    	this.getReader().setActive(book, ref);
    }
    
    
    
});