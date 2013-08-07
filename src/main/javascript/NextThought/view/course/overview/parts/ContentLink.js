Ext.define('NextThought.view.course.overview.parts.ContentLink',{
	extend: 'NextThought.view.cards.Card',
	alias: [
		'widget.course-overview-content',
		'widget.course-overview-externallink'
	],

	constructor: function(config){
		var n = config.node,
			i = config.locationInfo,
			href = n.getAttribute('href');

		if(!ParseUtils.isNTIID(href) && !Globals.HOST_PREFIX_PATTERN.test(href)){
			href = getURL(i.root + href);
		}

		config.data = {
			'attribute-data-href': href, href: href,
			creator: n.getAttribute('creator'),
			description: n.getAttribute('desc'),
			thumbnail: getURL(i.root+n.getAttribute('icon')),
			ntiid: n.getAttribute('ntiid'),
			title: n.getAttribute('label'),
			notTarget: true,
			asDomSpec: DomUtils.asDomSpec
		};

		this.callParent([config]);
	},


	shouldOpenInApp: function(ntiid, url, basePath){
		return true;
	},


	commentTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls:'comment', cn:[
			{tag:'tpl', 'if':'count',cn:{ cls:'', html:'{count:plural("Comment")}'}},
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
			url: $AppConfig.service.getContainerUrl(ntiid,Globals.USER_GENERATED_DATA),
			scope: this,
			method: 'GET',
			params: {
				accept: NextThought.model.Note.mimeType,
				batchStart:0,
				batchSize:1,
				filter:'TopLevel'
			},
			callback: this.containerLoaded
		};

		Ext.Ajax.request(req);

		console.log('Loading:',ntiid);

	},


	containerLoaded: function(q,s,r){
		var total = 0,
			json = Ext.decode(r && r.responseText,true);
		if(s && json){
			total = json.FilteredTotalItemCount || 0;
		}

		this.commentTpl.append(this.meta,{count:total});
	}

});
