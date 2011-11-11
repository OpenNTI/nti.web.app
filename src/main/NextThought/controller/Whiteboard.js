

Ext.define('NextThought.controller.Whiteboard', {
	extend: 'Ext.app.Controller',

	views: [
		'widgets.draw.Whiteboard'
	],

	refs: [
		{ ref: 'whiteboard', selector: 'whiteboard' },
		{ ref: 'strokeWidthField', selector: 'whiteboard toolbar numberfield[name=stroke-width]'},
		{ ref: 'polygonSidesField', selector: 'whiteboard toolbar numberfield[name=sides]'}
	],


	init: function() {


		this.spriteModifier = {
			polygon	: this.modifyPolygon,
			ellipse	: this.modifyEllipse,
			path	: this.modifyPath,
			line	: this.modifyLine,
			text	: null
		};

		this.control({

			'whiteboard button[action=pick-stroke-color] colormenu': { 'select': this.colorChangedStroke },
			'whiteboard button[action=pick-fill-color] colormenu': { 'select': this.colorChangedFill },

			'whiteboard draw':{
				'click': this.surfaceClicked,
				'mousedown': this.surfaceMouseDown,
				'mousemove': this.surfaceMouseMove,
				'mouseup'	: this.surfaceMouseUp
			},

			'whiteboard button[action=delete]':{ 'click': this.removeSelectedSprite },
			'whiteboard button[action=clear]':{ 'click': this.clearWhiteboard },

			'whiteboard': {
				'sprite-click': this.selectSprite,
				'sprite-dblclick': this.editSprite
			}

		},{});
		wb = this;
	},

	test: function(){
		this.showWhiteboardWindow();
		this.win.maximize();
		this.win.down('whiteboard').loadFrom('test.json');
	},

	showWhiteboardWindow: function(){
		if (!this.win)
			this.win = Ext.create('Ext.Window', {
					maximizable:true,
					closeAction: 'hide',
					title: 'Whiteboard Test',
					width: 800, height: 600,
					layout: 'fit',
					items: {xtype: 'whiteboard'}
				});

		this.win.show();
	},


	colorChangedFill: function(picker, color){
		this.getWhiteboard().setColor('fill', color);
	},


	colorChangedStroke: function(picker, color){
		this.getWhiteboard().setColor('stroke', color);
	},

	removeSelectedSprite:function(){ this.getWhiteboard().removeSelection(); },

	clearWhiteboard:function(){ this.getWhiteboard().removeAll(); },


	selectSprite: function(sprite){
		this.getWhiteboard().select(sprite);
	},

	editSprite: function(sprite){
		console.debug('edit',arguments);
	},


	relativizeXY: function(xy){
		this.surfacePosition = this.surfacePosition || this.getWhiteboard().down('draw').getPosition();
		var p = this.surfacePosition;
		xy[0]-=p[0];
		xy[1]-=p[1];
		return xy;
	},

	getActiveTool: function(){
		var t = this.getWhiteboard().down('toolbar button[pressed]');
		if(t){
			t = t.shape;
		}

		return t;
	},

	surfaceClicked: function() {//remove selection
		this.getWhiteboard().select();
	},

	surfaceMouseUp: function(e){
		//finalize shape
		this.surfaceMouseMove(e);

		//clean up
		if(this.sprite){
//			var bb = this.sprite.getBBox();
//			if(!bb.width && !bb.height)this.sprite.destroy();
			delete this.sprite;
		}
		if(this.surfacePosition) delete this.surfacePosition;
	},

	surfaceMouseMove: function(e){
		if(!this.sprite)return;
		var op = this.sprite.initalPoint,
			dt = this.relativizeXY(e.getXY()),
			p = op.concat(dt);

		dt.push(op, length.apply(this,p), degrees.apply(this,p));

		var m = this.spriteModifier[this.sprite.getShape()];
		if(!m){
			return;
		}

		m.apply(this, dt);


		function degrees(x0,y0, x1,y1){
			var dx	= (x1-x0),
				dy	= (y1-y0),
				a	= (dx<0? 180: dy<0? 360: 0);
			return ((180/Math.PI)*Math.atan(dy/dx)) + a;
		}

		function length(x,y,x1,y1){
			return Math.sqrt(Math.pow(x-x1,2)+Math.pow(y-y1,2));
		}
	},

	surfaceMouseDown: function(e){
		var t = this.getActiveTool(),
			xy = this.relativizeXY(e.getXY()),
			sw = this.getStrokeWidthField().getValue(),
			sd = this.getPolygonSidesField().getValue();
		if(t) {
			this.sprite = this.getWhiteboard().addShape(t, xy[0],xy[1], sw, sd);
			this.sprite.initalPoint = xy;
		}
	},


	modifyPolygon: function(x,y,o,m,d){
		this.sprite.setAttributes({ scale: { x: m, y: m }, rotate: { degrees: d } },true);
	},


	modifyPath: function(x,y,o){
		var p = this.sprite.attr.path || [['M', o[0], o[1]]];
		p.push(['S', x,y, x,y]);
		this.sprite.setAttributes({path: p}, true);
	},


	modifyLine: function(x,y,o){
		this.sprite.setAttributes({path: [['M', o[0], o[1]],['L', x, y]]}, true);
	},


	modifyEllipse: function(x,y,o,m,d){
		this.sprite.setAttributes({ scale: { x: m, y: m }},true);
	}

});
