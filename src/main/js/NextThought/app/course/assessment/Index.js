Ext.define('NextThought.app.course.assessment.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	title: 'Assignments',

	statics: {
		showTab: function(bundle) {
			if (!bundle || !bundle.getWrapper || !bundle.shouldShowAssignments()) {
				return false
			}

			return true;
		}
	},

	items: [
		{xtype: 'box', autoEl: {html: 'assessment'}}
	],

	onActivate: function() {
		this.setTitle(this.title);
	},

	bundleChanged: function(bundle) {}
});
