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

	views: [],

	refs: [],

	init: function() {
//		this.control({},{});
	}
});
