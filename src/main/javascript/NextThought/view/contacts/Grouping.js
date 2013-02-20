Ext.define('NextThought.view.contacts.Grouping',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.contacts-tabs-grouping',
	requires: ['NextThought.view.contacts.Card'],
	defaultType: 'contacts-tabs-card',

	ui: 'contact-grouping',
	cls: 'contact-grouping',

	plain: true,
	frame: false,
	border: false,

	setUsers: function(users){
		this.add(Ext.Array.map(users,function(i){return {record: i};}));
	}
});
