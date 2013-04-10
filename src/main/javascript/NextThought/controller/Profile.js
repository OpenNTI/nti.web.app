Ext.define('NextThought.controller.Profile', {
	extend: 'Ext.app.Controller',

	requires:[
		'NextThought.providers.Location'
	],

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
			'profile-blog-post':{
				'delete-post': this.deleteBlogPost
//				'scroll-to': this.scrollProfileTo
			},
			'profile-blog-comment':{ 'delete-post': this.deleteBlogPost },
			'profile-blog-list-item':{ 'delete-post': this.deleteBlogPost },
			'activity-preview-blog-reply':{
				'delete-blog-comment': this.deleteBlogPost
			},

			'profile-blog-editor':{
				'save-post': this.saveBlogPost
			},

			'#profile profile-blog-post nti-editor':{
				'save': this.saveBlogComment
			},

			'activity-preview-personalblogentry nti-editor':{
				'save': this.saveBlogComment
			}
		});
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


	saveBlogComment: function(editor,record,valueObject, saveCallback){
		var postCmp = editor.up('[record]'),
		postRecord = postCmp && postCmp.record,
		isEdit = Boolean(record),
		commentPost = record || NextThought.model.forums.PersonalBlogComment.create();

		commentPost.set({ body:valueObject.body });

		if(editor.el){
			editor.el.mask('Saving...');
			editor.el.repaint();
		}

		function unmask(){
			if(editor.el){
				editor.el.unmask();
			}
		}

		try{

			commentPost.save({
				url: isEdit ? undefined : postRecord && postRecord.getLink('add'),//only use postRecord if its a new post.
				scope: this,
				success: function(rec){
					unmask();
					if(!postCmp.isDestroyed){
						if( !isEdit && postCmp.store ){
							postCmp.store.insert(0,rec);
						}
						editor.deactivate();
						editor.setValue('');
						editor.reset();
					}

					Ext.callback(saveCallback, null, [editor, postCmp, rec]);

					//TODO: increment PostCount in postRecord the same way we increment reply count in notes.
					if(!isEdit){
						postRecord.set('PostCount',postRecord.get('PostCount')+1);
					}
				},
				failure: function(){
					editor.markError(editor.getEl(),'Could not save comment');
					unmask();
					console.debug('failure',arguments);
				}
			});

		}
		catch(e){
			console.error('An error occurred saving comment', Globals.getError(e));
			unmask();
		}
	},

	incomingChange: function(change){
		if(!change.isModel){
			change = ParseUtils.parseItems([change])[0];
		}

		var item = change.get('Item'), blogCmp;

		if(item && /personalblogcomment$/.test(item.get('MimeType'))){
			blogCmp = Ext.ComponentQuery.query('profile-blog-post');

			//Add the comment into the view if it is present
			if(blogCmp.length > 0){
				blogCmp.first().addIncomingComment(item);
			}

			//See if we can find an item in a store some where
			//and increment the post count.
			Ext.StoreManager.each(function(s){
				var found = s.getById(item.get('ContainerId'));
				if(found){
					found.set('PostCount', found.get('PostCount')+1);
					return false; //Note we break here because set will have updated the remaining instances;
				}
				return true;
			});
		}
	},


	saveBlogPost: function(editorCmp, record, title, tags, body, autoPublish){

		var isEdit = Boolean(record),
			post = isEdit ? record.get('headline') : NextThought.model.forums.PersonalBlogEntryPost.create(),
			blogRecord = editorCmp.up('profile-blog') ? editorCmp.up('profile-blog').record : null;
			me = this;

		//TODO save old values so we can revert them on error?
		//See also beginEdit cancelEdit

		post.set({
			'title':title,
			'body':body,
			'tags':tags||[]
		});

		if(isEdit){
			//The title is on both the PersonalBlogEntryPost (headline)
			//and the wrapping PersonalBlogEntry (if we have one)
			record.set({'title': title});
		}

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

		if(editorCmp.el){
			editorCmp.el.mask('Saving...');
		}

		function unmask(){
			if(editorCmp.el){
				editorCmp.el.unmask();
			}
		}

		try{
			post.save({
				url: isEdit ? undefined : blogRecord && blogRecord.getLink('add'),
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
							return;
						}
					}

					unmask();
					finish(blogEntry);
				},
				failure: function(){
					console.debug('failure',arguments);
					unmask();
					Ext.callback(editorCmp.onSaveFailure,editorCmp,arguments);
				}
			});
		}
		catch(e){
			console.error('An error occurred saving blog', Globals.getError(e));
			unmask();
		}
	},


	deleteBlogPost: function(record, cmp, successCallback){
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
						r = store.findRecord('NTIID',idToDestroy,0,false,true,true);
						if(!r){
							console.warn('Could not remove, the store did not have item with id: '+idToDestroy, r);
							return;
						}

						//The store will handle making it a placeholder if it needs and fire events,etc... this is all we need to do.
						store.remove(r);
					}
				}, record);

				Ext.callback(successCallback, null, [cmp]);
			},
			failure: function(){
				alert('Sorry, could not delete that');
			}
		});
	}
});
