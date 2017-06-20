const Ext = require('extjs');
const {wait} = require('nti-commons');

require('legacy/mixins/UIHelpers');


module.exports = exports = Ext.define('NextThought.app.course.assessment.components.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-body',

	mixins: {
		UIHelpers: 'NextThought.mixins.UIHelpers'
	},

	layout: 'card',

	afterRender: function () {
		this.callParent(arguments);

		wait()
			.then(this.fillElementToBottom.bind(this, this.el.dom));
	}
});
