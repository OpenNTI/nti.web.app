Ext.define(	'NextThought.view.whiteboard.shapes.Line', {
	extend:	'NextThought.view.whiteboard.shapes.Base',


	draw: function(ctx){
		var t = this.transform,
			xy = this.getEndPoint();

		this.transform = { 'a':1, 'd':1, 'tx':t.tx, 'ty':t.ty };
		this.callParent(arguments);
		this.transform = t;

		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(xy[0],xy[1]);
		ctx.closePath();

		delete this.fillRGBA;//parent class will attempt to fill if this value exists, lines don't have fills.
		this.bbox = {
			x: 0,	w: 1,
			y: -ctx.lineWidth*3,	h: ctx.lineWidth*6
		};

		this.performFillAndStroke(ctx);
	},


	getEndPoint: function(m){
		m = m || new NTMatrix(this.transform);
		var scale = m.getScale(true),
			rad = -m.getRotation();
		return [
			scale * Math.cos(rad),
			scale * Math.sin(rad)
		];
	},


	isPointInShape: function(){
		var b = this.callParent(arguments);
		console.log('pint in shape?', b);
		return b;
	},


	modify: function(nib,	x1,y1){
		var m = new NTMatrix(this.transform),
			t = m.getTranslation(),
			p = [t[0],t[1]];


		p.push(x1,y1);

		m = new NTMatrix();
		m.translate(t[0],t[1]);
		m.scale(WBUtils.getDistance(p));
		//full range 0-2PI not just -PI/2 - PI/2
		m.rotate(WBUtils.toRadians(WBUtils.getDegrees(p)));

		this.transform = m.toTransform();
	},


	showNibs: function(ctx){

		ctx.save();

		var m = new NTMatrix(this.transform), xy;

		m.scaleAll(ctx.canvas.width);

		ctx.setTransform(1,0,0,1,0,0);



		ctx.lineWidth = 2;
		ctx.beginPath();
		this.drawNib(ctx, 7, 1, 0, m, 'line');

		ctx.closePath();
		ctx.shadowColor = 'None';
		ctx.strokeStyle = '#004CB3';
		ctx.fillStyle = '#8ED6FF';
		ctx.fill();
		ctx.stroke();

		ctx.restore();

	}

});
