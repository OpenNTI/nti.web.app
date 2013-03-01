Ext.define('NextThought.controller.Profile', {
	extend: 'Ext.app.Controller',

	models: [
		'forums.Post',
		'forums.PersonalBlog',
		'forums.PersonalBlogComment',
		'forums.PersonalBlogEntry',
		'forums.PersonalBlogEntryPost'
	],

	stores: [
		'Blog'
	],

	views: [
		'profiles.Panel',
		'profiles.parts.Activity',
		'profiles.parts.ActivityItem',
		'profiles.parts.Blog',
		'profiles.parts.BlogEditor',
		'profiles.TabPanel'
	],

	refs: [],

	init: function() {

		this.control({
			'profile-panel':{
				'scroll': Ext.Function.createThrottled(this.fillInActivityPanels, 500, this)
			},

			'profile-blog-editor':{
				'save-post': this.saveBlogPost
			}
		},{});
	},


	fillInActivityPanels: function(){
		Ext.each(Ext.ComponentQuery.query('profile-activity-item'), function(item){
			item.maybeFillIn();
		});
	},


	saveBlogPost: function(editorCmp, record, title, tags, body, autoPublish){

		if(!record){
			record = NextThought.model.forums.Post.create();
		}

		record.set({
			'title':title,
			'body':body,
			'tags':tags||[]
		});

		record.save({
			success: function(){console.debug('success',arguments);},
			failure: function(){console.debug('failure',arguments);}
		});
	}

});
