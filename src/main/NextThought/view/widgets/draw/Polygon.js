Ext.define('NextThought.view.widgets.draw.Polygon', {
	extend: 'NextThought.view.widgets.draw.Shape',
	alias: 'widget.sprite-polygon',

	constructor: function(config){
        this.applyClipRect = true;

		if(!config || !config.sides)
			Ext.Error.raise('must have sides defined & be >2');

		var x = 0,
			y = 0,

			i = 0,
			r = 0.5,
			n = config.sides,
			path = [];

		if(n<2) n=2;

		for (i; i < n; i++) {
			path.push([
				!i ? 'M' : 'L',
				x + r * Math.cos(2 * Math.PI * i / n),
				y + r * Math.sin(2 * Math.PI * i / n)
			]);
		}

		path.push(['Z']);

        this.callParent([Ext.apply(config,{ type: 'path', path: path})]);
	},

	getShape: function(){
		return 'polygon';
	}
});
