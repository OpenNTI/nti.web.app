Ext.define('NextThought.view.course.dashboard.tiles.TopDiscussions',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-top-discussions',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord, finish){
			var board = course.getAttribute('discussionBoard');

			function onResolveFailure(){
				console.warn('Could not load the course board', board);
				Ext.callback(finish);
			}

			function onBoardResolved(boardObject){
				Ext.callback(finish,null,[
					this.create({
						locationInfo: locationInfo,
						board: boardObject,
						lastModified:
						boardObject.get('Last Modified')})
				]);
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

	cls: 'course-dashboard-discussion-item-list',

	config: {
		board: null,
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

		this.setBoard(this.getBoard());
	},


	onItemClicked: function(view, rec){
		this.fireEvent('navigate-to-course-discussion', this.locationInfo.ContentNTIID, rec.get('ContainerId'), rec.getId());
	},


	setBoard: function(board){
		var sId = board && ('dashboard-'+board.getContentsStoreId()),
			url = board && board.getLink('TopTopics'),
			store = Ext.getStore(sId) || (board && board.buildContentsStore({storeId:sId,pageSize: 4, url: url}));

		store.sorters.removeAll();

		if(Ext.isEmpty(url)){
			console.error('No top topic link for ', board.getId());
			return;
		}

		this.view.bindStore(store);
		if(!store.loaded){
			store.load();
		}
	}
});
