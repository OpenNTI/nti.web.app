/**
 * This controller is intended to provide instrumentation to the reader.  The messy singletons will need to be migrated
 * into this controller and deprecated.
 */
Ext.define('NextThought.controller.Reader', {
	extend: 'Ext.app.Controller',


	requires: [
		'NextThought.providers.Location'
	],


	models: [
		'PageInfo'
	],


	stores: [],


	views: [
		'cards.Card',
		'content.Navigation',
		'content.PageWidgets',
		'content.Pager',
		'content.Reader',
		'content.TabPanel',
		'content.Toolbar'
	],


	refs: [
		{ref: 'libraryNavigation', selector: 'library-view-container content-toolbar content-navigation'},
		{ref: 'libraryPager', selector: 'library-view-container content-toolbar content-pager'},
		{ref: 'libraryPageWigets', selector: 'library-view-container content-tabs content-page-widgets'}
	],


	init: function() {
		this.listen({
			component:{
				'library-view-container content-tabs reader-panel':{
					'set-content':'updateLibraryControls'
				},
				'content-card':{
					'show-target':'showCardTarget'
				}
			}
		});
	},


	showCardTarget: function(card, data, silent){
		var reader = card.up('reader-panel'),
			ntiid = data.ntiid,
			DH = Ext.DomHelper,
			s = encodeURIComponent('Pages('+ntiid+')'),
			u = encodeURIComponent($AppConfig.username),
		//Hack...
			pi = this.getPageInfoModel().create({
				ID: ntiid,
				NTIID: ntiid,
				content: DH.markup([
					{tag:'head',cn:[
						{tag:'title', html: data.title},
						{tag:'meta', name:'icon', content:data.thumbnail}
					]},
					{tag:'body',cn:{
						cls:'page-contents no-padding',
						cn:Ext.applyIf({
							tag: 'object',
							cls: 'nticard-target',
							type: 'application/vnd.nextthought.nticard-target',
							'data-ntiid': ntiid,
							html: DH.markup([
								{tag:'img', src:data.thumbnail},
								{tag:'span', cls:'description', html: data.description}
							])
						},data.asDomSpec())
					}}
				]),
				Links:[
					{
						Class: 'Link',
						href: '/dataserver2/users/'+u+'/'+s+'/UserGeneratedData',
						rel: 'UserGeneratedData'
					}
				]
			});

		pi.contentOrig = LocationProvider.currentNTIID;
		pi.hideControls = true;

		LocationProvider.setLocation(pi, null, !!silent);
	},


	updateLibraryControls: function(reader, doc, assesments, pageInfo){
		var fn = (pageInfo && pageInfo.hideControls)? 'hideControls':'showControls',
			pg = this.getLibraryPager(),
			pw = this.getLibraryPageWigets(),
			origin = pageInfo.contentOrig;

		pg[fn]();
		pw[fn]();

		pw.clearBookmark();
		pg.updateState();

		//If there is no origin, we treat this as normal. (Read the location from the location provder) The origin is
		// to direct the navbar to use the origins' id instead of the current one (because we know th current one will
		// not resolve from our library... its a card)
		this.getLibraryNavigation().updateLocation(origin||false);
	}

});
