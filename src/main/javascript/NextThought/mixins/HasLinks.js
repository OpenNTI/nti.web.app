Ext.define('NextThought.mixins.HasLinks',{

	getLink: function(rel){
		var links = this.get('Links') || Ext.data.Types.LINKS.convert( this.raw.Links || [] ),
			ref = links ? links.getRelHref(rel) : null;
		return ref? getURL(ref) : null;
	}

});
