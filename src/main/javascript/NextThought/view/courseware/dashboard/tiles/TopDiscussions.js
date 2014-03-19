Ext.define('NextThought.view.courseware.dashboard.tiles.TopDiscussions', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-top-discussions',

	statics: {
		boardMap: {},

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord, finish) {
			var me = this, p,
				board = course.getAttribute('discussionBoard');

			function onResolveFailure() {
				console.warn('Could not load the course board', board);
				Ext.callback(finish);
			}

			function onBoardResolved(board) {

				var sId = board && ('dashboard-' + board.getContentsStoreId()),
					url = board && board.getLink('TopTopics'),
					instructorForum = course && course.getAttribute('instructorForum'),
					store = Ext.getStore(sId) || (board && board.buildContentsStore('', {storeId: sId, pageSize: 4, url: url},{ exclude: instructorForum }));

				me.board = board;
				store.sorters.removeAll();
				if (Ext.isEmpty(url)) {
					console.error('No top topic link for ', board.getId());
					return;
				}
				store.on('load', loadDiscussions, me, {single: true});
				//this.bindStore(store);
				if (!store.loaded) {
					store.load();
				} else {
					loadDiscussions(store, store.getRange());
				}
			}

			function loadDiscussions(store, records) {
				var tiles = [], me = this, max = 0;

				Ext.each(records, function(record) {
					var comments = record.get('PostCount'),
						id = 'course-dashboard-top-discussions-' + record.getId();

					max = (max > comments) ? max : comments;
					if (!Ext.getCmp(id)) {
						tiles.push(me.create({
							id: id,
							locationInfo: locationInfo,
							itemNode: record,
							lastModified: me.board.get('date'),
							innerWeight: comments
						}));
					}
				});
				//set the max on each tile so we can figure the %
				Ext.each(tiles, function(item) { item.maxInner = max;});

				Ext.callback(finish, null, [tiles]);
			}

			if (!board || !ParseUtils.isNTIID(board)) {
				Ext.callback(finish);
				return;
			}

			p = this.boardMap[board];

			if (!p) {
				p = this.boardMap[board] = new Promise(function(fulfill, reject) {
					Service.getObject(board, fulfill, reject, me, true);
				});
			}

			p.then(onBoardResolved, onResolveFailure);
		}

	},

	defaultType: 'course-dashboard-tiles-top-discussions-view',

	config: {
		board: null,
		rows: 2
	},

	getTimeWeight: function() { return this.itemNode.get('Last Modified') && this.itemNode.get('Last Modified').getTime(); },

	constructor: function(config) {
		var rec = config.itemNode,
			l = config.locationInfo;

		config.items = [
			{xtype: 'container', defaultType: this.defaultType, items: {
				record: rec,
				locationInfo: l,
				contentNtiid: l.ContentNTIID,
				courseInstance: l.courseInstance
			}}
		];

		this.callParent([config]);
	},


	onItemClicked: function(view, rec) {
		this.fireEvent('show-topic', this, rec);
	}
});

Ext.define('NextThought.view.courseware.dashboard.widget.TopDiscusssionsView', {
	extend: 'NextThought.view.courseware.dashboard.widgets.AbstractForumView',
	alias: 'widget.course-dashboard-tiles-top-discussions-view',

	cls: 'top-discussion-view',
	ui: 'tile',

	renderTpl: Ext.DomHelper.markup(
		[
			{ cls: 'controls', cn: [
				{ cls: 'favorite {favoriteState}' },
				{ cls: 'like {likeState}', html: '{[values.LikeCount==0?\"\":values.LikeCount]}' }
			]},
			{ cls: 'tile-title', html: 'discussion'},
			{ cls: 'avatar'},
			{cls: 'meta', cn: [
				{cls: 'title', html: '{title}'},
				{tag: 'span', cls: 'by', html: 'By {Creator}'},
				{tag: 'span', cls: 'time', html: '{[TimeUtils.timeDifference(new Date(),values["CreatedTime"])]}'}
			]},
			{cls: 'snippet', html: '{compiledBody}'},
			{cls: 'count', html: '{PostCount:plural("Comment")}'}
		]
	),

	snippetSize: 80,

	renderSelectors: {
		'avatar': '.avatar',
		'liked': '.controls .like',
		'favorites': '.controls .favorite',
		'snip': '.snippet'
	},

	afterRender: function() {
		this.callParent(arguments);

		function setAvatar(user) {
			avatar = user.get('avatarURL');
			me.avatar.setStyle({backgroundImage: 'url(' + avatar + ')'});
		}

		var creator = this.record.get('Creator'), me = this, avatar;
		if (creator.isModel) {
			setAvatar(creator);
			return;
		}
		UserRepository.getUser(creator, setAvatar, me);
	}

});
