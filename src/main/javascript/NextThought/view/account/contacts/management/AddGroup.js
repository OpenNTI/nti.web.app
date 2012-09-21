Ext.define('NextThought.view.account.contacts.management.AddGroup',{
	extend: 'Ext.Component',
	alias: 'widget.add-group',

	mixins: ['NextThought.mixins.AddGroup'],

	afterRender: function(){
		this.callParent(arguments);
		this.attachAddGroupControl(this.el, 'div');
		Ext.defer(this.updateLayout, 1, this);
		
	},

	onAdded: function(owner){
		var ourStore = Ext.getStore('FriendsList');
		console.log(owner, ourStore);
		this.mon(ourStore, {
			beforeload: function(){
				owner.getEl().mask('Loading...');
				ourStore.on('load', function(){
					owner.getEl().unmask();
				}, this, {single: true});
			}
		});
	},

	//Our mixin wants to call this
	reset: function(){
		
	},

	afterGroupAdd: function(){}

});
