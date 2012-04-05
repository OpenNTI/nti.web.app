Ext.define(	'NextThought.view.whiteboard.shapes.Text', {
	extend:	'NextThought.view.whiteboard.shapes.Base',

	constructor: function(){
		this.calculatedAttributes = ['font-face'];
		return this.callParent(arguments);
	},

	draw: function(ctx){
		this.callParent(arguments);

		if(!this.cache.font){
			this.cache.font = '1px ' + this['font-face'];
		}

		ctx.font = this.cache.font;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';

		var w = ctx.measureText(this.text).width,
			h = 1.3,
			x = -w/2,
			y = -h/2;

		if(ctx.fillStyle)	{	ctx.fillText(  this.text,x,y);	}
		if(ctx.strokeStyle)	{	ctx.strokeText(this.text,x,y);	}

		this.bbox = {
			x: x,	w: w,
			y: y,	h: h
		};

		if(this.selected){
			this.showNibs(ctx);
		}
	},


	changed: function(){
		delete this.cache.font;
		return this.callParent(arguments);
	}

});
