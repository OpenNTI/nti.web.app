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

			//bubbled events don't get caught by the controller on bubbleTargets... so listen directly on what is firing
			'profile-blog-post':{ 'delete-post': this.deleteBlogPost },
			'profile-blog-list-item':{ 'delete-post': this.deleteBlogPost },

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

		var isEdit = Boolean(record),
			post = isEdit ? record.get('headline') : NextThought.model.forums.Post.create();

		post.set({
			'title':title,
			'body':body,
			'tags':tags||[]
		});

		function finish(entry){
			var blogCmp = editorCmp.up('profile-blog');
			if(!isEdit){
				blogCmp.store.insert(0,entry);
			}

			Ext.callback(editorCmp.onSaveSuccess,editorCmp,[]);
		}

		post.save({
			scope: this,
			success: function(post,operation){
				//the first argument is the record...problem is, it was a post, and the response from the server is
				// a PersonalBlogEntry. All fine, except instead of parsing the response as a new record and passing
				// here, it just updates the existing record with the "updated" fields. ..we normally want this, so this
				// one off re-parse of the responseText is necissary to get at what we want.
				// HOWEVER, if we are editing an existing one... we get back what we send (type wise)

				var blogEntry = isEdit? record : ParseUtils.parseItems(operation.response.responseText)[0];

				if(autoPublish && !blogEntry.isPublished()){
					blogEntry.publish(editorCmp,finish,this);
					return;
				}

				finish(blogEntry);
			},
			failure: function(){
				console.debug('failure',arguments);
				Ext.callback(editorCmp.onSaveFailure,editorCmp,[]);
			}
		});
	},


	deleteBlogPost: function(record, cmp){


	}

});
