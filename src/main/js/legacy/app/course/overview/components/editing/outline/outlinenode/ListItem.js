const Ext = require('@nti/extjs');
const MoveInfo = require('internal/legacy/model/app/MoveInfo');

require('internal/legacy/mixins/dnd/OrderingItem');
require('../../controls/Publish');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.outline.outlinenode.ListItem',
	{
		extend: 'Ext.Component',
		alias: 'widget.overview-editing-outlinenode-listitem',

		mixins: {
			OrderingItem: 'NextThought.mixins.dnd.OrderingItem',
		},

		cls: 'outline-node-listitem',
		layout: 'none',

		renderTpl: Ext.DomHelper.markup([
			{ cls: 'calendar-container' },
			{ cls: 'title' },
			{ cls: 'controls' },
		]),

		renderSelectors: {
			titleEl: '.title',
			controlsEl: '.controls',
			dateContainerEl: '.date-container',
		},

		initComponent: function () {
			this.callParent(arguments);

			var move = new MoveInfo({
				OriginContainer:
					this.record.parent &&
					this.record.parent.getId &&
					this.record.parent.getId(),
				OriginIndex: this.record.listIndex,
			});

			this.setDataTransfer(move);
			this.setDataTransfer(this.record);

			this.loadContents = Promise.all([
				this.getPreview(this.record, this.bundle),
				this.getControls(this.record, this.bundle),
			]).then(this.addParts.bind(this));
		},

		onceLoaded: function () {
			return this.loadContents || Promise.resolve();
		},

		afterRender: function () {
			this.callParent(arguments);

			this.mon(this.titleEl, 'click', this.handleClick.bind(this));
			this.addCalendarPicker();
		},

		addParts: function (o) {
			var me = this,
				controls = o[1] || [];

			if (!(controls instanceof Array)) {
				controls = [controls];
			}

			this.onceRendered.then(function () {
				//If we got destroyed don't do anything
				if (!me.rendered) {
					return;
				}

				var config;

				// Set dates
				me.getStartDate().then(me.setDayAndMonth.bind(me));

				// Set title
				me.titleEl.update(me.record.getTitle());

				// Add the controls
				let cmp;
				for (var i = 0; i < controls.length; i++) {
					config = controls[i];
					config.renderTo = me.controlsEl;
					cmp = Ext.widget(config);
					if (config.xtype === 'overview-editing-controls-publish') {
						me.publishCmp = cmp;
						me.on(
							'destroy',
							me.publishCmp.destroy.bind(me.publishCmp)
						);
					}
				}
			});
		},

		/*
		 * For now, restrict the drag and drop to only the title.
		 * We don't want drag the controls.
		 */
		getDragHandle: function () {
			return this.titleEl.dom;
		},

		addCalendarPicker: function () {
			var container = this.el.down('.calendar-container');

			if (container) {
				this.editCmp = Ext.widget(
					'overview-editing-controls-calendar',
					{
						record: this.record,
						contents: this.contents,
						renderTo: container,
						disableText: true,
						beforeShowMenu: this.beforeShowMenuControl,
					}
				);

				this.on('destroy', this.editCmp.destroy.bind(this.editCmp));
			}
		},

		getStartDate: function () {
			var start = this.record && this.record.get('AvailableBeginning'),
				catalog;

			if (start) {
				return Promise.resolve(start);
			}

			if (!this.bundle) {
				return Promise.reject();
			}

			catalog = this.bundle.__courseCatalogEntry;
			return Promise.resolve(catalog.get('StartDate'));
		},

		setDayAndMonth: function (date) {
			if (this.dateCmp && this.dateCmp.setDayAndMonth) {
				this.dateCmp.setDayAndMonth(date);
			}
		},

		handleClick: function (e) {
			if (this.publishCmp) {
				this.publishCmp.onRouteDeactivate();
			}
			if (this.navigateToOutlineNode) {
				this.navigateToOutlineNode(this.record);
			}
		},

		getPreview: function (record) {
			return Promise.resolve({
				xtype: 'box',
				autoEl: {
					cls: 'title',
					html: record.getTitle(),
				},
			});
		},

		getControls: function (record, bundle) {
			var me = this;

			return record
				.getContents()
				.then(function (contents) {
					return {
						xtype: 'overview-editing-controls-publish',
						contents: contents,
						record: record,
						bundle: bundle,
						beforeShowMenu: me.beforeShowMenuControl,
					};
				})
				.catch(function (reason) {
					console.log(
						'Failed to load contents for: ',
						record.getTitle(),
						' ',
						reason
					);
				});
		},
	}
);
