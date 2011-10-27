

Ext.define('NextThought.controller.Whiteboard', {
	extend: 'Ext.app.Controller',

	views: [
		'widgets.draw.Whiteboard'
	],

	refs: [
		{ ref: 'whiteboard', selector: 'whiteboard' },
		{ ref: 'colorPicker', selector: 'whiteboard toolbar button[action=pick-color]'}
	],


	windowConfig: {
		maximizable:true,
		closeAction: 'hide',
		title: 'Whiteboard Test',
		width: 800, height: 600,
		layout: 'fit',
		items: {xtype: 'whiteboard'}
	},


	init: function() {

		this.spriteModifier = {
			rect	: this.modifyRect,
			path	: this.modifyPath,
			line	: this.modifyLine,
			text	: this.modifyText,
			circle	: this.modifyCircle
		};

		this.control({
			'leftColumn button[showWB]': {
				'click': function(btn, e, o) {
					if (!this.win)
						this.win = Ext.create('Ext.Window', this.windowConfig);
					this.win.show();
					this.colorChanged(null, '000000');
				}
			},

			'whiteboard toolbar button[action=pick-color]': {
				'click': this.pickColorClicked
			},

			'whiteboard draw':{
				'click': function() {this.getWhiteboard().select();},
				'mousedown': this.surfaceMouseDown,
				'mousemove': this.surfaceMouseMove,
				'mouseup'	: this.surfaceMouseUp
			},

			'whiteboard': {
				'sprite-click': this.selectSprite,
				'sprite-dblclick': this.editSprite
			}
		});
	},

	pickColorClicked: function(btn){
		this.picker = this.picker || Ext.create('Ext.menu.ColorPicker',
				{listeners: {scope: this, select: this.colorChanged}});

		this.picker.showBy(btn);
	},


	colorChanged: function(picker, color){
		this.selectedColor = '#'+color;
		this.getColorPicker().getEl().down('.x-btn-icon').setStyle({background: this.selectedColor});
	},



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

	surfaceMouseUp: function(e){
		//finalize shape
		this.surfaceMouseMove(e);

		//clean up
		if(this.sprite){
			var bb = this.sprite.getBBox();
			if(!bb.width && !bb.height)this.sprite.destroy();
			delete this.sprite;
		}
		if(this.surfacePosition) delete this.surfacePosition;
	},

	surfaceMouseMove: function(e){
		if(!this.sprite)return;
		var dt = this.relativizeXY(e.getXY());
		dt.push(this.sprite.initalPoint);

		var m = this.spriteModifier[this.sprite.type];

		if(!m){
			return;
		}


		m.call(this, dt);
	},

	surfaceMouseDown: function(e){
		var t = this.getActiveTool(),
				xy = this.relativizeXY(e.getXY());
		if(t) {
			this.sprite = this.getWhiteboard().addShape(t, xy[0],xy[1],this.selectedColor);
			this.sprite.initalPoint = xy;
		}
	},


	modifyRect: function(dt){
		var w = width.apply(this,dt),
			h = height.apply(this,dt),
			o = dt[2],
			ox = o[0],
			oy = o[1];

		this.sprite.setAttributes({
			width: Math.abs(w),
			height: Math.abs(h),
			x: w<0 ? ox+w : ox,
			y: h<0 ? oy+h : oy
		},true);

		function width(x,y,o){
			return x - o[0];
		}
		function height(x,y,o){
			return y - o[1];
		}
	},


	modifyPath: function(dt){

		var p = this.sprite.attr.path || [['M', dt[2][0], dt[2][1]]];

		p.push(['L', dt[0], dt[1]]);

		this.sprite.setAttributes({path: p}, true);

	},


	modifyLine: function(dt){
		var p = [['M', dt[2][0], dt[2][1]]];

		p.push(['M', dt[0], dt[1]]);
		p.push(['Z']);

		this.sprite.setAttributes({path: p}, true);
	},


	modifyText: function(dt){},


	modifyCircle: function(dt){

		this.sprite.setAttributes({radius: len.apply(this, dt)},true);

		function len(x,y,o){
			return Math.sqrt((x -= o[0]) * x + (y -= o[1]) * y);
		}
	}

});
