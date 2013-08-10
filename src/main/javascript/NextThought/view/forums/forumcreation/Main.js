Ext.define('NextThought.view.forums.forumcreation.Main',{
	extend: 'Ext.container.Container',
	alias: 'widget.forumcreation-main-view',


	cls: 'forumcreation-main-view',

	items: [
		{xtype: 'container', layout: 'anchor', cls: 'input-wrapper', items:[
			{xtype: 'simpletext', name: 'title', cls: 'input-box', inputType: 'text', placeholder:'Title'},
			{xtype: 'box', autoEl: {tag: 'textarea', name: 'description', placeholder: 'Description...'}, name: 'description', cls: 'input-box textarea', emptyText: 'Description...'}
		]},
		{xtype: 'box', hidden: true, name:'error', autoEl: {cls: 'error-box', tag:'div',
			cn:[
				{cls: 'error-field'},
				{cls: 'error-desc'}
			]}
		},
		{xtype: 'container', cls: 'submit',  layout:{type: 'hbox', pack: 'end'}, items: [
			{xtype: 'button', ui: 'secondary', scale: 'large', name: 'cancel', text:'Cancel', handler: function(b){
				b.up('window').close();
			}},
			{xtype: 'button', ui: 'primary', scale: 'large', name: 'submit', text:'Create'}
		]}
	],


	afterRender: function(){
		this.callParent(arguments);

		//If we are editing inintialize here
	},


	getValues: function(){
		//Pull data out of the forum and return it here
	},

	setError: function(error) {
		var box = this.down('[name=error]'),
			field = this.down('[name='+error.field+']'),
			allFields = this.query('[name]');

		//clear all errors:
		Ext.each(allFields, function(f){f.removeCls('error');});

		//make main error field show up
		box.el.down('.error-field').update('Video');
		box.el.down('.error-desc').update(error.message);
		box.show();

		//set error state on specific field
		field.addCls('error');

		this.up('window').updateLayout();
	}
});
