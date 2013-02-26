Ext.define('NextThought.view.contacts.Panel',{
	extend: 'Ext.container.Container',
	alias: 'widget.contacts-tabs-panel',
	requires: ['NextThought.view.contacts.Card'],
	defaultType: 'contacts-tabs-card',
	autoScroll:true,

	mixins:{
		userContainer: 'NextThought.mixins.UserContainer'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.listenForPresenceChanges();
	},


	setUsers: function(users){
		var usersToAdd = Ext.Array.sort(users, this.userSorterFunction);
		this.removeAll(true);
		this.add(Ext.Array.map(usersToAdd, this.createUserComponent));
	},


	createUserComponent: function(i){
		return {record: i};
	}
});
