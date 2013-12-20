Ext.define('NextThought.view.courseware.assessment.admin.performance.View', {
	extend: 'Ext.view.View',
	alias: 'widget.course-assessment-admin-performance-root',

	ui: 'course-assessment',
	cls: 'course-assessment-admin performance scrollable',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', html: '{title}'},
		{ cls: 'list'}
	]),

	renderSelectors: {
		titleEl: '.header',
		frameBodyEl: '.list'
	},

	getTargetEl: function() { return this.frameBodyEl; },
	itemSelector: '.item',
	tpl: new Ext.XTemplate(
			Ext.DomHelper.markup(
					{ tag: 'tpl', 'for': '.', cn: [
						{ cls: 'item', cn: [
						]}
					]}
			), {
			}),


	store: new Ext.data.Store({
		fields: [
			{name: 'label', type: 'string'}
		],
		sorters: [
		]
	}),


	clear: function() {
		this.store.removeAll();
	},


	initComponent: function() {
		this.callParent(arguments);
		this.tpl.ownerCmp = this;
	},


	setAssignmentsData: function(assignments, history, outline) {
		var ntiid, me = this;

		this.clearAssignmentsData();

		if (!assignments) {
			console.error('No data??');
			return;
		}

		delete assignments.href;//all other keys are container ids...so, lets just drop it.

		function collect(agg, o) { me.collectEvents(o, history); }

		for (ntiid in assignments) {
			if (assignments.hasOwnProperty(ntiid)) {
				if (!ParseUtils.isNTIID(ntiid)) {//just to be safe
					console.warn('[W] Ignoring:', ntiid);
					continue;
				}

				ParseUtils.parseItems(assignments[ntiid]).reduce(collect, 0);
			}
		}
	},


	clearAssignmentsData: function() { this.clear(); },


	collectEvents: function(o, history) {}

});
