Ext.define('NextThought.view.account.coppa.upgraded.MonthPicker',{
	extend:'Ext.view.BoundList',
	alias:'widget.month-picker',


	allowBlank: true,
	displayField: 'name',
	valueField: 'id',
	floating:true,
	singleSelect: true,

	constrainTo: Ext.getBody(),
	renderTo: Ext.getBody(),
	loadingHeight: 40,
	width:150,
	minHeight:30,

	plain: true,
	ui:'nt',
	cls: 'month-picker-list',
	baseCls: 'x-menu',
	itemCls: 'x-menu-item',
	itemSelector:'x-menu-item',

	constructor: function(){
		this.store = new Ext.data.Store({
			fields:['name', 'id'],
			data: [
				{id:'1', name:'January'},
				{id:'2', name:'February'},
				{id:'3', name:'March'},
				{id:'4', name:'April'},
				{id:'5', name:'May'},
				{id:'6', name:'June'},
				{id:'7', name:'July'},
				{id:'8', name:'August'},
				{id:'9', name:'September'},
				{id:'10', name:'October'},
				{id:'11', name:'November'},
				{id:'12', name:'December'}
			]
		});
		this.callParent(arguments);
	},

	afterRender: function(){
		this.callParent(arguments);
		this.on('select', this.onSelect, this);
		this.on('itemclick', this.onSelect, this);
	},

	onSelect: function(){
		this.hide();
	}
});