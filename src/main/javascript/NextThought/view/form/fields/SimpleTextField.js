Ext.define('NextThought.view.form.fields.SimpleTextField',{
	extend: 'Ext.Component',
	alias: 'widget.simpletext',

	constructor: function(config){
		this.callParent(arguments);

		this.autoEl = Ext.apply(this.autoEl||{},{
			tag: 'input',
			type: 'text'
		});

		return this;
	}
});
