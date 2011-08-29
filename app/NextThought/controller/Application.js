

Ext.define('NextThought.controller.Application', {
    extend: 'Ext.app.Controller',
    requires: ['NextThought.proxy.UserDataLoader'],

	views: [
		'Viewport',
		'modes.Reader',
		'modes.Groups',
        'modes.Stream',
		'navigation.Breadcrumb',
		'widgets.PeopleList',
		'widgets.RelatedItemsList',
		'widgets.MiniStreamList',
		'widgets.GroupEditorWindow',
		'content.Reader',
        'content.Stream',
		'widgets.Tracker',
        'widgets.LeftColumn',
        'widgets.RightColumn',
        'widgets.SessionInfo',
        'widgets.NotificationsPopover'
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
        },{
            ref: 'sessionInfo',
            selector: 'session-info'
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
                'location-changed': this.readerLocationChanged,
                'publish-contributors': this.readerPublishedContributors
            },

            'reader-mode-container related-items':{
                'navigate': this.navigate
            },

            'reader-mode-container filter-control':{
                'filter-changed': this.readerFilterChanged
            },

            'stream-mode-container filter-control':{
                'filter-changed': this.streamFilterChanged
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

            'session-info': {
                'notification-clicked': this.popoverNotifications
            }
        });
    },


    popoverNotifications: function() {

        var popover = Ext.create('widget.notifications-popover');

        console.log('popover', popover, this.getSessionInfo());

        popover.alignTo(this.getSessionInfo());
        popover.show();
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
    

    
    navigate: function(book, ref){
    	this.getReader().setActive(book, ref);
    }
    
    
    
});