Ext.define('NextThought.view.course.overview.parts.ContentLink',{
	extend: 'NextThought.view.cards.Card',
	alias: [
		'widget.course-overview-content',
		'widget.course-overview-externallink'
	],

	constructor: function(config){
		var n = config.node,
			i = config.locationInfo,
			href = n.getAttribute('href'),
			ntiid = n.getAttribute('ntiid');

		if(!ParseUtils.isNTIID(href) && !Globals.HOST_PREFIX_PATTERN.test(href)){
			href = getURL(i.root + href);
		}

		config.data = {
			'attribute-data-href': href, href: href,
			creator: n.getAttribute('creator'),
			description: Ext.String.ellipsis(n.getAttribute('desc'),180,true),
			thumbnail: getURL(i.root+n.getAttribute('icon')),
			ntiid: ntiid,
			title: n.getAttribute('label'),
			notTarget: !NextThought.view.cards.Card.prototype.shouldOpenInApp.call(this,ntiid,href),
			asDomSpec: DomUtils.asDomSpec
		};

		this.callParent([config]);
	},


	commentTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls:'comment', cn:[
			{ html:'{count:plural("Comment")}'}
		]
	})),

	afterRender: function(){
		this.callParent(arguments);
		this.loadContainer();
//		console.log('Loading:',ntiid);
	},

	loadContainer: function(){
		var ntiid = this.data.href,
			req;

		if(!ParseUtils.isNTIID(ntiid)){
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
	},

	appendTotal: function(total){
		this.commentTpl.append(this.meta,{count:total});
	},


	containerLoaded: function(q,s,r){
		var total = 0,
			json = Ext.decode(r && r.responseText,true);
		if(s && json){
			total = json.FilteredTotalItemCount || 0;
		}

		this.appendTotal(total);
	},


	onCardClicked: function(e){
		if(e.getTarget('.comment')){
			e.stopEvent();
			this.bypassEvent = false;
		}
		return this.callParent(arguments);
	}
});
