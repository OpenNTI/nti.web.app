Ext.define('NextThought.view.courseware.assessment.Navigation', {
	extend: 'Ext.view.View',
	alias: 'widget.course-assessment-navigation',

	ui: 'course',
	cls: 'nav-outline scrollable',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', html: '{title}'},
		{ cls: 'outline-list'}
	]),

	renderSelectors: {
		titleEl: '.header',
		frameBodyEl: '.outline-list'
	},


	getTargetEl: function() {
		return this.frameBodyEl;
	},


	overItemCls: 'over',
	itemSelector: '.outline-row',
	tpl: new Ext.XTemplate(
			Ext.DomHelper.markup(
					{ tag: 'tpl', 'for': '.', cn: [
						{ cls: 'outline-row', 'data-qtip': '{label:htmlEncode}', cn: [
							{ cls: 'label', html: '{label}'},
							{ cls: 'notifications' }
						]}
					]}), {
				//template functions
			}),

	clear: function() {
		this.bindStore('ext-empty-store');
	},


	setTitle: function(title) {
		this.title = title;
		if (this.titleEl) {
			this.titleEl.update(title);
		}
		else {
			this.renderData = Ext.apply(this.renderData || {}, {
				title: title
			});
		}
	}
});
