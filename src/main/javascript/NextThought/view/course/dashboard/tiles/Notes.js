Ext.define('NextThought.view.course.dashboard.tiles.Notes',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-most-recent-notes',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord){
			return this.create({
				lastModified:       courseNodeRecord.get('date'),
				locationInfo:       locationInfo,
				courseNodeRecord:   courseNodeRecord
			});
		}

	},


	config: {
		courseNodeRecord: null
	},


	constructor: function(config){

		config.items = [
			{xtype: 'tile-title', heading:'Top Thoughts' }
		];

		this.callParent([config]);

		this.view = this.add({
			xtype: 'dataview',
			cls:'scrollbody note-list',
			ui: 'tile',

			preserveScrollOnRefresh: true,
			selModel: {
				allowDeselect: false,
				deselectOnContainerClick: false
			},

			deferEmptyText: false,
			emptyText: Ext.DomHelper.markup([{
				cls:"history nothing rhp-empty-list",
				html: 'No Activity Yet'
			}]),

			itemSelector:'.row',
			tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for':'.', cn: [{
				cls: 'row',
				cn: [
					{ cls: 'title', html: '{preview}' },
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

		$AppConfig.service.getPageInfo(
				this.getCourseNodeRecord().getId(),
				this.onPageInfoResolved,
				this.onResolveFailure,
				this
		);
	},


	onItemClicked: function(){

	},


	onPageInfoResolved: function(pageInfo){
		var store = new NextThought.store.PageItem({
			url:getURL(pageInfo.getLink('RecursiveUserGeneratedData')),
			pageSize: 10
		});

		store.proxy.extraParams.accept = NextThought.model.Note.mimeType;

		store.load();
		this.view.bindStore(store);
	},


	onResolveFailure: function(){
		console.error('Could not resolve page');
	}
});
