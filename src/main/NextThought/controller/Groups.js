Ext.define('NextThought.controller.Groups', {
    extend: 'Ext.app.Controller',

    models: [
        'Community',
        'FriendsList'
    ],

	stores: [
		'FriendsList'
	],

    views: [
        'modes.Groups',
        'windows.GroupEditorWindow'
    ],

    init: function() {
		this.application.on('session-ready', this.loadGroups, this);

        this.control({
            'groups-mode-container toolbar button[createItem]':{
                'click':function(){
                    var rec = Ext.create('NextThought.model.FriendsList');
                    Ext.create('NextThought.view.windows.GroupEditorWindow',{record: rec}).show();
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
                    //if(rec.get('Creator')==_AppConfig.username)
                        Ext.create('NextThought.view.windows.GroupEditorWindow',{record: rec}).show();
                },
                'selectionchange': function(a, sel){
                    var q = 'groups-mode-container toolbar button[deleteItem]';
                    Ext.each(Ext.ComponentQuery.query(q),function(v){
                        if(sel.length) v.enable(); else v.disable();
                    });
                }
            },

            'group-editor button':{
                'click': this.groupEditorButtonClicked
            }
        },{});
    },


	loadGroups: function(){
		var store = this.getFriendsListStore(),
			mime = store.model.prototype.mimeType,
			coll = _AppConfig.service.getCollectionFor(mime,'FriendsLists') || {};
		store.proxy.url = _AppConfig.server.host+coll.href;
		store.load();
	},


    reloadGroups: function(){
        this.getFriendsListStore().load();
    },


    groupEditorButtonClicked: function(btn){
        var win = btn.up('window'),
            frm = win.down('form'),
            str = win._store,
            rec = win.record,
			names = [],
			values, n;


        if(btn.actionName == 'save') {
            if(!frm.getForm().isValid()){
                return;
            }

            win.el.mask('Saving...');
            values = frm.getValues();
            Ext.each(str.data.items, function(u){ names.push(u.get('Username')); });

            if(rec.phantom){
                n = values.name;
                n = n.replace(/[^0-9A-Za-z\-@]/g, '.');
                n = n.replace(/^[\.\-_]+/g, '');
                rec.set('Username',n+'@nextthought.com');
            }
            rec.set('realname', values.name);
            rec.set('friends', names);
            rec.save({
                scope: this,
                success: function(){
                    this.reloadGroups();
                    win.close();
                },
                failed: function(){
                    this.reloadGroups();
                    win.close();
                }
            });
            return;
        }

        win.close();
    }

});
