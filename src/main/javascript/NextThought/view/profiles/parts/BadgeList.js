Ext.define('NextThought.view.profiles.parts.BadgeList', {
	extend: 'Ext.view.View',
	alias: 'widget.profile-badge-list',

	cls: 'badge-list',
	itemSelector: '.badge',

	deferEmptyText: false,

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'for': '.', cn: [
			{cls: 'badge {earnedCls}', cn: [
				{cls: 'img', style: {backgroundImage: 'url({image})'}}//,
				//{cls: 'title', html: '{name}'}
			]}
		]}
	])),

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header-container', cn: [
			{cls: 'header', html: '{header}'},
			{tag: 'tpl', 'if': 'preference', cn: [
				{
					tag: 'span',
					cls: 'not-ready nti-checkbox email',
					'data-qtip': 'Make badges earned for completing a course public.',
					html: 'Public',
					tabIndex: 0,
					role: 'button',
					'aria-role': 'button'
				}
			]}
		]}
	]),

	renderSelectors: {
		preferenceEl: '.nti-checkbox'
	},


	constructor: function(config) {
		var cls = config.cls,
			newConfig = Ext.clone(config);

		delete newConfig.cls;
		this.callParent([newConfig]);

		if (cls) {
			this.addCls(cls);
		}
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.emptyText = Ext.DomHelper.markup({cls: 'empty-badge-text', html: this.emptyText});

		Ext.apply(this.renderData, {
			header: this.header || 'Achievements',
			preference: this.hasPublicPreference
		});
	},

	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		if (me.columnWidth) {
			me.setColumns(me.columnWidth);
		}

		if (me.hasPublicPreference && me.preferenceEl) {
			$AppConfig.Preferences.getPreference(me.preferencePath)
				.done(function(preference) {
					var checked;

					me.preference = preference;
					checked = me.preference.get(me.preferenceKey);

					me.mon(me.preferenceEl, 'click', 'updatePreference');

					me.mon(me.preference, 'changed', 'updateUIFromPreference');
					me.updateUIFromPreference(me.preference);
				})
				.fail(function(reason) {
					console.error('Failed to get preference: ', me.preferencePath, reason);
					me.preferenceEl.destroy();
				});
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
	},


	updateUIFromPreference: function(preference) {
		if (!preference) {
			console.error('Cant update the ui with an empty preference.');
			return;
		}

		var checked = preference.get(this.preferenceKey);

		this.preferenceEl[checked ? 'addCls' : 'removeCls']('checked');
	},


	updatePreference: function() {
		var state = !this.preferenceEl.hasCls('checked');

		this.preference.set(this.preferenceKey, state);
		this.preference.save();
	}
});
