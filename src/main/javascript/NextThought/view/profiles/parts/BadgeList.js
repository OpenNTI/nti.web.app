Ext.define('NextThought.view.profiles.parts.BadgeList', {
	extend: 'Ext.view.View',
	alias: 'widget.profile-badge-list',

	requires: [
		'NextThought.view.badge.Window'
	],

	mixins: {
		exportBadge: 'NextThought.mixins.ExportBadge'
	},

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
	]),
	{
		canExport: function(values) {
			return values.earnedCls === 'earned' && values.isMe === true && isFeature('export-badges');
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
	},


	onItemClick: function(record, item, index, e) {
		if (e.getTarget('.export')) {
			this.showExportMenu(record, Ext.get(item));
			return;
		}

		var win = Ext.widget('badge-window', {
			badge: record
		});

		win.show();
	},


	showExportMenu: function(record, itemEl) {
		var me = this;
		if (!this.exportMenu) {
			this.exportMenu = Ext.widget('menu', {
				ownerCmp: this,
				constrainTo: Ext.getBody(),
				defaults: {
					ui: 'nt-menuitem',
					plain: true
				}
			});

			this.exportMenu.add(new Ext.Action({
				text: 'Download Badge',
				handler: me.downloadBadge.bind(me, record, itemEl),
				itemId: 'download-badge',
				ui: 'nt-menuitem', plain: true
			}));

			this.exportMenu.add(new Ext.Action({
				text: 'Push to Mozilla BackPack',
				handler: me.exportToBackPack.bind(me, record, itemEl),
				itemId: 'export-backpack',
				ui: 'nt-menuitem', plain: true
			}));
		}

		this.exportMenu.showBy(itemEl, 'tl-bl?');
	}
});
