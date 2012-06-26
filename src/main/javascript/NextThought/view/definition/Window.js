Ext.define('NextThought.view.definition.Window', {
	extend: 'NextThought.view.Window',
	alias: 'widget.definition-window',

	cls: 'dictionary-window',
	title: 'Dictionary',
	closeAction: 'destroy',
	width: 310,
	height: 245,
	layout: 'fit',
	modal: true,
	items: {
		xtype: 'component',
		cls: 'definition',
		autoEl: {
			tag: 'iframe',
			//src: url, expected now
			frameBorder: 0,
			marginWidth: 0,
			marginHeight: 0,
			seamless: true,
			transparent: true,
			allowTransparency: true,
			style: 'overflow: hidden'
		},
		xhooks: {

		}
	},

	initComponent: function(){
		this.callParent(arguments);

		if(!this.src){
			Ext.Error.raise('definition source (src) required');
		}


		this.down('[cls=definition]').autoEl.src = this.src;

		//figure out xy
		var p = this.pointTo || {};
		var nib = 20;
		var top = Ext.Element.getViewportHeight() < (p.bottom + this.getHeight() + nib),
			y = Math.round(top ? p.top - nib - this.getHeight() : p.bottom + nib),
			x = Math.round((p.left + (p.width/2)) - (this.getWidth()/2));

		if(this.pointTo){
			this.setPosition(x,y);
			this.addCls(top?'south':'north');
		}
	}
});
