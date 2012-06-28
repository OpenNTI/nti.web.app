Ext.define('NextThought.view.annotations.Redaction', {
	extend:'NextThought.view.annotations.Highlight',
	alias: 'widget.redaction',
	requires:[
		'NextThought.cache.IdCache'
	],


	constructor: function(config){
		var me = this;
		me.callParent(arguments);

		Ext.apply(me,{
			rendered: false,
			renderPriority: 2,
			redactionsShown: false, //current state of hiding or unhiding, initially they are hid
			redactionSpans: [] //the spans that have been redacted are stored here for hide/unhide later
		});

		return me;
	},


	buildMenu: function(){
		var me = this,
			items = [],
			r = me.record,
			text = r.get('text');


		if (!this.redactionsShown) {
			items.push({
				text : 'Show Redaction',
				handler: function(){
					me.unRedact();
				}
			});
		}
		else {
			items.push({
				text : 'Hide Redaction',
				handler: function(){
					me.redact();
				}
			});
		}

		return this.callParent([items]);
	},


	cleanup: function(){
		this.callParent(arguments);
	},


	unRedact: function(){
		//TODO: loop over rendered, do something, cleanup it?  restyle it?
	},


	redact: function(){
		//TODO: see above
	}
});
