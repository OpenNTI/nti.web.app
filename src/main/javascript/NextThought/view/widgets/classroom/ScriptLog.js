Ext.define('NextThought.view.widgets.classroom.ScriptLog', {
	extend:'Ext.panel.Panel',
	alias: 'widget.script-log-view',
	requires: [
		'NextThought.view.widgets.classroom.ScriptEntry',
		'NextThought.cache.IdCache',
		'NextThought.model.ClassScript'
	],

	cls: 'script-log-view',
	autoScroll: true,
	layout: 'anchor',
	split: true,
	defaults: {border: false},
	dockedItems: {dock: 'bottom', xtype: 'toolbar', items:[
		{text: 'something'}
	]},


	initComponent: function(config) {
		this.callParent(arguments);

		//set border so it doesn't get overridden...
		this.on('beforerender', function(){
			this.border = '0 2px 0 2px';
		}, this);
	},


	addMessage: function(bodies) {
		var b,m;

		if (!Ext.isArray(bodies)){bodies = [bodies];}

		for (b in bodies) {
			if (bodies.hasOwnProperty(b)){
				if (!Ext.isArray(b)){b = [b];}
				m = Ext.create('NextThought.model.MessageInfo', {body : [bodies[b]]});
				this.add(
					{
						xtype: 'script-entry',
						message: m
					}
				);
			}
		}
	},

	afterRender: function() {
		this.callParent(arguments);
		this.setClassScript();
	},


	setClassScript: function() {
		if (this.script) {
			this.addMessage(this.script.get('body'));
		}
	},

	scrollToFirstNonPromotedEntry: function() {
		var entries = this.query('script-entry[promoted=false]'),
			o = entries[0] ? entries[0] : null;

		if (!o){return;}

		o.el.scrollIntoView(this.el.first('.x-panel-body'));

	}
});
