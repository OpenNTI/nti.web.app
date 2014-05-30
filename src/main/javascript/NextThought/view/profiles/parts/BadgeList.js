Ext.define('NextThought.view.profiles.parts.BadgeList', {
	extend: 'Ext.view.View',
	alias: 'widget.profile-badge-list',

	cls: 'badge-list',
	itemSelector: '.badge',

	deferEmptyText: false,
	emptyText: Ext.DomHelper.markup({ cls: 'empty-badge-text', html: 'Badges! We don\'t need no stinkin badges.'}),

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'for': '.', cn: [
			{cls: 'badge {earnedCls}', 'data-qtip': '{description}', cn: [
				{cls: 'img', style: {backgroundImage: 'url({image})'}},
				{cls: 'title', html: '{name}'}
			]}
		]}
	])),


	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', html: '{header}'}
	]),


	beforeRender: function() {
		this.callParent(arguments);

		this.emptyText = Ext.DomHelper.markup({cls: 'empty-badge-text', html: this.emptyText});

		Ext.apply(this.renderData, {
			header: this.header || 'Achievements'
		});
	},

	afterRender: function() {
		this.callParent(arguments);

		if (this.columnWidth) {
			this.setColumns(this.columnWidth);
		}
	},

	/**
	 * Sets the number of columns the list can fill
	 * @param {Number} width number of columns
	 */
	setColumns: function(width) {
		if (!this.rendered) {
			this.columnWidth = width;
			return;
		}

		this.el.set({'data-columns': width});
	}
});
