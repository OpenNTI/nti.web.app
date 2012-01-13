

Ext.define('NextThought.controller.Whiteboard', {
	extend: 'Ext.app.Controller',

	views: [
		'widgets.draw.Whiteboard'
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

			'whiteboard toolbar numberfield[name=stroke-width]': {
				'change': this.strokeWidthChanged
			},

			'whiteboard': {
				'sprite-click': this.selectSprite,
				'sprite-dblclick': this.editSprite
			}

		},{});
	},

	test: function(){
		this.showWhiteboardWindow();
		this.win.maximize();
		this.win.down('whiteboard').loadFrom('test.json');
	},


	getWhiteboardFrom: function(event) {
		return Ext.getCmp(event.getTarget('div.whiteboard', null, true).id);
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
		picker.up('menu[floatParent]').floatParent.whiteboardRef.setColor('fill', color);
	},


	colorChangedStroke: function(picker, color){
		picker.up('menu[floatParent]').floatParent.whiteboardRef.setColor('stroke', color);
	},


	strokeWidthChanged: function(ctrl,n){
		var ref = ctrl.whiteboardRef,
			sel = ref.getSelected(),
			oldTarget,
			oldActual,a;
		if(!sel) return;

		oldTarget = sel.strokeWidthTarget;
		oldActual = sel.attr['stroke-width'];

		sel.strokeWidthTarget = n;

		a = n/(oldTarget/oldActual);//scale down the new stroke to the same scale as the old

		sel.setAttributes({
			'stroke-width': a
		},true);
	},


	removeSelectedSprite:function(btn){
		btn.whiteboardRef.removeSelection();
	},


	clearWhiteboard:function(btn){
		btn.whiteboardRef.removeAll();
	},


	selectSprite: function(sprite, wb){
		wb.select(sprite);
	},


	editSprite: function(sprite){
		console.debug('edit',arguments);
	},


	getActiveTool: function(wb){
		var t = wb.down('toolbar button[pressed]');
		if(t){
			t = t.shape;
		}

		return t;
	},

	surfaceClicked: function(e) {//remove selection

		this.getWhiteboardFrom(e).select();
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

		var wb = this.getWhiteboardFrom(e),
			op = this.sprite.initalPoint,
			dt = wb.relativizeXY(e.getXY()),
			sw = this.sprite['stroke-width'],
			p = op.concat(dt),
			m;

		dt.push(op, length.apply(this,p), degrees.apply(this,p), sw);

		m = this.spriteModifier[this.sprite.getShape()];
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
		var wb = this.getWhiteboardFrom(e),
			t = this.getActiveTool(wb),
			xy = wb.relativizeXY(e.getXY()),
			sw = wb.down('numberfield[name=stroke-width]').getValue(),
			sd = wb.down('numberfield[name=sides]').getValue();

		if(t) {
			this.sprite = wb.addShape(t, xy[0],xy[1], sw, sd);
			this.sprite.initalPoint = xy;
		}
	},


	modifyPolygon: function(x,y,o,m,d,sw){
		var ssw = sw / m;
		this.sprite.setAttributes({'stroke-width': ssw, scale: { x: m, y: m }, rotate: { degrees: d } },true);
	},


	modifyPath: function(x,y,o, m, d, sw){
		var p = this.sprite.attr.path || [['M', o[0], o[1]]];
		p.push(['S', x,y, x,y]);
		this.sprite.setAttributes({path: p}, true);
	},


	modifyLine: function(x,y,o, m, s, sw){
		this.sprite.setAttributes({path: [['M', o[0], o[1]],['L', x, y]]}, true);
	},


	modifyEllipse: function(x,y,o,m, d, sw){
		var ssw = sw / m;
		this.sprite.setAttributes({ 'stroke-width': ssw, scale: { x: m, y: m }},true);
	}

});
