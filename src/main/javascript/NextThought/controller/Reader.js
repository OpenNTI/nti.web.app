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


	showCardTarget: function(card, data){
		var reader = card.up('reader-panel'),
			ntiid = data.target_ntiid || data.ntiid,
			s = encodeURIComponent('Pages('+ntiid+')'),
			u = encodeURIComponent($AppConfig.username),
		//Hack...
			pi = this.getPageInfoModel().create({
				ID: ntiid,
				NTIID: ntiid,
				content: Ext.DomHelper.markup({tag:'body',cn:{
					cls:'page-contents no-padding',
					cn:{
						tag: 'object',
						cls: 'nticard-target',
						type: 'application/vnd.nextthought.nticard-target',
						'data-ntiid': ntiid,
						html: 'Target'
					}
				}}),
				Links:[
					{
						Class: 'Link',
						href: '/dataserver2/users/'+u+'/'+s+'/UserGeneratedData',
						rel: 'UserGeneratedData'
					}
				]
			});

		reader.onNavigateComplete(pi);
	},


	updateLibraryControls: function(){
		this.getLibraryPageWigets().clearBookmark();
		this.getLibraryNavigation().updateLocation();
		this.getLibraryPager().updateState();
	}

});
