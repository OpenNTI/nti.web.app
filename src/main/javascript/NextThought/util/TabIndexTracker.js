Ext.define('NextThought.util.TabIndexTracker',{

	current: 0,


	getNext: function(skip){
		var r = this.current;
		this.current += 1 + (skip||0);
		return r;
	},

	reset: function(seed){
		this.current = (seed||0);
	}
});
