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

	typePrefix: 'course-forum',

	onViewPushed: function(me,viewPushed){
		var type;

		if(viewPushed.xtype === 'forums-topic' ){
			type = 'topic';
		}else if(viewPushed.xtype === 'course-forum-topic-list'){
			type = 'forum';
		}

		if(type){
			this.fireEvent('set-active-state', type, viewPushed.record.getId());
		}
	},


	onViewPopped: function(me,viewPopped){
		var type;
		
		if(viewPopped.xtype === 'forums-topic' ){
			type = 'topic';
		}else if(viewPopped.xtype === 'course-forum-topic-list'){
			type = 'forum';
		}

		if(type){
			this.fireEvent('set-active-state', type, undefined);
		}
	},

	
	setBoard: function(ntiid){
		var me = this;

		function success(o){
			var id = o.getContentsStoreId(),
				store = Ext.getStore(id) || o.buildContentsStore();

			me.store = store;
			me.add({xtype: 'course-forum-board', record:o, store:store});
			debugger;
			if(me.currentForum){
				me.restoreState(me.currentForum, me.currentTopic);
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

		this.hasBoard = !!this.currentNtiid;
	},

	restoreState: function(forum, topic){
		//if there is a valid state to restore there has to be a forum
		if(!forum){
			return;
		}
		//wait until the board is loaded
		if(!this.hasBoard){
			this.currentForum = forum;
			this.currentTopic = topic;
			return;
		}
		var top = this.peek();

		if(!top){
			console.error("We don't even have a board loaded?!?!?!?!");
		}
		
		if(top.xtype === 'course-forum-board'){
			this.setForum(forum, topic);
			return;
		}

		if(top.xtype === 'course-forum-topic-list'){
			if(top.record.getId() === forum){
				console.log('Forum is already here?!?!?!?!?');
				this.setForum(undefined, topic);
				return;
			}
		}

		if(top.xtype === 'forums-topic'){
			if(top.record.getId() === topic){
				console.log('Forum and topic are already here?!?!?');
				return;
			}
		}

		this.popView();
		this.restoreState(forum, topic);
	},

	
	setForum: function(forum, topic){
		var me = this;
		if(!forum){
			this.setTopic(topic);
			return;
		}

		$AppConfig.service.getObject(forum, function(record){
			var storeId = record.getContentsStoreId(),
				store = Ext.getStore(storeId) || record.buildContentsStore(),
				cmp = Ext.widget('course-forum-topic-list',{
					record: record,
					store: store
				});
			me.add(cmp);
			me.setTopic(topic);
		}, function(){
			console.log('Failed to load forum:',forum);
		});
	},

	setTopic: function(topic){
		var me = this;
		if(!topic){
			return;
		}

		$AppConfig.service.getObject(topic, function(record){
			var storeId = record.getContentsStoreId(),
				store = Ext.getStore(storeId) || record.buildContentsStore(),
				top = me.peek(),
				cmp = Ext.widget('forums-topic',{
					record: record,
					store: store
				});

			if(top.xtype === 'course-forum-topic-list'){
				me.add(cmp);
			}else{
				me.topicMonitor = me.mon({
					destroyable: true,
					single: true,
					scope: me,
					'add': function(v, cmp){
						if(cmp.xtype === 'course-forum-topic-list'){
							Ext.destroy(me.topicMonitor);
							me.add(cmp);
						}
					}
				});
			}

		})
	},

	onCourseChanged: function(pageInfo){
		var l = ContentUtils.getLocation(pageInfo),
			toc, course;


		if( l && l !== ContentUtils.NO_LOCATION ){
			toc = l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
		}
		
		this.setBoard(pageInfo.isPartOfCourse() && course && course.getAttribute('discussionBoard'));
	}
});

Ext.define('NextThought.view.course.forum.Board',{
	extend: 'NextThought.view.forums.Board',
	alias: 'widget.course-forum-board',

	requires: [
		'NextThought.view.forums.Forum'
	],

	selModel: {
		suppressPushState: true
	},

	onHeaderClick: function(e){
		if(e.getTarget('.path')){
			return;
		}
	}
});

Ext.define('NextThought.view.course.forum.ForumList',{
	extend: 'NextThought.view.forums.Forum',
	alias: 'widget.course-forum-topic-list',

	requires: [
		'NextThought.view.forums.Topic'
	],

	selModel: {
		suppressPushState: true
	},

	onHeaderClick: function(e){
		if(e.getTarget('.path')){
			this.fireEvent('pop-view', this);
		}
		else if(e.getTarget('.new-topic')){
			this.fireEvent('new-topic',this);
		}
	}
});
