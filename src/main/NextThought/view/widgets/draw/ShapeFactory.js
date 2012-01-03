Ext.define('NextThought.view.widgets.draw.ShapeFactory',
{
	alternateClassName: 'ShapeFactory',
	singleton: true,
	requires: [
		'NextThought.view.widgets.draw.Polygon',
		'NextThought.view.widgets.draw.Line',
		'NextThought.view.widgets.draw.Ellipse',
		'NextThought.util.Color'
	],

	shapeTypeMap: {
		ellipse: 'ellipse',
		line: 'line',
		path: 'base',
		polygon: 'polygon',
		text: 'base'
	},

	strokeScalingRequired: function(j){
		//right now, only need to scale strokes for lines, which is a poly with 1 side
		return (j.Class === 'CanvasPolygonShape' && j.sides ===1);
	},

	toolDefaults: function(shape, x, y, strokeWidth, sides, selectedColor){
		strokeWidth = strokeWidth||2;
		sides = sides || 4;

		var cfg,
			d = {
			circle: {},
			polygon: { sides: sides },
			path: { type: 'path', fill: '#000000', translate: {} },
			line: { type: 'path', fill: '#000000', translate: {}, getShape:function(){return 'line';}},
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
	scaleJson: function(factor, json) {
		var k;

		if (this.strokeScalingRequired(json)) {
			json.strokeWidth = parseFloat(json.strokeWidth) * factor;
		}

		for(k in json.transform){
			if(!json.transform.hasOwnProperty(k))continue;
			if(typeof json.transform[k] === 'number')
				json.transform[k] *= factor;
		}

		return json;
	},

	getSpriteClass: function(c, sides)
	{
		var m = {
			'CanvasPolygonShape': 'sprite-polygon',
			'CanvasCircleShape': 'sprite-ellipse'
		},
			s = m[c];

		//special case for lines
		if (s == m.CanvasPolygonShape && sides == 1)
			return 'sprite-line';
		return s;
	},

	//TODO : opacity for fill and stroke are available, hook them up.
	restoreShape: function m(whiteboard, shape, scaleFactor){
		var t = shape.transform,
			c = Color.parseColor(shape.fillColor,shape.fillOpacity) || Color.getColor(m.i=(m.i||-1)+1),
			p = Color.parseColor(shape.strokeColor) || c.getDarker(0.2),
			s;

		//scale up the matrix
		this.scaleJson(scaleFactor, shape);

		t = Ext.create('Ext.draw.Matrix',t.a,t.b,t.c,t.d,t.tx,t.ty).split();

		s = Ext.widget(this.getSpriteClass(shape.Class, shape.sides),{
			sides: shape.sides,
			//CMU: The scaling of the stroke is all messed up still.
			//Hardcode a stroke width that looks ok on the browser...
			'stroke-width': 0.005,//parseFloat(shape.strokeWidth),
			stroke: p.toString(),
			fill: c.toString(),
			translate: {
				x: t.translateX,
				y: t.translateY
			},
			scale:{
				x: t.scaleX,
				y: t.scaleY
			},
			rotate: {
				degrees: Ext.draw.Draw.degrees(t.rotate)
			}
		});

		this.relay(whiteboard, s, ['click','dblClick']);

		return s;
	},


	createShape: function(whiteboard, shapeName, x, y, sides, selectedColors, strokeWidth) {
		var sp = Ext.widget('sprite-'+this.shapeTypeMap[shapeName],
				this.toolDefaults(shapeName, x, y, strokeWidth, sides, selectedColors));
		sp.whiteboardRef = whiteboard;
		this.relay(whiteboard, sp, ['click','dblClick']);
		return sp;
	},


	relay: function(whiteboard, sprite, events){
		if (!sprite.el) {
			sprite.on('render', Ext.bind(this.relay, this, Ext.toArray(arguments)), {single: true});
			return;
		}

		function refire(sp,event){
			console.log(sp, event);
			sp.el.on(event, function(e){
				console.log('relayed',event, sp, whiteboard);
				e.stopPropagation();
				e.preventDefault();
				whiteboard.fireEvent('sprite-'+event, sp, whiteboard);
			});
		}

		for(var i=events.length;i<=0; i--){
			refire(sprite,events[i]);
		}
	}

},
function(){
	window.ShapeFactory = this;

	//Fix Sprite dragging for ExtJS 4.0.7
	Ext.draw.SpriteDD.override({
		getRegion: function() {
			var r = this.callOverridden(arguments),
				s = this.sprite,
				bbox = s.getBBox(),
				x1,y1,x2,y2,
				p;

			if(!isNaN(r.x)){
				console.error('SpriteDD.getRegion() override unnecessary');
				return r;
			}

			p = s.surface.getRegion();
			x1 = bbox.x + p.left;
			y1 = bbox.y + p.top;
			x2 = x1 + bbox.width;
			y2 = y1 + bbox.height;
			return Ext.create('Ext.util.Region', y1, x2, y2, x1);
		}
	});
});
