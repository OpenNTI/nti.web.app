Ext.define('NextThought.app.profiles.user.components.achievements.parts.BadgeList', {
	extend: 'Ext.view.View',
	alias: 'widget.profile-badge-list',

	requires: [
		'NextThought.app.badge.Window',
		'NextThought.model.openbadges.Badge'
	],


	mixins: {
		exportBadge: 'NextThought.mixins.ExportBadge'
	},

	layout: 'none',
	cls: 'badge-list',
	itemSelector: '.badge',

	deferEmptyText: false,

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'for': '.', cn: [
			{cls: 'badge {earnedCls}', cn: [
				{cls: 'img', style: {backgroundImage: 'url({image})'}},
				{tag: 'tpl', 'if': 'this.canExport(values)', cn: [
					{cls: 'link export', html: ''}
				]}
			]}
		]}
	]), {
		canExport: function(values) {
			return values.earnedCls === 'earned' && values.isMe === true;
		}
	}),


	renderTpl: Ext.DomHelper.markup([
		{cls: 'header-container', cn: [
			{cls: 'header', html: '{header}'},
			{tag: 'tpl', 'if': 'preference', cn: [
				{
					tag: 'span',
					cls: 'not-ready nti-checkbox email',
					'data-qtip': '{preferenceTooltip}',
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
			preference: this.hasPublicPreference,
			preferenceTooltip: this.preferenceTooltip
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.columnWidth) {
			this.setColumns(this.columnWidth);
		}
	},


	setPublicPreference: function(show) {
		if (!this.rendered) {
			this.on('afterrender', this.setPublicPreference.bind(this));
			return;
		}

		if (!show) {
			this.hidePreference();
			return;
		}

		var me = this;

		$AppConfig.Preferences.getPreference(me.preferencePath)
				.then(function(preference) {
					var checked;

					me.preference = preference;
					checked = me.preference.get(me.preferenceKey);

					me.showPreference();
					me.mon(me.preferenceEl, 'click', me.updatePreference.bind(me));
					me.updateUIFromPreference(me.preference);
				})
				.fail(function(reason) {
					console.error('Failed to get preference: ', me.preferencePath, reason);
					me.hidePreference();
				});
	},

	/**
	 * Set the number of columns the list can fill
	 * @param {Number} width the number of columns
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
			console.error('Cant update the ui with an empty preference');
			return;
		}

		var checked = preference.get(this.preferenceKey);

		this.preferenceEl[checked ? 'addCls' : 'removeCls']('checked');
	},


	showPreference: function() {
		if (!this.rendered) {
			this.on('afterrender', this.showPreference.bind(this));
			return;
		}

		if (this.preferenceEl) {
			this.preferenceEl.show();
		}
	},


	hidePreference: function() {
		if (!this.rendered) {
			this.on('afterrender', this.hidePreference.bind(this));
			return;
		}
		if (this.preferenceEl) {
			this.preferenceEl.hide();
		}
	},


	updatePreference: function() {
		var state = !this.preferenceEl.hasCls('checked');

		this.preference.set(this.preferenceKey, state);
		this.preference.save();
		this.updateUIFromPreference(this.preference);
	},


	onItemClick: function() {},


	setItems: function(items) {
		if (!this.badgeStore) {
			this.badgeStore = new Ext.data.Store({
				model: 'NextThought.model.openbadges.Badge',
				data: items
			});

			this.bindStore(this.badgeStore);
		} else {
			this.badgeStore.removeAll();

			if (items.length) {
				this.badgeStore.add(items);
			}
		}

		this.refresh();
	}
});
