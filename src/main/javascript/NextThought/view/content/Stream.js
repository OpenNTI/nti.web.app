Ext.define('NextThought.view.content.Stream', {
	extend:'NextThought.view.content.Panel',
	alias:'widget.stream-panel',
	requires: [
		'NextThought.view.widgets.StreamEntry',
		'NextThought.filter.FilterManager'
	],
	cls: 'x-stream-home',

	autoScroll: false,
	border: false,
	defaults: {border: false},
	items:[{autoScroll:true, padding: 5}],

	constructor: function(){
		this.callParent(arguments);

		//make a buffered function out of our updater
		this.updateStream = Ext.Function.createBuffered(this.updateStream,100,this);

		return this;
	},

	initComponent: function(){
		var me = this, s;
		me.callParent(arguments);
		s = me.store = Ext.getStore('Stream');
		s.on('add', me.updateStream, me);
		s.on('load', me.updateStream, me);
		me.on('added',function(){
			FilterManager.registerFilterListener(me, me.applyFilter,me);
		});
	},

	applyFilter: function(filter){
		this.filter = filter;
		this.updateStream();
	},

	updateStream: function(){
		var p = this.items.get(0),
			f = this.filter;

		p.removeAll(true);
		this.store.each(function(change){
			if(!f || f.test(change)){
				p.add({change: change, xtype: 'streamEntry'});
			}
		});
	}
});
