Ext.define('NextThought.view.course.dashboard.tiles.InstructorForum',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-tiles-instructor-forum',

	statics: {
		getTileFor: function(effictiveDate, course, locationInfo, courseNodeRecord){
			var ntiid = course && course.getAttribute('instructorForum');

			if(Ext.isEmpty(ntiid)){
				return null;
			}

			return this.create({locationInfo: locationInfo, ntiid: ntiid, lastModified: courseNodeRecord.get('date')});
		}
	},

	defaultType: 'course-dashboard-tiles-instructor-forum-view',

	config:{
		cols: 3,
		ntiid: ''
	},

	constructor: function(config){
		this.callParent(arguments);

		var ntiid = this.getNtiid();

		function failure(){
			console.log("Failed to get forum: ",ntiid);
		}

		$AppConfig.service.getObject(ntiid, this.createView,failure,this)
	},

	createView: function(record){
		var storeId = 'instructor-forum-topic-'+record.getContentsStoreId(),
			store = Ext.getStore(storeId) || record.buildContentsStore({
				storeId: storeId, 
				autoLoad: true,
				pageSize: 1, 
				proxyOverride: {
					extraParams: {
						sortOn: 'createdTime',
						sortOrder: 'descending'
					}
				}
			});

		this.mon(store,'load','addView');
	},


	addView: function(store, records){
		this.view = this.add({
			xtype: 'course-dashboard-tiles-instructor-forum-view',
			record: records[0]
		});
	}
});

Ext.define('NextThought.view.course.dashboard.widget.InstructorForumView',{
	extend: 'Ext.Component',
	alias: 'widget.course-dashboard-tiles-instructor-forum-view',

	cls: 'instructor-forum-view',
	ui: 'tile',
	
	renderTpl: Ext.DomHelper.markup(
		[
			{cls: 'tile-title', html: 'Announcements'},
			{cls: 'title', html: '{title}'},
			{cls: 'meta', cn:[
				{tag:'span', cls: 'by', html: 'By {Creator}'},
				{tag:'span', cls: 'time', html: '{[TimeUtils.timeDifference(new Date(),values["CreatedTime"])]}'}
			]},
			{cls: 'snippet', html: '{compiledBody}'},
			{cls: 'count', html: '{PostCount:plural("Comment")}'}
		]
	),

	
	setBody: function(body){
		this.renderData.compiledBody = body;
		if(this.rendered){
			this.el.down('.snippet').update(body);
		}
	},

	beforeRender: function(){
		this.callParent(arguments);
		var h = this.record.get('headline');
		this.renderData = Ext.apply(this.renderData||{},this.record.getData());

		h.compileBodyContent(this.setBody,this,null,100);
	}
});


