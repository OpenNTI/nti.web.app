Ext.define('NextThought.view.content.Pager',{
	extend: 'Ext.container.Container',
	alias: 'widget.content-pager',
	ui: 'content-pager',

	requires: [
		'NextThought.providers.Location'
	],

	layout: {
		type: 'hbox'
	},

	defaults: {
		xtype: 'button',
		iconCls: 'page',
		scale: 'large',
		ui: 'content-pager',
		handler: function(btn){ LocationProvider.setLocation(btn?btn.ntiid:null); }
	},

	items: [
		{ cls: 'prev' },
		{ cls: 'next' }
	],

	initComponent: function(){
		this.callParent(arguments);
		LocationProvider.on('change', this.updateState, this);
	},

	updateState: function(ntiid){
		var info = LocationProvider.getNavigationInfo(ntiid),
			nextBtn = this.down('[cls=next]'),
			prevBtn = this.down('[cls=prev]');

		nextBtn.disable();
		if(info.hasNext) {
			nextBtn.enable();
			nextBtn.ntiid = info.nextRef;
		}

		prevBtn.disable();
		if(info.hasPrevious){
			prevBtn.enable();
			prevBtn.ntiid = info.previousRef;
		}
	}
});
