Ext.define('NextThought.view.widgets.draw.Path', {
	extend: 'NextThought.view.widgets.draw.Shape',
	alias: 'widget.sprite-path',

	constructor: function(config){
		//fix path because it'll be NTI format
		var p = config.points;

		if (p){
			var i, newPath = [];
			for (i = 0; i < p.length; i+=2){
				newPath.push([newPath.length ? 'L' : 'M',p[i], p[i+1]]);
			}
			config.path = newPath;
		}

		this.callParent([Ext.apply(config,{ type: 'path'})]);

		this.setAttributes({'stroke-width': config['stroke-width']});
	},

	getShape: function(){
		return 'path';
	},

	toJSON: function(){
		function degrees(x0,y0, x1,y1){
			var dx = (x1-x0),
				dy	= (y1-y0),
				a	= (dx<0? 180: dy<0? 360: 0);
			return ((180/Math.PI)*Math.atan(dy/dx)) + a;
		}

		var i, p, t, x, y,
			w = this.getBBox().width,
			x0 = 0, y0 = 0,
			path = this.attr.path,
			ntiPathArray;

		if (!this.points){
			ntiPathArray = [];
			for (i in path) {
				if (path.hasOwnProperty(i)){
					p = path[i];
					t = p[0];
					x = p[1];
					y = p[2];
					ntiPathArray.push(x);
					ntiPathArray.push(y);
				}
			}
		}

		var m = this.matrix.clone(),
			matrix;

		matrix = {
			'Class': 'CanvasAffineTransform',
			a : m.get(0,0),
			b : m.get(1,0),
			c : m.get(0,1),
			d : m.get(1,1),
			tx: m.get(0,2),
			ty: m.get(1,2)
		};

		return Ext.apply(
			{
				'Class': 'CanvasPathShape',
				'transform': Ext.clone(matrix),
				'closed': false,
				'points': this.points || ntiPathArray
			},
			{
				'strokeColor': Color.toRGB(this.stroke),
				'strokeOpacity' : 1, //TODO: once we have tools to adjust this, set
				'fillColor': (this.fill && (typeof this.fill === 'string') && (this.fill === 'None')) ? 'None' : Color.toRGB(this.fill),
				'fillOpacity': 1, //TODO: once we have tools to adjust this, set
				'strokeWidthTarget': this['stroke-width']
			}
		);
	}

});
