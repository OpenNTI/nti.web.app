Ext.define('NextThought.overrides.JSON',{
	override: 'Ext.JSON',
	encodeDate: function(d){
		var t = d.getTime();
		console.log('time in', t, 'time out', t/1000);
		return t/1000;
		//return Ext.Date.format(d, 'U');
	}
});
