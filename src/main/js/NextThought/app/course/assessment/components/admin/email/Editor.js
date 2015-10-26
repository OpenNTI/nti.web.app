Ext.define('NextThought.app.course.assessment.components.admin.email.Editor', {
	extend: 'NextThought.editor.Editor',
	alias: 'widget.course-email-editor',

	toolbarTpl: Ext.DomHelper.markup(
		[
			{
				cls: 'aux', cn: [
				{
					cls: 'receiver', cn: [
					 	{cls: 'label', html: 'To'},
						{cls: 'field'},
						{cls: 'action no-reply on'}
					]
				},
				{ cls: 'receiver cc-ed', cn: [
					{cls: 'label', html: 'cc'},
					{cls: 'field'}
				]}
			]}
		]),

	cls: 'blog-editor scrollable',

	renderTpl: Ext.DomHelper.markup({ cls: 'editor active', html: '{super}' }),

	renderSelectors: {
		titleEl: '.title',
		footerEl: '.footer'
	},

	afterRender: function() {
		this.callParent(arguments);

		Ext.EventManager.onWindowResize(this.syncHeight.bind(this));
		wait(500).then(this.syncHeight.bind(this)); //let the animation finish
	},


	destroy: function() {
		Ext.EventManager.removeResizeListener(this.syncHeight, this);
		return this.callParent(arguments);
	},


	syncHeight: function() {
		var el = this.contentEl,
			container = this.ownerCt && this.ownerCt.el && this.ownerCt.el.dom,
			containerRect = container && container.getBoundingClientRect(),
			otherPartsHeight = 0,
			top, height, min = 300;

		if (!el) {
			return;
		}

		if (!containerRect) {
			el.setHeight(min);
		}

		top = Math.max(containerRect.top, 0);

		otherPartsHeight += this.titleEl && this.titleEl.getHeight() || 50;
		// otherPartsHeight += this.tagsEl.getHeight();
		// otherPartsHeight += this.sharedListEl.getHeight();
		otherPartsHeight += this.footerEl && this.footerEl.getHeight() || 0;

		height = Ext.Element.getViewportHeight() - (top + otherPartsHeight + 90 + 10);//top of window + height of other parts + height of header + padding

		el.setHeight(Math.max(min, height));

		wait(700)
			.then(this.updateLayout.bind(this));
	},


	onCancel: function(e) {
		e.stopEvent();
		this.fireEvent('cancel');
		this.destroy();
	}

});