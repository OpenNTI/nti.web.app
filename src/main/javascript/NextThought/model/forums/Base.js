Ext.define('NextThought.model.forums.Base',{
	extend: 'NextThought.model.Base',

	getParentHref: function(){
		var path = this.get('href');
		path = path.split('/');
		path.pop();
		return path.join('/');
	}
});
