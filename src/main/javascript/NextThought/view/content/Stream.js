Ext.define('NextThought.view.content.Stream', {
	extend:'NextThought.view.content.Panel',
	alias:'widget.stream-panel',
	requires: [
		'NextThought.view.widgets.StreamEntry'
	],
	cls: 'x-stream-home',

	autoScroll: false,
	border: false,
	defaults: {border: false},
	items:[{autoScroll:true, padding: 5}],

	filter: {},

	constructor: function(){
		this.callParent(arguments);

		//make a buffered function out of our updater
		this.updateStream = Ext.Function.createBuffered(this.updateStream,100,this);

		return this;
	},

	initComponent: function(){
		this.callParent(arguments);
		this.store = Ext.getStore('Stream');
		this.store.on('add', this.updateStream, this);
		this.store.on('load', this.updateStream, this);
	},

	applyFilter: function(filter){
		this.filter = filter;
		this.updateStream();
	},

	updateStream: function(){
		var p = this.items.get(0),
			f = this.filter;

		p.removeAll(true);

		if(!f.shareTargets) {
			return;
		}

		this.store.each(function(change){
			var u = change.get('Creator');

			if(/all/i.test(f.groups) || f.shareTargets[ u ] || (f.includeMe && f.includeMe===u)){
				p.add({change: change, xtype: 'streamEntry'});
			}
		});
	}
});
