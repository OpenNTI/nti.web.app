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
		'content.Reader',
		'content.PageWidgets',
		'cards.Card'
	],


	refs: [],


	init: function() {
		this.listen({
			component:{
				'reader-panel':{},
				'content-card':{
					'show-target':'showCardTarget'
				}
			}
		});
	},


	showCardTarget: function(card, data){
		var ntiid = data.target_ntiid || data.ntiid,
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
		pi.blankURL = true;
		LocationProvider.setLocation(pi);
	}

});
