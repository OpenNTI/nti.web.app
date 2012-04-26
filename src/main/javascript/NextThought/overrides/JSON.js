Ext.define('NextThought.overrides.JSON',{
	override: 'Ext.JSON',
	encodeDate: function(d){return Ext.Date.format(d, 'U');}
});
