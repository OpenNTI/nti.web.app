Ext.define('NextThought.util.WhiteboardUtils', {
	alternateClassName: 'WhiteboardUtils',
	singleton: true,
	requires: [

	],

	DEFAULT_CLOSE_DISTANCE: 20,

	shouldClosePathBetweenPoint: function(x1, y1, x2, y2) {
	    //Get the distance between the two points:
	    var dist = WhiteboardUtils.getDistanceBetweenTwoPoints(x1,y1,x2,y2);
	    return (dist < WhiteboardUtils.DEFAULT_CLOSE_DISTANCE);
	},

	getDistanceBetweenTwoPoints: function(x1, y1, x2, y2) {
		var dx = x2 - x1,
			dy = y2 - y1;

		return Math.sqrt(dx*dx + dy*dy);
	},

	degreesToRadians: function(degrees) {
		return degrees * (Math.PI/180);
	},

	getTransform: function(m, sprite) {
		var sTrans = sprite.attr.translation,
			sRot = sprite.attr.rotation,
			sScale = sprite.attr.scaling,
			rad, cos, sin;

		//console.log('Current sprite transformation vals: translation', sTrans, 'rotation', sRot, 'scale', sScale, 'starting matrix', m);

		//translate
		m.matrix[0][2] += sTrans.x || 0;
		m.matrix[1][2] += sTrans.y || 0;

		//the hard stuff: rotation
		if (sRot.degrees) {
			rad = WhiteboardUtils.degreesToRadians(sRot.degrees || 0);
			cos = Math.cos(rad);
			sin = Math.sin(rad);
			m.matrix[0][0] = (cos * m.matrix[0][0])+(m.matrix[0][1] * sin);
			m.matrix[0][1] = (-sin * m.matrix[0][0])+(m.matrix[0][1] * cos);
			m.matrix[1][0] = (cos * m.matrix[1][0])+(m.matrix[1][1] * sin);
			m.matrix[1][1] = (-sin * m.matrix[1][0])+(m.matrix[1][1] * cos);
		}
		//scale
		m.matrix[0][0] += sScale.x || 0;
		m.matrix[1][1] += sScale.y || 0;
		return m;
	}

},
function(){
	window.WhiteboardUtils = this;
}
);
