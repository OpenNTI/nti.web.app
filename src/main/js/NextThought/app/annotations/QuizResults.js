export default Ext.define('NextThought.app.annotations.QuizResults', {
	extend: 'NextThought.app.annotations.Base',
	alias: 'widget.quizresult',
	$displayName: 'Quiz Result',
	requires: [],

	constructor: function(config) {
		this.callParent(arguments);
	},


	render: function() {
		return this;
	}
});
