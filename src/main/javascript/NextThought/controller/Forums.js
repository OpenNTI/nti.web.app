Ext.define('NextThought.controller.Forums', {
	extend: 'Ext.app.Controller',

	models: [
		'forums.Board',
		'forums.Forum',
		'forums.HeadlinePost',
		'forums.HeadlineTopic',
		'forums.Post',
		'forums.Topic'
	],

	stores: [
	],

	views: [
	],

	refs: [],

	init: function() {

		this.control({

		});
	}


	/**
	 * This module will implement its navigation as a stack.  Both in tracking, and in literal view placement.
	 */
});
