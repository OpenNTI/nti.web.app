Ext.define('NextThought.view.account.contacts.management.AddGroup',{
	extend: 'Ext.Component',
	alias: 'widget.add-group',

	mixins: {
		addgroup: 'NextThought.mixins.AddGroup'
	},

	afterRender: function(){
		this.callParent(arguments);
		this.reset();
		
	},

	onAdded: function(owner){
		var ourStore = Ext.getStore('FriendsList');
		this.mon(ourStore, {
			beforeload: function(){
				if(!owner.getEl()){return;}
				owner.getEl().mask('Loading...');
				ourStore.on('load', function(){
					owner.getEl().unmask();
				}, this, {single: true});
			}
		});
	},

	//Our mixin wants to call this
	reset: function(){
		this.el.update('');
		this.attachAddGroupControl(this.el, 'div');
		Ext.defer(this.updateLayout, 1, this);
	},

	afterGroupAdd: function(){}

});
