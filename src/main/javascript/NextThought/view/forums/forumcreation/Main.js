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
			{xtype: 'button', cls: 'submitBtn', ui: 'primary', scale: 'large', name: 'submit', text:'Save'}
		]}
	],


	afterRender: function(){
		this.callParent(arguments);

		var record = this.getRecord();

		//If we are editing inintialize here
		if(record){
			this.down('[name=title]').update(record.get('title'));
			this.down('[name=description]').el.update(record.get('description'));
		}

		this.mon(this.el, 'click', 'handleClick', this);
	},

	
	handleClick: function(e){
		var values, target = e.getTarget('.submitBtn');

		if(target){
			values = this.getValues();

			if(values.title.length > 140){
				//the title is too long
				this.setError({
					field: 'title',
					message: "Could not save your Discussion. The title is too long. It can only be 140 characters or less"
				});
				return;
			}

			this.fireEvent('save-forum', this, this.getRecord(), values.title, values.description);
		}
	},

	//go up to the window to get the record we are editing
	getRecord: function(){
		return this.up('forumcreation-window').record;
	},


	getValues: function(){
		//Pull data out of the forum and return it here
		return {
			title: this.down('[name=title]').getValue(),
			description: this.down('[name=description]').el.getValue()
		}
	},

	setError: function(error) {
		var box = this.down('[name=error]'),
			field = this.down('[name='+error.field+']'),
			allFields = this.query('[name]');

		//clear all errors:
		Ext.each(allFields, function(f){f.removeCls('error');});

		//make main error field show up
		box.el.down('.error-field').update('Error');
		box.el.down('.error-desc').update(error.message);
		box.show();

		//set error state on specific field
		field.addCls('error');

		this.up('window').updateLayout();
	},

	onSaveSuccess: function(){
		this.up('forumcreation-window').close();
	},

	onSaveFailure: function(proxy, response, operation){
		var msg = {
				message: 'An unknown error occurred saving your Discussion.',
				field: ''
			}, error;

		if(response && response.responseText){
			error = JSON.parse(response.responseText) || {};
			if(error.code === "TooLong"){
				msg.message = "Could not save your Discussion. The title is too long. It can only be 140 characters or less";
				msg.field = 'title'
			}
		}

		this.setError(msg);
		console.debug(arguments);
	}
});
