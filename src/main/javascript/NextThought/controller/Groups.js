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
		'windows.GroupEditorWindow'
	],

	init: function() {
		this.application.on('session-ready', this.onSessionReady, this);

		this.control({
			'groups-view-container toolbar button[createItem]':{
				'click':function(){
					var rec = Ext.create('NextThought.model.FriendsList');
					Ext.create('NextThought.view.windows.GroupEditorWindow',{record: rec}).show();
				}
			},

			'groups-view-container toolbar button[deleteItem]':{
				'click':function(){
					var q = 'groups-view-container dataview';
					Ext.each(Ext.ComponentQuery.query(q),function(v){
						Ext.each(v.getSelectionModel().getSelection(), function(r){
							r.destroy();
						});
					});

					this.reloadGroups();
				}
			},

			'groups-view-container dataview':{
				'itemdblclick':function(a, rec){
					if(rec.isModifiable()) {
						Ext.create('NextThought.view.windows.GroupEditorWindow',{record: rec}).show();
					}
				},
				'selectionchange': function(a, sel){
					var q = 'groups-view-container toolbar button[deleteItem]';
					Ext.each(Ext.ComponentQuery.query(q),function(v){
						if(sel.length) {
							v.enable();
						} else {
							v.disable();
						}
					});
				}
			},

			'group-editor button':{
				'click': this.groupEditorButtonClicked
			}
		},{});
	},


	onSessionReady: function(){
		var app = this.application,
			store = this.getFriendsListStore(),
			mime = (new store.model()).mimeType,
			coll = $AppConfig.service.getCollectionFor(mime,'FriendsLists'),
			token = {};

		app.registerInitializeTask(token);
		store.on('load', function(s){ app.finishInitializeTask(token); }, this, {single: true});
		store.proxy.url = $AppConfig.server.host+coll.href;
		store.load();
	},


	reloadGroups: function(){
		this.getFriendsListStore().load();
	},


	groupEditorButtonClicked: function(btn){
		var win = btn.up('window'),
			frm = win.down('form'),
			str = win.store,
			rec = win.record,
			names = [],
			values, n;


		if(btn.actionName === 'save') {
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
					win.el.unmask();
				}
			});
			return;
		}

		win.close();
	}

});
