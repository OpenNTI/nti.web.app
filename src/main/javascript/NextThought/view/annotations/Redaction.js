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
		this.actionSpan = Ext.get(this.doc.createElement('span'));
		this.actionSpan.addCls('redactionAction');
		this.actionSpan.insertBefore(this.rendered[0]);
		this.actionSpan.on('click', this.toggleRedaction, this);

		//create a composite element so we can do lots of things at once:
		this.compElements = new Ext.dom.CompositeElement(this.rendered);

		//add the redaction class and the click handlers for redacted spans:
		this.compElements.addCls(this.redactionCls);

		this.compElements.add([this.actionSpan]);
		this.toggleRedaction();
	},


	cleanup: function(){
		this.callParent(arguments);
	},


	toggleRedaction: function(){
		//toggle redaction on generated spans:
		this.compElements.toggleCls(this.cls);
	}
});
