Ext.define('NextThought.view.account.contacts.management.GroupList',{
	extend: 'Ext.view.BoundList',
	alias: 'widget.management-group-list',

	ui: 'nt',
	plain: true,
	shadow: false,
	frame: false,
	border: false,

	cls: 'group-selection-list',
	baseCls: 'selection',
	itemCls: 'selection-list-item multiselect',
	displayField: 'realname',
	selModel: { mode: 'SIMPLE' },

	initComponent: function(){
		this.store = Ext.getStore('FriendsList');
		this.callParent(arguments);
		this.itemSelector = '.selection-list-item';

		this.mon(this.getSelectionModel(), {
			beforeselect: this.onBeforeSelect,
			beforedeselect: this.onBeforeDeselect,
			scope: this
		});
	},


	refresh: function(){
		if(this.allowSelect){
			this.getSelectionModel().select(0,true,true);
		}
		return this.callParent(arguments);
	},


	getInnerTpl: function(displayField){
		return '<div class="name">{'+displayField+'}</div>';
	},


	onBeforeSelect: function(list,model){
		if(!this.allowSelect || !model.isModifiable()){
			return false;
		}
	},

	onBeforeDeselect: function(list,model){
		if(this.allowSelect && !model.isModifiable()){
			return false;
		}
	},


	disallowSelection: function(){
		this.allowSelect = false;
		this.getSelectionModel().deselectAll();
	},


	allowSelection: function(){
		this.allowSelect = true;
		this.refresh();
	}


});
