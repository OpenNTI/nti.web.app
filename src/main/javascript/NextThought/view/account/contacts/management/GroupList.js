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


	getSelected: function(){
		return this.getSelectionModel().getSelection();
	},


	refresh: function(){
		if(this.allowSelect){
			this.getSelectionModel().select(0,true,true);
		}
		this.callParent(arguments);

		if(this.rendered){
		Ext.each( this.getEl().query('img.delete-group'),
			function(dom){Ext.fly(dom).on('click',this.deleteGroup, this);},
			this);
		}
	},


	reset: function(){
		this.getSelectionModel().deselectAll();
		this.refresh();
	},


	getInnerTpl: function(displayField){
		return ['<div class="name">',
				'<img src="',Ext.BLANK_IMAGE_URL,'" class="delete-group"/>',
				'{',displayField,'}',
				'</div>'
		].join('');
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
	},


	deleteGroup: function(evt, dom){
		evt.preventDefault();
		evt.stopPropagation();

		var r = this.getRecord(Ext.fly(dom).up(this.itemSelector, this.getEl()));


		this.fireEvent('delete-group', r);
	}

});
