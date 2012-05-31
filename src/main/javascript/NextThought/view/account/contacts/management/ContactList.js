Ext.define('NextThought.view.account.contacts.management.ContactList',{
	extend: 'Ext.container.Container',
	alias: 'widget.management-contact-list',

	requires: [
		'NextThought.view.account.contacts.management.Person'
	],

	ui: 'nt',
	hidden: true,

	cls: 'contact-selection-list',
	baseCls: 'selection',

	initComponent: function(){
		this.store = Ext.create('Ext.data.Store',{model: 'NextThought.model.UserSearch'});
		this.callParent(arguments);

		this.on({
			scope: this,
			added: function(){
				this.ownerCt.down('usersearchinput').on('select', this.doSelect, this);
			}
		});

		this.store.on('add',this.onContactAdded,this);
		this.store.on('clear',this.onContactsCleared,this);
		this.store.on('datachanged',this.onChange,this);
	},


	getSelected: function(){
		var results = {};
		this.items.each(function(s){
			var g = s.getSelected();
			Ext.each(g.groups,function(group){
				if(!results[group.getId()]){
					results[group.getId()] = {
						record: group,
						people: []
					};
				}
				results[group.getId()].people.push(g.user);
			});


		});
		return results;
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
	},


	onContactAdded: function(store,records){
		var items = [],
			me = this;

		Ext.each(records,function(r){
			var w = Ext.widget({ xtype: 'add-person-card', user: r });
			items.push(w);
			w.on({
				scope: me,
				beforedestroy: me.removeContact,
				beforeexpand: me.collapseExpanded
			})
		});

		this.insert(0, items);
		this.expandFirstItemOnly();
	},


	/**
	 * This method causes the group list to be expanded for the very first item in the list.
	 * The rest of the items are automatically collapsed.  Thus, if you always add at 0, the thing
	 * you just added will be expanded.
	 */
	expandFirstItemOnly: function(){
		var i = 0, item;
		for (i; i < this.items.getCount(); i++) {
			item = this.items.get(i);
			if (i === 0){ item.expand(); }
			else{ item.collapse(); }
		}
	},


	removeContact: function(item){
		this.store.remove(item.user);
		this.onChange();
	},


	collapseExpanded: function(expandingCard){
		this.items.each(function(c){
			if(expandingCard !== c ){
				c.collapse();
			}
		});
	},


	onContactsCleared: function(){
		this.removeAll(true);
	},


	onChange: function(){
		var isEmpty = !this.store.getCount(); //=== (count === 0)

		if(isEmpty){ this.hide(); }
		else { this.show(); }

		this.fireEvent('change', isEmpty );
	}

});
