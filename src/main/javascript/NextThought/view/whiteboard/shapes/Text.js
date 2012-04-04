Ext.define(	'NextThought.view.whiteboard.shapes.Text', {
	extend:	'NextThought.view.whiteboard.shapes.Base',

	draw: function(ctx){
		this.callParent(arguments);

		ctx.font= this.font || (this.font = '1px ' + this['font-face']);
//		ctx.fontAlign = 'center';
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
		delete this.font;
		return this.callParent(arguments);
	}

});
