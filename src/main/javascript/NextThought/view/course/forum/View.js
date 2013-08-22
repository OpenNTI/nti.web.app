Ext.define('NextThought.view.course.forum.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.course-forum',
	requires: [
		'NextThought.layout.container.Stack',
		'NextThought.view.forums.Forum',
		'NextThought.view.ResourceNotFound'
	],

	cls: 'course-forum',

	layout: 'stack',

	listeners: {
		'activate': 'onActivate',
		'add': 'onViewPushed',
		'remove': 'onViewPopped',
		'beforedeactivate': 'handleDeactivate'
	},

	handleDeactivate: function(){
		var c = this.peek();
		if(c && c.unlockHeader){
			c.unlockHeader();
		}
	},

	onActivate: function(){
		var c = this.peek();
		if(c && c.lockHeader && c.isVisible()){
			c.lockHeader();//maybe this is already handled by this, but maybe we should check if we should lock?
		}

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

			console.log('Board fetch success returned', o)

			function finish(){
				console.log('Pushing board for record', o, store);
				me.store = store;
				me.add({xtype: 'course-forum-board', record:o, store:store});
				if(me.currentForum){
					console.log('Restoring state', me.currentForum, me.currentTopic);
					me.restoreState(me.currentForum, me.currentTopic);
				}
			}

			if(me.currentNtiid !== ntiid){
				console.warn('Dropping mismatched board', ntiid, this.currentNtiid);
				return;
			}

			if((o.get('Creator')||{}).isModel){
				finish();
				return;
			}

			UserRepository.getUser(o.get('Creator'),function(u){
				o.set('Creator',u);
				finish();
			});
		}

		function failure(){
			console.error("The discussion board failed to load");
			me.hasBoard = false;
			me.add({xtype: 'notfound'});

			function setError(){
				me.el.down('.resource-not-found .body .heading').update(getString('course_forum_empty_header', 'Sorry, this board doesn\'t exist...'));
				me.el.down('.resource-not-found .body .subtext').update(getString('course_forum_empty_sub', 'This board is currently not available.'));
			}
			
			if(me.rendered){
				setError();
			}else{
				me.on('afterrender', setError, me);
			}
		}

		if(ntiid && this.currentNtiid !== ntiid){
			console.log('Setting board to ', ntiid);
			this.currentNtiid = ntiid;
			$AppConfig.service.getObject(ntiid,success,failure);
		}else if(!ntiid){
			console.log('Clearing board ', ntiid);
			delete this.currentNtiid;
			this.removeAll(true);
		}

		this.hasBoard = !!this.currentNtiid;
	},


	navigateToForumObject: function(forum, topic){
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
				this.setForum(undefined, topic);
				return;
			}
		}

		if(top.xtype === 'forums-topic'){
			if(top.record.getId() === topic){
				return;
			}
		}

		this.popView();
		this.restoreState(forum, topic);
	},


	restoreState: function(forum, topic){
		this.navigateToForumObject.apply(this, arguments);
	},


	pushViewSafely: function(c){
		this.add(c);
	},

	
	setForum: function(forum, topic){
		var me = this, boardId = this.currentNtiid;
		if(!forum){
			this.setTopic(topic);
			return;
		}

		$AppConfig.service.getObject(forum, function(record){
			delete me.currentForum;
			if(boardId !== me.currentNtiid){
				console.warn('Dropping retrieved forum because board changed under us', boardId, me.boardId);
				return;
			}
			var storeId = record.getContentsStoreId(),
				store = Ext.getStore(storeId) || record.buildContentsStore(),
				cmp = Ext.widget('course-forum-topic-list',{
					record: record,
					store: store
				});
			me.pushViewSafely(cmp);
			me.setTopic(topic);
		}, function(){
			console.error('Failed to load forum:',forum);
		});
	},

	setTopic: function(topic){
		var me = this, boardId = this.currentNtiid;
		if(!topic){
			return;
		}

		$AppConfig.service.getObject(topic, function(record){
			delete me.currentTopic;
			if(boardId !== me.currentNtiid){
				console.warn('Dropping retrieved forum because board changed under us', boardId, me.boardId);
				return;
			}
			var storeId = record.getContentsStoreId(),
				store = Ext.getStore(storeId) || record.buildContentsStore(),
				top = me.peek(),
				cmp = Ext.widget('forums-topic',{
					record: record,
					store: store
				});

			if(top.xtype === 'course-forum-topic-list'){
				me.pushViewSafely(cmp);
			}else{
				me.topicMonitor = me.mon({
					destroyable: true,
					single: true,
					scope: me,
					'add': function(v, cmp){
						if(cmp.xtype === 'course-forum-topic-list'){
							Ext.destroy(me.topicMonitor);
							me.pushViewSafely(cmp);
						}
					}
				});
			}

		});
	},

	onCourseChanged: function(pageInfo){
		var l = ContentUtils.getLocation(pageInfo),
			toc, course, s = {content: {current_forum: null, current_topic: null}};

		console.trace();
		if( l && l !== ContentUtils.NO_LOCATION ){
			toc = l.toc.querySelector('toc');
			course = toc && toc.querySelector('course');
		}

		if(isFeature('state-transactions')){
			history.pushState(s);
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

	afterRender: function(){
		this.callParent(arguments);
		var header = this.el.down('.forum-forum-list');

		if(header){
			header.removeCls('forum-forum-list');
			header.addCls('course-forum-list');
		}
	},

	onHeaderClick: function(e){
		if(e.getTarget('.new-forum')){
			e.stopEvent();
			this.fireEvent('new-forum', this);
			return false;
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
