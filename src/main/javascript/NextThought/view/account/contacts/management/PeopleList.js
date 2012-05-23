Ext.define('NextThought.view.account.contacts.management.PeopleList',{
	extend: 'Ext.view.BoundList',
	alias: 'widget.management-people-list',

	ui: 'nt',
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	hidden: true,

	cls: 'people-selection-list',
	baseCls: 'selection',
	itemCls: 'selection-list-item contact-card',
	displayField: 'realname',
	selModel: { mode: 'SIMPLE' },


	initComponent: function(){
		this.store = Ext.create('Ext.data.Store',{model: 'NextThought.model.UserSearch'});
		this.callParent(arguments);
		this.itemSelector = '.selection-list-item';

		this.on({
			scope: this,
			added: function(){
				this.ownerCt.down('usersearchinput').on('select', this.doSelect, this);
			}
		});

		this.store.on('datachanged',this.onChange,this);

	},


	getInnerTpl: function(displayField){
		return [
			'<img class="nib" src="',Ext.BLANK_IMAGE_URL,'">',
			'<img src="{avatarURL}">',
			'<div class="card-body">',
				'<div class="name">{',displayField,'}</div>',
				'<div class="status">Affiliation</div>',
			'</div>'
		].join('');
	},


	getSelected: function(){
		var sel = [];
		this.store.each(function(s){ sel.push(s.getId()); });
		return sel;
	},


	reset: function(){
		this.store.removeAll(false);
		this.onChange();
	},


	doSelect: function(ctrl, selected) {
		var s = this.store;
		if(!Ext.isArray(selected)){
			selected = [selected];
		}

		Ext.each(selected,function(item){
			if(!s.getById(item.getId())){
				s.add(item);
			}
		});
		this.refresh();
	},


	onChange: function(){
		var isEmpty = !this.store.getCount(); //=== (count === 0)

		if(isEmpty){ this.hide(); }
		else { this.show(); }

		this.fireEvent('change', isEmpty );
	},


	onItemClick: function(record){
		this.store.remove(record);
	}
});
