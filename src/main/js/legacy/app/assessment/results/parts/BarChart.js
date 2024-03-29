const Ext = require('@nti/extjs');
const Color = require('internal/legacy/util/Color');

module.exports = exports = Ext.define(
	'NextThought.app.assessment.results.parts.BarChart',
	{
		extend: 'Ext.Component',
		alias: 'widget.assessment-barchart-results',

		cls: 'result chart',

		renderTpl: Ext.DomHelper.markup([
			{
				cls: 'graph',
				cn: [
					{
						tag: 'tpl',
						for: 'axis',
						cn: [
							{
								cls: 'row',
								cn: [
									{
										cls: 'label',
										cn: [
											{
												tag: 'tpl',
												if: 'labelPrefix',
												cn: [
													{
														tag: 'strong',
														html: '{labelPrefix}',
													},
												],
											},
											{ tag: 'span', html: '{label}' },
										],
									},
									{
										cls: 'series',
										cn: [
											{
												tag: 'tpl',
												for: 'series',
												cn: [
													{
														cls: 'item',
														style: {
															width: '{percentWidth}%',
														},
														cn: [
															{
																cls: 'label',
																style: {
																	backgroundColor:
																		'{color}',
																},
																html: '{count}',
															},
															{
																cls: 'info',
																cn: [
																	{
																		tag: 'span',
																		cls: 'percent',
																		html: '{percent}%',
																	},
																	{
																		tag: 'tpl',
																		if: 'label',
																		cn: [
																			{
																				tag: 'span',
																				cls: 'label',
																				html: ' - {label}',
																			},
																		],
																	},
																	{
																		tag: 'tpl',
																		if: 'sublabel',
																		cn: [
																			{
																				tag: 'span',
																				cls: 'sublabel',
																				html: '{sublabel}',
																			},
																		],
																	},
																],
															},
														],
													},
												],
											},
										],
									},
								],
							},
						],
					},
				],
			},
			{
				tag: 'ul',
				cls: 'legend',
				cn: [
					{
						tag: 'tpl',
						for: 'legend',
						cn: [
							{
								tag: 'li',
								cls: 'item',
								cn: [
									{
										cls: 'key',
										style: { backgroundColor: '{color}' },
									},
									{ cls: 'value', html: '{label}' },
								],
							},
						],
					},
				],
			},
		]),

		beforeRender: function () {
			this.callParent(arguments);

			var rows = this.__getRows(),
				legend = this.__getLegendForRows(rows);

			this.renderData = Ext.apply(this.renderData || {}, {
				axis: rows,
				legend: legend,
			});
		},

		getAxis: function () {
			return this.axis;
		},

		getColorForLabel: function (label) {
			this.seenLabels = this.seenLabels || [];

			var idx = this.seenLabels.indexOf(label);

			if (idx < 0) {
				this.seenLabels.push(label);
				idx = this.seenLabels.indexOf(label);
			}

			return Color.getColorHex(idx);
		},

		__getRows: function () {
			var me = this,
				axis = me.getAxis();

			axis.forEach(function (axi) {
				axi.series.forEach(function (item) {
					item.color = me.getColorForLabel(item.label);
					item.percentWidth = item.percent;
					item.percent = item.percent.toFixed(0);
				});
			});

			return axis;
		},

		__getLegendForRows: function (rows) {
			var shouldShowLegend = false,
				seen = {},
				legend = [];

			rows.forEach(function (row) {
				if (row.series.length < 1) {
					return;
				}

				row.series.forEach(function (item) {
					if (item.label) {
						shouldShowLegend = true;

						if (!seen[item.label]) {
							seen[item.label] = true;
							legend.push({
								color: item.color,
								label: item.label,
							});
						}
					}
				});
			});

			return shouldShowLegend ? legend : [];
		},
	}
);
