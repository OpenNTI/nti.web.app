Ext.define('NextThought.controller.Home', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.providers.Location'
	],

	models: [
		'Highlight',
		'Note',
		'QuizQuestion',
		'QuizQuestionResponse',
		'QuizResult',
		'Title'
	],

	views: [
		'content.Home',
		'views.Home',
		'widgets.main.ProfileHeader',
		'widgets.LibraryView'
	],

	refs: [
		{ ref: 'sessionInfo', selector: 'session-info' }
	],

	init: function() {
		this.control({
			'profile-header':{
				'edit': function(){
					this.getSessionInfo().fireEvent('account');
				}
			},
			'home-view-container library-view':{
				'itemdblclick':function(a, rec){
					Ext.getCmp('reader').activate();
					LocationProvider.setLocation(rec.get('NTIID'));
				},
				'selectionchange': function(a, sel){}
			}
		},{});
	}
});
