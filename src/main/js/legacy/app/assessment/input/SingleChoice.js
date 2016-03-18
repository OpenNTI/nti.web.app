var Ext = require('extjs');
var InputMultipleChoice = require('./MultipleChoice');


module.exports = exports = Ext.define('NextThought.app.assessment.input.SingleChoice', {
	extend: 'NextThought.app.assessment.input.MultipleChoice',
	alias: 'widget.question-input-multiplechoicepart',

	initComponent: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData, {
			'choice-style': 'single'
		});
	},

	choiceClicked: function(e) {
		if (this.submitted) {return;}

		var c = e.getTarget('.choice', null, true);
		if (!c) {return;}

		this.getEl().select('.choice .control').removeCls('checked');

		c.down('.control').addCls('checked');
		this.enableSubmission();
	},


	getValue: function() {
		var r = this.callParent();
		if (r === null) {
			return null;
		}
		return r && r[0];
	}
});
