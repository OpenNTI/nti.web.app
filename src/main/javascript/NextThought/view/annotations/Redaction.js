Ext.define('NextThought.view.annotations.Redaction', {
	extend:'NextThought.view.annotations.Highlight',
	alias: 'widget.redaction',
	requires:[
		'NextThought.cache.IdCache'
	],

	redactionCls: 'redaction',
	cls: 'redacted',


	buildMenu: function(items){
		var me = this;

		items.push({
			text : 'Redact',
			handler: function(){
				me.toggleRedaction();
			}
		});

		return this.callParent([items]);
	},


	render: function(){
		this.callParent(arguments);

		if (this.actionSpan){return;}

		//Add the redaction action span so the user has something to click on
		this.actionSpan = this.createActionHandle(this.rendered[0]);

		//add the redaction class and the click handlers for redacted spans:
		this.compElements.addCls(this.redactionCls);

		this.compElements.add([this.actionSpan]);
		this.toggleRedaction();
	},


	createActionHandle: function(before){
		var el = Ext.get(this.doc.createElement('span'));
		el.addCls('redactionAction');
		el.insertBefore(before);
		el.on('click', this.toggleRedaction, this);
		return el;
	},


	cleanup: function(){
		this.callParent(arguments);
	},


	toggleRedaction: function(){
		//toggle redaction on generated spans:
		this.compElements.toggleCls(this.cls);
	}
});
