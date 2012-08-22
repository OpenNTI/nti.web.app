Ext.define('NextThought.view.whiteboard.Utils',{
	alternateClassName:'WBUtils',
	singleton: true,


	getSlope: function(x0,y0, x1,y1){
		if(Ext.isArray(x0)){
			y1 = x0[3];
			x1 = x0[2];
			y0 = x0[1];
			x0 = x0[0];
		}
		return (y1-y0) / (x1-x0);
	},


	getAngle: function (x0,y0, x1,y1){
		if(Ext.isArray(x0)){
			y1 = x0[3];
			x1 = x0[2];
			y0 = x0[1];
			x0 = x0[0];
		}

		var dx	= x1-x0,
			dy	= y1-y0;
			//a	= dx<0? Math.PI: dy<0? (Math.PI*2): 0;
		return Math.atan(dy/dx);// + a;
	},


	getDegrees: function(x0,y0, x1,y1){
		if(Ext.isArray(x0)){
			y1 = x0[3];
			x1 = x0[2];
			y0 = x0[1];
			x0 = x0[0];
		}
		var dx	= x1-x0,
			dy	= y1-y0,
			a	= dx<0? 180: dy<0? 360: 0,
			rad = Math.atan(dy/dx);

		return ((180/Math.PI)*rad) + a;
	},


	toRadians: function(degrees){
		return (degrees % 360) * (Math.PI/180);
	},


	getDistance: function(x1, y1, x2, y2) {
		if(Ext.isArray(x1)){
			y2 = x1[3];
			x2 = x1[2];
			y1 = x1[1];
			x1 = x1[0];
		}
		var dx = x2 - x1,
			dy = y2 - y1;
		return Math.sqrt(dx*dx + dy*dy);
	}

},function(){
	this.WBUtils = this;
});
