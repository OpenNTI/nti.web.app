Ext.define('NextThought.view.content.Pager',{
	extend: 'Ext.container.Container',
	alias: 'widget.content-pager',
	ui: 'content-pager',

	requires: [
		'NextThought.providers.Location'
	],

	layout: {
		type: 'hbox',
		pack: 'end'
	},

	defaults: {
		xtype: 'button',
		iconCls: 'page',
		scale: 'large',
		ui: 'content-button',
		handler: function(btn){ if(btn && btn.ntiid){ LocationProvider.setLocation(btn.ntiid); } }
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
		delete nextBtn.ntiid;
		if(info.next) {
			nextBtn.enable();
			nextBtn.ntiid = info.next;
		}

		prevBtn.disable();
		delete prevBtn.ntiid;
		if(info.previous){
			prevBtn.enable();
			prevBtn.ntiid = info.previous;
		}
	}
});
