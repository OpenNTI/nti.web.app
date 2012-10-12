/**
 * based on: http://jsfiddle.net/DRf9P/
 */
Ext.define('NextThought.view.whiteboard.Matrix', {
	alternateClassName: 'NTMatrix',

	constructor: function(transform) {
		var t = transform || {};
		this.m = [
			typeof t.a === 'number'? t.a : 1, //m11
			t.b || 0, //m12
			t.c || 0, //m21
			typeof t.d === 'number'? t.d : 1, //m22
			t.tx || 0,//dx
			t.ty || 0 //dy
		];
	},

	reset: function() {
		this.m = [1,0,0,1,0,0];
	},


	multiply: function(matrix) {
		var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1],
			m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1],

			m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3],
			m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3],

			dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4],
			dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];

		this.m[0] = m11;
		this.m[1] = m12;
		this.m[2] = m21;
		this.m[3] = m22;
		this.m[4] = dx;
		this.m[5] = dy;
	},


	rotate: function(rad) {
		var c = Math.cos(rad),
			s = Math.sin(rad);

		this.multiply({m:[c,s,-s,c,0,0]});
	},


	translate: function(x, y) {
		this.multiply({m:[1,0,0,1,x,y]});
	},


	scale: function(sx, sy) {
		if(sy===undefined){ sy = sx; }
		this.multiply({m:[sx,0,0,sy,0,0]});
	},


	scaleAll: function(scale){
		var i= this.m.length-1;
		for(; i>=0; i--){
			this.m[i] *= scale;
		}
	},


	/**
	 *
	 * @param [averaged]
	 */
	getScale: function(averaged){
		var m = this.m,
			a = m[0], b = m[1],
			c = m[2], d = m[3],
			sx= Math.sqrt(a*a + b*b) * (a<0? -1 : 1),
			sy= Math.sqrt(c*c + d*d) * (d<0? -1 : 1);

		return averaged? (sx+sy)/2 : [sx,sy];
	},


	getRotation: function(){
		var m = this.m, a = m[0], b = m[1];
//			c = m[2], d = m[3];

		return Math.atan( -b/a );
	},



	getTranslation: function(){
		return [this.m[4], this.m[5]];
	},


	/**
	 *
	 * @param px
	 * @param [py]
	 */
	transformPoint: function(px, py) {
		if(Ext.isArray(px)){
			py = px[1];
			px = px[0];
		}
		return [
			px * this.m[0] + py * this.m[2] + this.m[4],	//x
			px * this.m[1] + py * this.m[3] + this.m[5]		//y
		];
	},


	toTransform: function(){
		var i = this.m.length-1;
		for(;i>=0;i--){ if(isNaN(this.m[i])){ throw "NaN in matrix at index: "+i; } }

		return {
			'Class':'CanvasAffineTransform',
			'a': this.m[0],
			'b': this.m[1],
			'c': this.m[2],
			'd': this.m[3],
			'tx': this.m[4],
			'ty': this.m[5]
		};
	}
},function(){
	window.NTMatrix = this;
});

