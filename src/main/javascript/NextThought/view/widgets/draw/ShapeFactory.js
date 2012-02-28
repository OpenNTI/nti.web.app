Ext.define('NextThought.view.widgets.draw.ShapeFactory',
{
	alternateClassName: 'ShapeFactory',
	singleton: true,
	requires: [
		'NextThought.view.widgets.draw.Polygon',
		'NextThought.view.widgets.draw.Line',
		'NextThought.view.widgets.draw.Path',
		'NextThought.view.widgets.draw.Ellipse',
		'NextThought.view.widgets.draw.Text',
		'NextThought.util.Color'
	],

	shapeTypeMap: {
		ellipse: 'ellipse',
		line: 'line',
		path: 'path',
		polygon: 'polygon',
		text: 'text'
	},


	toolDefaults: function(shape, x, y, strokeWidth, sides, selectedColor){
		strokeWidth = strokeWidth||2;
		sides = sides || 4;

		var cfg,
			d = {
			circle: {},
			polygon: { sides: sides },
			path: { type: 'path', fill: 'None', fillIfClosed: selectedColor.fill, translate: {} },
			line: { type: 'path', fill: 'None', translate: {}, getShape:function(){return 'line';}},
			text: {
				type: 'text',
				text: 'Place holder text',
				font: '18px Arial'
			}
		};

		cfg = {
			translate: {x:x,y:y},
			'stroke-width': strokeWidth,
			stroke: selectedColor.stroke,
			fill: selectedColor.fill
		};

		return Ext.apply(cfg,d[shape]);
	},


	/**
	 * Scale some JSON according to a scale factor
	 *
	 * @param factor
	 * @param json
	 * @returns modified json, or modifies passed in json if supplied
	 */
	//TODO - if all toJSON methods take scaleFactor like path, then we can probably move transform scaling there and delete this...
	scaleJson: function(factor, json) {
		var k, sw = json.strokeWidthTarget || json.strokeWidth;

		json.strokeWidthTarget = ((typeof sw === 'string') ? parseFloat(sw) : sw) * factor;

		for(k in json.transform){
			if (json.transform.hasOwnProperty(k)){
				if( typeof json.transform[k] === 'number') {
					json.transform[k] *= factor;
				}
			}
		}

		//Scale points array, only scale down, points are not allowed to change once they are unitized
		if (json.points && json.createdObject) {
			for (k in json.points) {
				if(json.points.hasOwnProperty(k)) {
					json.points[k] *= factor;
				}
			}
			delete json.path;
		}
		delete json.createdObject;
/*
		//adjust transform if necessary
		//TODO - really this needs to happen the first time only. because the adjusted matrix is set correctly by the canvas.
		// however, really, probably, we need to do it every time and unadjust it on save to make it right for the pad.
		// this is a hack, BBox wouldn't work for me.
		if (factor > 1){
			//TODO - testing
			var modX, modY, i, maxX = 0, minX = 0, minY = 0, maxY = 0;
			if (json.points) {
				for (i = 0; i < json.points.length; i+=2) {
					var x = json.points[i] * factor;
					var y = json.points[i+1] * factor;
					if (x > maxX) maxX = x;
					if (x < minX) minX = x;
					if (y > maxY) maxY = y;
					if (y < minY) minY = y;
				}
				modX = (maxX - minX) / 2;
				modY = (maxY - minY) / 2;
				//json.transform.tx += modX;
				//json.transform.ty += modY;
			}

		}
*/

		return json;
	},

	getSpriteClass: function(c, sides)
	{
		var m = {
			'CanvasPolygonShape': 'sprite-polygon',
			'CanvasCircleShape': 'sprite-ellipse',
			'CanvasTextShape': 'sprite-text',
			'CanvasPathShape': 'sprite-path'
		},
			s = m[c];

		//special case for lines
		if (s === m.CanvasPolygonShape && sides === 1){
			return 'sprite-line';
		}
		return s;
	},


	restoreShape: function m(whiteboard, shape, scaleFactor){
		var t = shape.transform,
			fc = (shape.fillColor && shape.fillColor === 'None')
				? shape.fillColor
				: Color.parseColor(shape.fillColor,shape.fillOpacity) || Color.getColor(m.i=(m.i||-1)+1),
			p = Color.parseColor(shape.strokeColor) || c.getDarker(0.2),
			s, centerScaleX, centerScaleY;

		if(shape.Class === 'CanvasPathShape'){
			centerScaleX = centerScaleY = 0;
		}
		//scale up the matrix
		this.scaleJson(scaleFactor, shape);
		t = Ext.create('Ext.draw.Matrix',t.a,t.b,t.c,t.d,t.tx,t.ty).split();
		s = Ext.widget(this.getSpriteClass(shape.Class, shape.sides),{
			sides: shape.sides,
			'stroke-width': shape.strokeWidthTarget,
			text: shape.text,
			points: shape.points,
			closed: shape.closed,
			stroke: p.toString(),
			fill: fc.toString(),

			translate: {
				x: t.translateX,
				y: t.translateY
			},
			scale:{
				x: t.scaleX,
				y: t.scaleY,
				centerX: centerScaleX,
				centerY: centerScaleY
			},
			rotate: {
				degrees: Ext.draw.Draw.degrees(t.rotate)
			}
		});

		s.whiteboardRef = whiteboard;
		this.relay(whiteboard, s, ['click','dblClick']);

		return s;
	},


	createShape: function(whiteboard, shapeName, x, y, sides, selectedColors, strokeWidth) {
		var sp = Ext.widget('sprite-'+this.shapeTypeMap[shapeName],
				this.toolDefaults(shapeName, x, y, strokeWidth, sides, selectedColors));
		sp.whiteboardRef = whiteboard;
		sp.createdObject = true;
		this.relay(whiteboard, sp, ['click','dblClick']);
		return sp;
	},


	relay: function(whiteboard, sprite, events){
		var i;
		if (!sprite.el) {
			sprite.on('render', Ext.bind(this.relay, this, Ext.toArray(arguments)), {single: true});
			return;
		}

		function refire(sp,event){
			sp.el.on(event, function(e){
				e.stopPropagation();
				e.preventDefault();
				whiteboard.fireEvent('sprite-'+event, sp, whiteboard);
			});
		}

		for(i=events.length;i>=0; i--){
			refire(sprite,events[i]);
		}
	}

},
function(){
	window.ShapeFactory = this;

	//Fix Sprite dragging for ExtJS 4.0.7
	/*
	Ext.draw.SpriteDD.override({
		getRegion: function() {
			var r, s = this.sprite,
				bbox, x1,y1,x2,y2, p;

			try{
				r = this.callOverridden(arguments);
				if(r && !isNaN(r.x) && isFinite(r.x)){
					//console.warn('SpriteDD.getRegion() override unnecessary?', r);
					return r;
				}
			}
			catch(e){
				//ignore... perform override
			}

			bbox = s.getBBox();
			p = s.surface.getRegion();
			x1 = bbox.x + p.left;
			y1 = bbox.y + p.top;
			x2 = x1 + bbox.width;
			y2 = y1 + bbox.height;
			return Ext.create('Ext.util.Region', y1, x2, y2, x1);
		}
	});
	*/
});
