Ext.define('NextThought.view.course.dashboard.tiles.InstructorForum',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-tiles-instructor-forum',

	statics: {
		getTileFor: function(effictiveDate, course, locationInfo, courseNodeRecord, finish){
			var ntiid = course && course.getAttribute('instructorForum');

			if(!Ext.isEmpty(ntiid)){
				this.create({locationInfo: locationInfo, ntiid: ntiid, lastModified: courseNodeRecord.get('date'), finishCallBack: finish});
			}else{
				Ext.callback(finish);
			}
		}
	},

	defaultType: 'course-dashboard-tiles-instructor-forum-view',

	config:{
		cols: 3,
		ntiid: '',
		finishCallBack: Ext.emptyFn
	},

	constructor: function(config){
		this.callParent(arguments);

		this.ntiids = this.getNtiid().split(' ');

		this.resolveForum(this.ntiids.shift());
	},

	resolveForum: function(ntiid){
		var me = this;

		function failure(){
			if(me.ntiids.length === 0){
				console.error("Failed to get forum: ",ntiid);
				Ext.callback(me.getFinishCallBack());
			}else{
				me.resolveForum(me.ntiids.shift());
			}
		}

		$AppConfig.service.getObject(ntiid, me.createView,failure,me);		
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
		var tile = this;
		if(Ext.isEmpty(records)){
			Ext.destroy(tile);
			tile = undefined;
		}

		this.view = tile && tile.add({
			xtype: 'course-dashboard-tiles-instructor-forum-view',
			record: records[0],
			contentNtiid: this.getLocationInfo().ContentNTIID
		});

		Ext.callback(this.getFinishCallBack(), null, [tile]);
	}
});

Ext.define('NextThought.view.course.dashboard.widget.InstructorForumView',{
	extend: 'Ext.Component',
	alias: 'widget.course-dashboard-tiles-instructor-forum-view',

	mixins: {
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	cls: 'instructor-forum-view',
	ui: 'tile',
	
	renderTpl: Ext.DomHelper.markup(
		[
			{ cls: 'controls', cn: [
				{ cls: 'favorite {favoriteState}' },
				{ cls: 'like {likeState}', html:'{[values.LikeCount==0?\"\":values.LikeCount]}' }
			]},
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

	renderSelectors:{
		'liked': '.controls .like',
		'favorites': '.controls .favorite'
	},

	constructor: function(){
		this.callParent(arguments);
		this.mixins.likeAndFavoriteActions.constructor.call(this);
	},

	
	setBody: function(body){
		this.renderData.compiledBody = body;
		if(this.rendered){
			this.el.down('.snippet').update(body);
		}
		this.maybeEllipse();
	},

	maybeEllipse: function(){
		if(!this.rendered){
			this.needToMaybeEllipse = true;
			return;
		}
		var snip = this.el.down('.snippet'),
			content;

		if(snip.getHeight() < snip.dom.scrollHeight){
			content = ContentUtils.getHTMLSnippet(snip.getHTML(),150);
			content = content + "<div class='ellipse'><div></div><div></div><div></div></div>";
			snip.setHTML(content);
			snip.addCls('overflowing');
		}
	},

	beforeRender: function(){
		this.callParent(arguments);
		if(!this.record){
			return;
		}
		var h = this.record.get('headline');
		this.renderData = Ext.apply(this.renderData||{},this.record.getData());

		h.compileBodyContent(this.setBody,this,null,100);
	},

	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.el,'click','handleClick');

		if(this.needToMaybeEllipse){
			this.maybeEllipse();
		}
	},

	handleClick: function(e){
		if(e.getTarget('.controls')){
			return;
		}
		this.fireEvent('navigate-to-course-discussion', this.contentNtiid, this.record.get('ContainerId'), this.record.getId());
	}
});


