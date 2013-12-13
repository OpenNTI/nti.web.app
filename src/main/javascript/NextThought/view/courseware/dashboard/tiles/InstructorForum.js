Ext.define('NextThought.view.courseware.dashboard.tiles.InstructorForum', {
	extend: 'NextThought.view.courseware.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-tiles-instructor-forum',

	statics: {
		getTileFor: function(effictiveDate, course, locationInfo, courseNodeRecord, finish) {
			var ntiid = course && course.getAttribute('instructorForum');

			if (!Ext.isEmpty(ntiid)) {
				this.create({
					locationInfo: locationInfo,
					ntiid: ntiid,
					lastModified: courseNodeRecord.get('date'),
					finishCallBack: finish
				});
			}else {
				Ext.callback(finish);
			}
		}
	},

	cls: 'instructor-forum-tile',
	defaultType: 'course-dashboard-tiles-instructor-forum-view',

	config: {
		cols: 3,
		ntiid: '',
		baseWeight: 5,
		finishCallBack: Ext.emptyFn
	},

	constructor: function(config) {
		this.callParent(arguments);

		this.ntiids = this.getNtiid().split(' ');

		this.resolveForum(this.ntiids.shift());
	},

	resolveForum: function(ntiid) {
		var me = this;

		function failure() {
			if (me.ntiids.length === 0) {
				console.error('Failed to get forum: ', ntiid);
				Ext.destroy(me);
				Ext.callback(me.getFinishCallBack(), null, null, 1);
			}else {
				me.resolveForum(me.ntiids.shift());
			}
		}

		$AppConfig.service.getObject(ntiid, me.createView, failure, me);
	},

	createView: function(record) {
		var me = this,
			storeId = 'instructor-forum-topic-' + record.getContentsStoreId(),
			store = Ext.getStore(storeId) || record.buildContentsStore({
				storeId: storeId,
				pageSize: 1,
				proxyOverride: {
					extraParams: {
						sortOn: 'createdTime',
						sortOrder: 'descending'
					}
				}
			});

		this.mon(store.getProxy(), 'exception', function() {
			Ext.destroy(me);
			Ext.callback(me.getFinishCallBack());
		}, this);

		this.mon(store, 'load', 'addView');
		store.load();
	},


	addView: function(store, records) {
		var tile = this, l;
		if (Ext.isEmpty(records)) {
			Ext.destroy(tile);
			tile = undefined;
		}

		l = this.getLocationInfo();
		this.view = tile && tile.add({
			xtype: 'course-dashboard-tiles-instructor-forum-view',
			record: records[0],
			contentNtiid: l && l.ContentNTIID,
			courseInstance: l && l.courseInstance
		});

		Ext.callback(this.getFinishCallBack(), null, [tile]);
	}
});

Ext.define('NextThought.view.courseware.dashboard.widget.InstructorForumView', {
	extend: 'NextThought.view.courseware.dashboard.widgets.AbstractForumView',
	alias: 'widget.course-dashboard-tiles-instructor-forum-view',

	cls: 'instructor-forum-view',

	renderTpl: Ext.DomHelper.markup(
		[
   //			{ cls: 'controls', cn: [
   //				{ cls: 'favorite {favoriteState}' },
   //				{ cls: 'like {likeState}', html:'{[values.LikeCount==0?\"\":values.LikeCount]}' }
   //			]},
			{cls: 'tile-title', html: 'Announcements'},
			{cls: 'title', html: '{title}'},
			{cls: 'meta', cn: [
				{tag: 'span', cls: 'by', html: 'By {Creator}'},
				{tag: 'span', cls: 'time', html: '{[TimeUtils.timeDifference(new Date(),values["CreatedTime"])]}'}
			]},
			{cls: 'snippet', html: '{compiledBody}'},
			{cls: 'count', html: '{PostCount:plural("Comment")}'}
		]
	),

	renderSelectors: {
		'liked': '.controls .like',
		'favorites': '.controls .favorite',
		'snip': '.snippet'
	}
});


