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
	}
},
function(){
	window.WhiteboardUtils = this;
}
);
