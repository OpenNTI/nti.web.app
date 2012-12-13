Ext.define('NextThought.view.account.contacts.createlist.Main',{
	extend: 'Ext.container.Container',
	alias: 'widget.createlist-main-view',
	requires: [
		'NextThought.view.form.fields.SimpleTextField'
	],

	cls: 'createlist-main-view',

	items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items:[
			{xtype: 'box', name: 'namelabel', cls: 'label', html: 'List name'},
			{xtype: 'simpletext', name: 'name', cls: 'input-box name', inputType: 'text', placeholder: 'Choose a name for your list...'}
		]},
		{xtype: 'box', hidden: true, name:'error', autoEl: {cls: 'error-box', tag:'div',
			cn:[
				{cls: 'error-desc'}
			]}
		},
		{xtype: 'container', cls: 'submit',	 layout:{type: 'hbox', pack: 'end'}, items: [
			{xtype: 'button', ui: 'secondary', scale: 'large', name: 'cancel', text:'Cancel', handler: function(b){
				b.up('window').close();
			}},
			{xtype: 'button',  ui: 'primary', scale: 'large', name: 'submit', text: 'Create', disabled: true, minWidth: 96}
		]}
	],

	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.down('[name=name]'), 'changed', this.changed, this);
		this.mon(this.down('[name=name]'), 'click', this.clearError, this);
	},

	getListName: function(){
		var name = this.down('[name=name]').getValue();
		return name ? name.trim() : name;
	},

	changed: function(value, t){
		var val = value.trim(),
			empty = Ext.isEmpty(val),
			btn = this.query('[name=submit]',this)[0];
		btn.setDisabled(empty);
		if(Ext.isEmpty(val)){
			t.addClass('empty');
		}
		else{
			t.removeCls('empty');
		}
	},

	showError: function(errorText){
		var box = this.down('[name=error]');

		errorText = errorText || 'An unknown error occurred. Please try again.';

		//make main error field show up
		box.el.down('.error-desc').update(errorText);
		box.show();
	},


	clearError: function(){
		var box = this.down('[name=error]');
		box.hide();
	}
});
