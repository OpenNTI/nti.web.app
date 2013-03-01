Ext.define('NextThought.model.forums.PersonalBlogEntry', {
	extend: 'NextThought.model.forums.HeadlineTopic',

	fields: [
		{ name: 'publish-state', convert: function(v,r){
			return r.isPublished() ? 'Published':'Draft';
		} }
	],

	isPublished: function(){
		return Boolean(this.getLink('unpublish'));
	}
});


