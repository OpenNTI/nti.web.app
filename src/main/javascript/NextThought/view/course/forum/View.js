Ext.define('NextThought.view.course.forum.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.course-forum',
	requires: [
		'NextThought.layout.container.Stack',
		'NextThought.view.forums.Forum'
	],
	cls: 'course-forum',

	layout: 'stack',

	listeners: {
		'activate': 'onActivate',
		'add': 'onViewPushed',
		'remove': 'onViewPopped'
	},

	onActivate: function(){
		if(this.store){
			this.store.load();
		}
	},


	onViewPushed: function(me,viewPushed){
		if(viewPushed.xtype === 'forums-topic' ){
			this.fireEvent('set-active-topic', viewPushed.record.getId());
		}
	},


	onViewPopped: function(me,viewPopped){
		if(viewPopped.xtype === 'forums-topic'){
			this.fireEvent('set-active-topic', undefined);
		}
	},

	
	setForum: function(ntiid){
		var me = this;

		function success(o){
			var id = o.getContentsStoreId(),
				store = Ext.getStore(id) || o.buildContentsStore();

			me.store = store;
			me.add({xtype: 'course-forum-list', record:o, store:store});
			if(me.selectedTopic){
				me.setTopic(me.selectedTopic);
			}
		}

		function failure(){}

		if(ntiid && this.currentNtiid !== ntiid){
			this.currentNtiid = ntiid;
			$AppConfig.service.getObject(ntiid,success,failure);
		}else if(!ntiid){
			delete this.currentNtiid;
			this.removeAll(true);
		}

		this.hasForum = !!this.currentNtiid;
	},

	setTopic: function(ntiid){
		var forumList;
		if(!this.hasForum){
			this.selectedTopic = ntiid;
			return;
		}

		forumList = this.down('course-forum-list');

		if(forumList){
			if(forumList.store.loading){
				this.storeMonitor = forumList.store.on({
					destroyable: true,
					single: true,
					scope:  this,
					'load': function(){
						var r = forumList.store.getById(this.selectedTopic);

						forumList.fireEvent('select', forumList.selModel, r);
						Ext.destroy(this.storeMonitor);
					}
				});
			}
		}

	},

	onCourseChanged: function(pageInfo){
		var l = ContentUtils.getLocation(pageInfo),
			toc, course;


		if( l && l !== ContentUtils.NO_LOCATION ){
			toc = l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
		}
		
		this.setForum(pageInfo.isPartOfCourse() && course && course.getAttribute('discussionBoard'));
	}
});




Ext.define('NextThought.view.course.ForumList',{
	extend: 'NextThought.view.forums.Forum',
	alias: 'widget.course-forum-list',

	requires: [
		'NextThought.view.forums.Topic'
	],

	selModel: {
		suppressPushState: true
	},

	onHeaderClick: function(e){
		if(e.getTarget('.path')){
			return;
		}

		if(e.getTarget('.new-topic')){
			this.fireEvent('new-topic', this);
		}
	}
});
