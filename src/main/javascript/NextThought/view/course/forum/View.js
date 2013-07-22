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
		'activate': 'onActivate'
	},

	onActivate: function(){
		if(this.store){
			this.store.load();
		}
	},
	
	setForum: function(ntiid){
		var me = this;

		function success(o){
			var id = o.getContentsStoreId(),
				store = Ext.getStore(id) || o.buildContentsStore();

			me.store = store;
			me.add({xtype: 'course-forum-list', record:o, store:store});
		}

		function failure(){}

		if(ntiid && this.currentNttid !== ntiid){
			this.currentNtiid = ntiid;
			$AppConfig.service.getObject(ntiid,success,failure);

		}else if(!ntiid){
			this.removeAll(true);
		}
	}
});




Ext.define('NextThought.view.course.ForumList',{
	extend: 'NextThought.view.forums.Forum',
	alias: 'widget.course-forum-list',

	requires: [
		'NextThought.view.forums.Topic'
	],

	constructor: function(){
		this.mixins.HeaderLock.disable.call(this);
		this.callParent(arguments);
	},
});
