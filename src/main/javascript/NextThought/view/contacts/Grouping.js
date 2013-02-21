Ext.define('NextThought.view.contacts.Grouping',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.contacts-tabs-grouping',
	requires: ['NextThought.view.contacts.Card'],
	defaultType: 'contacts-tabs-card',

	mixins: {
		userContainer: 'NextThought.mixins.UserContainer'
	},

	ui: 'contact-grouping',
	cls: 'contact-grouping',

	plain: true,
	frame: false,
	border: false,

	setUsers: function(users){
		var usersToAdd = Ext.Array.sort(users, this.userSorterFunction);
		this.add(Ext.Array.map(usersToAdd, this.createUserComponent));
	},

	createUserComponent: function(i){
		return {record: i};
	}
});
