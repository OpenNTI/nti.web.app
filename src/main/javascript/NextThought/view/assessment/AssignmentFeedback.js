Ext.define('NextThought.view.assessment.AssignmentFeedback', {
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.assignment-feedback',

	cls: 'feedback-panel',
	ui: 'assessment',
	appendPlaceholder: true,
	hidden: true,
	shouldShow: true,

	/* Because we're inheriting from a "Panel" to get the special handling provided by the super class, we can't use
	 * our typical renderTpl. Instead we're going to take advantage of the Ext.panal.Panel's html config property...
	 *
	 * We don't normally do this for our custom widgets, because the Panel is a fairly heavy weight component, so don't
	 * use this class as an exmaple of how to make custom components.
	 */
	html: Ext.DomHelper.markup([
		{ tag: 'h1', html: 'Feedback' },
		{ html: 'The comments below will only be visible to you and your student/instructor.'}
	])

});
