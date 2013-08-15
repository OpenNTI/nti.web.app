Ext.define('NextThought.view.course.dashboard.tiles.TopDiscussions',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-top-discussions',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord, finish){
			var me = this, board = course.getAttribute('discussionBoard');

			function onResolveFailure(){
				console.warn('Could not load the course board', board);
				Ext.callback(finish);
			}

			function onBoardResolved(board){
				var sId = board && ('dashboard-'+board.getContentsStoreId()),
					url = board && board.getLink('TopTopics'),
					store = Ext.getStore(sId) || (board && board.buildContentsStore({storeId:sId,pageSize: 4, url: url}));
				me.board = board;
				store.sorters.removeAll();
				if(Ext.isEmpty(url)){
					console.error('No top topic link for ', board.getId());
					return;
				}
				store.on('load', loadDiscussions, me);
				//this.bindStore(store);
				if(!store.loaded){
					store.load();
				}else{
					loadDiscussions(store, store.getRange());
				}
			}

			function loadDiscussions(store, records){
				var tiles = [], me = this;

				Ext.Array.each(records, function(record){
					tiles.push(me.create({ locationInfo: locationInfo, itemNode: record, lastModified: me.board.get('date')}));
				});

				Ext.callback(finish, null, [tiles]);
			}

			if(!board || !ParseUtils.isNTIID(board)){
				Ext.callback(finish);
				return;
			}

			$AppConfig.service.getObject(board,
					onBoardResolved,
					onResolveFailure,
					this,
					true
			);
		}

	},

	defaultType: 'course-dashboard-tiles-top-discussions-view',

	config: {
		board: null,
		weight:1.01,
		rows: 2
	},

	constructor: function(config){
		var rec = config.itemNode,
			l = config.locationInfo;
			
		config.items = [
			{xtype: 'container', defaultType: this.defaultType, items: {
				record: rec,
				locationInfo: l
			}}
		];

		this.callParent([config]);
	},


	onItemClicked: function(view, rec){
		this.fireEvent('navigate-to-course-discussion', this.locationInfo.ContentNTIID, rec.get('ContainerId'), rec.getId());
	}
});

Ext.define('NextThought.view.course.dashboard.widget.TopDiscusssionsView',{
	extend: 'NextThought.view.course.dashboard.widgets.AbstractForumView',
	alias: 'widget.course-dashboard-tiles-top-discussions-view',

	cls: 'top-discussion-view',
	ui: 'tile',

	renderTpl: Ext.DomHelper.markup(
		[
			{ cls: 'controls', cn: [
				{ cls: 'favorite {favoriteState}' },
				{ cls: 'like {likeState}', html:'{[values.LikeCount==0?\"\":values.LikeCount]}' }
			]},
			{ cls: 'avatar'},
			{cls: 'meta', cn:[
				{cls: 'title', html: '{title}'},
				{tag:'span', cls: 'by', html: 'By {Creator}'},
				{tag:'span', cls: 'time', html: '{[TimeUtils.timeDifference(new Date(),values["CreatedTime"])]}'}
			]},
			{cls: 'snippet', html: '{compiledBody}'},
			{cls: 'count', html: '{PostCount:plural("Comment")}'}
		]
	),

	renderSelectors:{
		'avatar': '.avatar',
		'liked': '.controls .like',
		'favorites': '.controls .favorite',
		'snip': '.snippet'
	},

	afterRender: function(){
		this.callParent(arguments);

		var avatar = this.record.get('Creator').get('avatarURL');
		debugger;
		this.avatar.setStyle({backgroundImage: 'url(' + avatar + ')'});
	}

})
