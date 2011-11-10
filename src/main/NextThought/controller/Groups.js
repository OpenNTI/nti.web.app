Ext.define('NextThought.controller.Groups', {
    extend: 'Ext.app.Controller',

    models: [
        'Community',
        'FriendsList'
    ],

    views: [
        'modes.Groups',
        'windows.GroupEditorWindow'
    ],

    init: function() {
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
                    //if(rec.get('Creator')==_AppConfig.server.username)
                        Ext.create('NextThought.view.windows.GroupEditorWindow',{record: rec}).show();
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
            }
        },{});
    },

    reloadGroups: function(){
        UserDataLoader.getFriendsListsStore().load();
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
                    this.reloadGroups();
                    win.close();
                }
            });
            return;
        }

        win.close();
    }

});
