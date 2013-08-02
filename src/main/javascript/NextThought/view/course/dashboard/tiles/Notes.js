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

			store: 'ext-empty-store',
			preserveScrollOnRefresh: true,
			deferEmptyText: false,
			emptyText: Ext.DomHelper.markup([{
				cls:"history nothing rhp-empty-list",
				html: 'No Activity Yet'
			}]),

			itemSelector:'.row',
			tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for':'.', cn: [{
				cls: 'row',
				cn: [
					{ cls: 'controls', cn: [{ cls: 'like {likeState}', html:'{[values.LikeCount==0?\"\":values.LikeCount]}' }]},
					{ cls: 'title', html: '{preview}' },
					{ tag: 'span', cls: 'byline', cn: [
						'Posted by ',{tag: 'span', cls: 'name link', html: '{Creator}'}
					]}
				]
			}]})
		});

		this.mon(this.view,{
			select: function(selModel,record){ selModel.deselect(record); },
			itemclick: 'onItemClicked'
		});


		this.on('afterRender','setupStore',this,{single:true});
	},


	onItemClicked: function(view, rec, dom, i, e){
		if(e.getTarget('.like')){
			e.stopEvent();
			rec.like();
			return;
		}
		this.fireEvent('navigation-selected',rec.get('ContainerId'),rec);
	},


	setupStore: function(){
		var rec = this.getCourseNodeRecord(),
			pageInfo = rec.get('pageInfo'),
			store;

		if(!pageInfo){
			rec.listenForFieldChange('pageInfo','setupStore',this,true);
			return;
		}

		store = new NextThought.store.PageItem({
			model: 'NextThought.model.Note',
			url:getURL(pageInfo.getLink('RecursiveUserGeneratedData')),
			pageSize: 10,
			proxyOverride: {
				extraParams: {
					filter: 'TopLevel',
					sortOn:'lastModified',
					sortOrder:'descending',
					accept: NextThought.model.Note.mimeType
				}
			}
		});

		StoreUtils.fillInUsers(store);
		this.view.bindStore(store);
		store.load();
	}
});
