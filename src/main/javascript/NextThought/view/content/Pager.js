Ext.define('NextThought.view.content.Pager',{
	extend: 'Ext.container.Container',
	alias: 'widget.content-pager',
	ui: 'content-pager',
//TODO: refactor this into a simple component. A custom container w/ two buttons is overkill.

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

	hideControls: function(){ this.el.hide(); },
	showControls: function(){ this.el.show(); },

	initComponent: function(){
		this.callParent(arguments);
	},

	updateState: function(ntiid){
		var info = LocationProvider.getNavigationInfo(ntiid),
			nextBtn = this.down('[cls=next]'),
			prevBtn = this.down('[cls=prev]'),
			nextTitle = LocationProvider.findTitle(info.next, null),
			prevTitle = LocationProvider.findTitle(info.previous, null);


		if(nextTitle){
			nextBtn.btnEl.dom.setAttribute('title', 'Go forward to "' + nextTitle +'"');
		}
		else{
			nextBtn.btnEl.dom.removeAttribute('title');
		}

		if(prevTitle){
			prevBtn.btnEl.dom.setAttribute('title', 'Go back to "' + prevTitle + '"' );
		}
		else{
			prevBtn.btnEl.dom.removeAttribute('title');
		}

		if(info.next) {
			nextBtn.enable();
			nextBtn.ntiid = info.next;
		}
		else{
			nextBtn.disable();
			delete nextBtn.ntiid;
		}


		if(info.previous){
			prevBtn.enable();
			prevBtn.ntiid = info.previous;
		}
		else{
			prevBtn.disable();
			delete prevBtn.ntiid;
		}
	}
});
