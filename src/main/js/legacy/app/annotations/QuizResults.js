const Ext = require('extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.annotations.QuizResults', {
	extend: 'NextThought.app.annotations.Base',
	alias: 'widget.quizresult',
	$displayName: 'Quiz Result',

	constructor: function (config) {
		this.callParent(arguments);
	},

	render: function () {
		return this;
	}
});
