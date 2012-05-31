Ext.define('NextThought.overrides.JSON',{
	override: 'Ext.JSON',
	encodeDate: function(d){
		var t = d.getTime();
		return t/1000;
		//return Ext.Date.format(d, 'U');
	}
});
