Ext.define('NextThought.controller.Profile', {
	extend: 'Ext.app.Controller',

	models: [
		'forums.Post',
		'forums.PersonalBlog',
		'forums.PersonalBlogComment',
		'forums.PersonalBlogEntry',
		'forums.PersonalBlogEntryPost',
		'NextThought.providers.Location'
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


	applyBlogPostToStores: function(entry){
		var recordForStore;
		LocationProvider.applyToStoresThatWantItem(function(id,store){
			if(store){
				console.log(store, entry);

				if(store.findRecord('NTIID',entry.get('NTIID'),0,false,true,true)){
					console.warn('Store already has item with id: '+entry.get('NTIID'), entry);
				}

				if(!recordForStore){
					//Each store gets its own copy of the record. A null value indicates we already added one to a
					// store, so we need a new instance.  Read it out of the orginal raw value.
					recordForStore = ParseUtils.parseItems([entry.raw])[0];
				}

				//The store will handle making all the threading/placement, etc
				store.add(recordForStore);
				//once added, null out this pointer so that subsequant loop iterations don't readd the same instance to
				// another store. (I don't think our threading algorithm would appreciate that)
				recordForStore = null;
			}
		}, entry);
	},


	saveBlogPost: function(editorCmp, record, title, tags, body, autoPublish){

		var isEdit = Boolean(record),
			post = isEdit ? record.get('headline') : NextThought.model.forums.Post.create(),
			me = this;

		post.set({
			'title':title,
			'body':body,
			'tags':tags||[]
		});

		function finish(entry){
			var blogCmp = editorCmp.up('profile-blog');
			if(!isEdit){
				try {
					if(blogCmp.store){
						blogCmp.store.insert(0,entry);
					} else {
						blogCmp.buildBlog(true);
					}
					me.applyBlogPostToStores(entry);
				}
				catch(e){
					console.error('Could not insert blog post into blog widget',Globals.getError(e));
				}
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

				if(autoPublish !== undefined){
					if(autoPublish !== blogEntry.isPublished()){
						blogEntry.publish(editorCmp,finish,this);
						return
					}
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
		var idToDestroy;
		if(!record.get('href')){
			record.set('href',record.getLink('contents').replace(/\/contents$/,'')||'no-luck');
		}
		idToDestroy = record.get('NTIID');
		record.destroy({
			success:function(){
				LocationProvider.applyToStoresThatWantItem(function(id,store){
					var r;
					if(store){
						actedOn = true;
						r = store.findRecord('NTIID',idToDestroy,0,false,true,true);
						if(!r){
							console.warn('Could not remove, the store did not have item with id: '+idToDestroy, item);
							return;
						}

						//The store will handle making it a placeholder if it needs and fire events,etc... this is all we need to do.
						store.remove(r);
					}
				}, record);
			},
			failure: function(){
				alert('Sorry, could not delete that');
			}
		});
	}

});
