Ext.define('NextThought.view.widgets.draw.Path', {
	extend: 'NextThought.view.widgets.draw.Shape',
	alias: 'widget.sprite-path',

	constructor: function(config){
		//fix path because it'll be NTI format
		/*
		[
			['L', 1, 2]
			...
			['L', N, Y]
		]
		*/

		this.callParent([Ext.apply(config,{ type: 'path'})]);
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
			mx = 0, my = 0,
			x0 = 0, y0 = 0,
			path = this.attr.path,
			ntiPathArray = [];

		for (i in path) {
			if (!path.hasOwnProperty(i)){continue;}
			p = path[i];
			t = p[0];
			x = p[1];
			y = p[2];

			if (t === 'M'){
				x0 = x;
				y0 = y;
			}
			else if (t === 'S' && x0 && y0){
				ntiPathArray.push(x - x0);
				ntiPathArray.push(y - y0);
				//remember max
				if (x > mx){mx = x;}
				if (y > my){my = y;}
			}
			else {
				console.error('Not sure what to do with this part of the path', p);
			}
		}

		var //a = degrees(c.x0, c.y0, c.x1, c.y1),
			m = this.matrix.clone(),
			matrix;

		//apply rotation and scaling back into transform:
		m.translate(ntiPathArray[0], ntiPathArray[1]);
		//m.rotate(a, 0, 0);
		m.scale(mx, my, 0, 0);

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
				'path': ntiPathArray
			},
			{
				'strokeColor': Color.toRGB(this.stroke),
				'strokeOpacity' : 1, //TODO: once we have tools to adjust this, set
				'fillColor': Color.toRGB(this.fill),
				'fillOpacity': 1, //TODO: once we have tools to adjust this, set
				'strokeWidthTarget': this['stroke-width']
			}
		);
	}

});
