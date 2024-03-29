const Ext = require('@nti/extjs');
const { getString } = require('internal/legacy/util/Localization');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.parts.SectionHeader',
	{
		extend: 'Ext.Component',
		alias: ['widget.course-overview-section-header'],

		statics: {
			isSection: true,
		},

		ui: 'course',
		cls: 'overview-section',

		renderTpl: Ext.DomHelper.markup([
			{
				tag: 'h2',
				cls: '{type}',
				cn: [
					{
						tag: 'span',
						html: '{title}',
						style: '{[(values.color && ("background-color: #" + values.color)) || "" ]}',
					},
				],
			},
		]),

		beforeRender: function () {
			this.callParent(arguments);

			var title =
				this.title ||
				getString(
					'NextThought.view.courseware.overview.parts.Section.untitled'
				);

			this.renderData = Ext.apply(this.renderData || {}, {
				title: title,
				type: this.type || '',
				color: this.color || false,
			});

			if (this.type) {
				this.addCls(this.type);
			}
		},

		onAdd: function (item, index) {
			var first = this.items.getCount() === 1;

			this.mon(item, 'show', 'show');

			if (item.containerCls) {
				this.addCls(item.containerCls);
			}

			if (item.isHidden() && first) {
				this.hide();
				return;
			}

			if (this.isHidden() && !item.isHidden()) {
				this.show();
			}
		},

		setProgress: function (progress) {
			this.items.each(function (item) {
				if (item.setProgress) {
					item.setProgress(progress);
				}
			});
		},
	}
);
