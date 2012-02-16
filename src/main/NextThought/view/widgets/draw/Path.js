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

	toJSON: function(scaleFactor){
		function degrees(x0,y0, x1,y1){
			var dx = (x1-x0),
				dy	= (y1-y0),
				a	= (dx<0? 180: dy<0? 360: 0);
			return ((180/Math.PI)*Math.atan(dy/dx)) + a;
		}

		var i, p, t, x, y, k,
			x0 = 0, y0 = 0,
			path = this.attr.path,
			ntiPathArray,
			currentMatrix = this.matrix ? this.matrix.clone() : undefined,
			newMatrix = Ext.create('Ext.draw.Matrix'),
			affineTransform;

		//make sure scalefactor is valid, if not, set to 1 (no scale)
		if (!scaleFactor){scaleFactor = 1;}

		if (!this.points){
			ntiPathArray = [];
			for (i in path) {
				if (!path.hasOwnProperty(i)){
					p = path[i];
					t = p[0];
					x = p[1];
					y = p[2];

					if (t === 'M'){
						x0 = x;
						y0 = y;
						ntiPathArray.push(0);
						ntiPathArray.push(0);
					}
					else if ((t === 'S' || t ==='L') && x0 && y0){
						x = x - x0;
						y = y - y0;
						ntiPathArray.push(x);
						ntiPathArray.push(y);
					}
					else {
						console.error('Not sure what to do with this part of the path', p);
					}
				}
			}

			//create a matrix with a transform to offset the origin:
			newMatrix.matrix[0][0] *= scaleFactor;
			newMatrix.matrix[1][1] *= scaleFactor;
			newMatrix.matrix[0][2] = x0;
			newMatrix.matrix[1][2] = y0;

			//Now apply the existing transform
			if (currentMatrix) {
				newMatrix.matrix[0][0] += currentMatrix.get(0,0);
				newMatrix.matrix[1][0] += currentMatrix.get(1,0);
				newMatrix.matrix[0][1] += currentMatrix.get(0,1);
				newMatrix.matrix[1][1] += currentMatrix.get(1,1);
				newMatrix.matrix[0][2] += currentMatrix.get(0,2);
				newMatrix.matrix[1][2] += currentMatrix.get(1,2);
			}
		}
		else {
			newMatrix = currentMatrix || newMatrix;
		}

		affineTransform = {
			'Class': 'CanvasAffineTransform',
			a : newMatrix.get(0,0),
			b : newMatrix.get(1,0),
			c : newMatrix.get(0,1),
			d : newMatrix.get(1,1),
			tx: newMatrix.get(0,2),
			ty: newMatrix.get(1,2)
		};

		return Ext.apply(
			{
				'Class': 'CanvasPathShape',
				'transform': Ext.clone(affineTransform),
				'closed': false,
				'points': this.points || ntiPathArray,
				'createdObject': this.createdObject || undefined
			},
			{
				'strokeColor': Color.toRGB(this.stroke),
				'strokeOpacity' : 1, //TODO: once we have tools to adjust this, set
				'fillColor': (this.fill && (typeof this.fill === 'string') && (this.fill === 'None')) ? 'None' : Color.toRGB(this.fill),
				'fillOpacity': 1, //TODO: once we have tools to adjust this, set
				'strokeWidthTarget': this.strokeWidthTarget || this['stroke-width']
			}
		);
	}
});
