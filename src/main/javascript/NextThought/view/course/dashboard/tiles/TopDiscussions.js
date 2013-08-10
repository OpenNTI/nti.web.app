Ext.define('NextThought.view.course.dashboard.tiles.TopDiscussions',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-top-discussions',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord, finish){
			var board = course.getAttribute('discussionBoard');

			if(!board || !ParseUtils.isNTIID(board)){
				Ext.callback(finish);
				return;
			}

			Ext.callback(finish,null,[ this.create({locationInfo: locationInfo, boardNtiid: board, lastModified: courseNodeRecord.get('date')}) ]);
		}

	},

	cls: 'course-dashboard-discussion-item-list',

	config: {
		boardNtiid: '',
		weight:1.01
	},

	constructor: function(config){

		config.items = [
			{xtype: 'tile-title', heading:'Top Discussions' }
		];

		this.callParent([config]);

		this.view = this.add({
			xtype: 'dataview',
			cls:'scrollbody topics-list',
			ui: 'tile',

			preserveScrollOnRefresh: true,
			selModel: {
				allowDeselect: false,
				deselectOnContainerClick: false
			},
			itemSelector:'.row',
			tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for':'.', cn: [{
				cls: 'row',
				cn: [
					{ cls: 'title', html: '{title}' },
					{ tag: 'span', cls: 'byline', cn: [
						'Posted by ',{tag: 'span', cls: 'name link', html: '{Creator}'}
					]}
				]
			}]}),
			listeners: {
				scope: this,
				select: function(selModel,record){ selModel.deselect(record); },
				itemclick: 'onItemClicked'
			}
		});

		$AppConfig.service.getObject(this.getBoardNtiid(),
				this.onBoardResolved,
				this.onResolveFailure,
				this,
				true
		);
	},


	onItemClicked: function(view, rec){
		this.fireEvent('navigate-to-course-discussion', this.locationInfo.ContentNTIID, rec.get('ContainerId'), rec.getId());
	},


	onBoardResolved: function(board){
		var sId = board && ('dashboard-'+board.getContentsStoreId()),
			url = board && board.getLink('TopTopics'),
			store = Ext.getStore(sId) || (board && board.buildContentsStore({storeId:sId,pageSize: 4, url: url}));

		store.sorters.removeAll();

		if(Ext.isEmpty(url)){
			console.error('Not top topic link for ', this.getBoardNtiid());
			return;
		}

		this.view.bindStore(store);
		if(!store.loaded){
			store.load();
		}
	},


	onResolveFailure: function(){
		console.warn('Could not load the course board', this.getBoardNtiid());
	}

});
