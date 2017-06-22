const Ext = require('extjs');

const WindowsActions = require('legacy/app/windows/Actions');

require('legacy/app/badge/Window');
require('legacy/mixins/ExportBadge');
require('legacy/model/openbadges/Badge');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.achievements.parts.BadgeList', {
	extend: 'Ext.view.View',
	alias: 'widget.profile-badge-list',

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
		canExport: function (values) {
			//TODO: remove the last false once we have email verification
			return values.earnedCls === 'earned' && values.isMe === true && false;
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
					html: 'Display My Badges Publicly',
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

	constructor: function (config) {
		var cls = config.cls,
			newConfig = Ext.clone(config);

		delete newConfig.cls;
		this.callParent([newConfig]);

		if (cls) {
			this.addCls(cls);
		}
	},

	beforeRender: function () {
		this.callParent(arguments);

		this.WindowActions = WindowsActions.create();

		this.emptyText = Ext.DomHelper.markup({cls: 'empty-badge-text', html: this.emptyText});

		Ext.apply(this.renderData, {
			header: this.header || 'Achievements',
			preference: this.hasPublicPreference,
			preferenceTooltip: this.preferenceTooltip
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		if (this.columnWidth) {
			this.setColumns(this.columnWidth);
		}
	},

	setPublicPreference: function (show) {
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
			.then(function (preference) {
				me.preference = preference;
				// let checked = me.preference.get(me.preferenceKey);

				me.showPreference();
				me.mon(me.preferenceEl, 'click', me.updatePreference.bind(me));
				me.updateUIFromPreference(me.preference);
			})
			.catch(function (reason) {
				console.error('Failed to get preference: ', me.preferencePath, reason);
				me.hidePreference();
			});
	},

	/**
	 * Set the number of columns the list can fill
	 * @param {Number} width the number of columns
	 * @returns {void}
	 */
	setColumns: function (width) {
		if (!this.rendered) {
			this.columnWidth = width;
			return;
		}

		this.el.set({'data-columns': width});
	},

	updateUIFromPreference: function (preference) {
		if (!preference) {
			console.error('Cant update the ui with an empty preference');
			return;
		}

		var checked = preference.get(this.preferenceKey);

		this.preferenceEl[checked ? 'addCls' : 'removeCls']('checked');
	},

	showPreference: function () {
		if (!this.rendered) {
			this.on('afterrender', this.showPreference.bind(this));
			return;
		}

		if (this.preferenceEl) {
			this.preferenceEl.show();
		}
	},

	hidePreference: function () {
		if (!this.rendered) {
			this.on('afterrender', this.hidePreference.bind(this));
			return;
		}
		if (this.preferenceEl) {
			this.preferenceEl.hide();
		}
	},

	updatePreference: function () {
		var state = !this.preferenceEl.hasCls('checked');

		this.preference.set(this.preferenceKey, state);
		this.preference.save();
		this.updateUIFromPreference(this.preference);
	},

	onItemClick: function (record, item, index, e) {
		if (e.getTarget('.export')) {
			this.showExportMenu(record, Ext.get(item));
		} else {
			this.WindowActions.pushWindow(record, null, null, null, {record: record});
		}
	},

	setItems: function (items) {
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
