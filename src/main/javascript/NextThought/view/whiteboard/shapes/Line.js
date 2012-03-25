Ext.define(	'NextThought.view.whiteboard.shapes.Line', {
	extend:	'NextThought.view.whiteboard.shapes.Base',


	draw: function(ctx){
		var m = new NTMatrix(this.transform),
			t = this.transform,
			scale = m.getScale(true),
			rad = m.getRotation(),
			txy = m.getTranslation(),
			x = scale * Math.cos(rad),
			y = scale * Math.sin(rad);

		this.transform = { 'a':1, 'd':1, 'tx':txy[0], 'ty':txy[1] };
		this.callParent(arguments);
		this.transform = t;

		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(x,y);
		ctx.closePath();

		delete this.fillRGBA;//parent class will attempt to fill if this value exists, lines don't have fills.
		this.bbox = {
			x: 0,	w: 1,
			y: -ctx.lineWidth/2,	h: ctx.lineWidth
		};

		this.performFillAndStroke(ctx);
	}
});
