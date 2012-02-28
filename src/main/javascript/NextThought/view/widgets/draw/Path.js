Ext.define('NextThought.view.widgets.draw.Path', {
	extend: 'NextThought.view.widgets.draw.Shape',
	alias: 'widget.sprite-path',

	requires: [
		'NextThought.util.WhiteboardUtils'
	],

	constructor: function(config){
		//fix path because it'll be NTI format
		var p = config.points;

		if (p){
			var i, newPath = [];
			for (i = 0; i < p.length; i+=2){
				newPath.push([newPath.length ? 'L' : 'M',p[i], p[i+1]]);
			}
			//if the path is closed, make sure that gets set on path
			if (config.closed) {
				newPath.push(['Z']);
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
		var i, p, t, x, y, k,
			x0 = 0, y0 = 0,
			path = this.attr.path,
			ntiPathArray,
			currentMatrix = this.matrix ? this.matrix.clone() : undefined,
			newMatrix = Ext.create('Ext.draw.Matrix'),
			affineTransform,
			closed = false,
			c;

		//make sure scalefactor is valid, if not, set to 1 (no scale)
		if (!scaleFactor){scaleFactor = 1;}

		if (!this.points){
			ntiPathArray = [];
			for (i in path) {
				if (path.hasOwnProperty(i)){
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
					else if (t.toLowerCase() === 'z') {
						closed = true;
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

			newMatrix = WhiteboardUtils.getTransform(newMatrix, this);
		}
		else {
			newMatrix = currentMatrix || newMatrix;
			newMatrix.matrix[0][2] = this.attr.translation.x;
			newMatrix.matrix[1][2] = this.attr.translation.y;
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

		//verify closed status:
		c = this.points || ntiPathArray;
		closed = WhiteboardUtils.shouldClosePathBetweenPoint(
			c[0], c[1],
			c[c.length - 2], c.last());

		return Ext.apply(
			{
				'Class': 'CanvasPathShape',
				'transform': Ext.clone(affineTransform),
				'closed': closed,// || WhiteboardUtils.shouldClosePathBetweenPoint(this.points[0], this.points[1], this.points[this.points.length - 2], this.points.last()),
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
