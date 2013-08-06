Ext.define('NextThought.view.course.overview.parts.ContentLink',{
	extend: 'NextThought.view.cards.Card',
	alias: [
		'widget.course-overview-content',
		'widget.course-overview-externallink'
	],

	constructor: function(config){
		var n = config.node,
			i = config.locationInfo;

		config.data = {
			creator: n.getAttribute('creator'),
			description: n.getAttribute('desc'),
			href: n.getAttribute('href'),
			thumbnail: getURL(i.root+n.getAttribute('icon')),
			ntiid: n.getAttribute('ntiid'),
			title: n.getAttribute('label'),
			asDomSpec: DomUtils.asDomSpec
		};

		this.callParent([config]);
	},


	commentTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls:'comment', cn:[
			{ cls:'', html:'{count:plural("Comment")}'},
			{ cls:'', html:'Add a Comment'}
		]
	})),


	afterRender: function(){
		this.callParent(arguments);
		var ntiid = this.data.href,
			req;

		if(!ParseUtils.parseNtiid(ntiid)){
			ntiid = this.data.ntiid;
			if(!ntiid){
				return;
			}
		}

		req = {
			url: $AppConfig.service.getContainerUrl(ntiid,Globals.RECURSIVE_USER_GENERATED_DATA),
			scope: this,
			params: {
				accept: NextThought.model.Note.mimeType,
				batchStart:0,
				batchSize:1,
				sortOn:'lastModified',
				sortOrder:'descending',
				filter:'TopLevel'
			},
			success: this.containerLoaded,
			failure: this.containerFailed
		};

		Ext.Ajax.request(req);

		console.log('Loading:',ntiid);

		//this.commentTpl.append(this.meta,{count:10});
	},


	containerLoaded: function(){
		debugger;
	},


	containerFailed: function(){
	}
});
