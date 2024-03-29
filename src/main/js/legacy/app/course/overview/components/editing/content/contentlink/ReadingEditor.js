const Ext = require('@nti/extjs');
const RelatedWork = require('internal/legacy/model/RelatedWork');
const ContentUtils = require('internal/legacy/util/Content');

require('./types/Base');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.contentlink.ReadingEditor',
	{
		extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
		alias: 'widget.overview-editing-reading-editor',

		afterRender: function () {
			this.callParent(arguments);

			this.formCmp.setPlaceholder('icon', this.getIconPlaceholder());

			if (this.readingHasChanged()) {
				this.formCmp.setValue(
					'label',
					this.selectedItem.getAttribute('label')
				);
				this.formCmp.setValue(
					'href',
					this.selectedItem.getAttribute('ntiid')
				);
				this.formCmp.setValue(
					'target',
					this.selectedItem.getAttribute('ntiid')
				);
			}
		},

		readingHasChanged: function () {
			var href = this.record && this.record.get('href'),
				selected =
					this.selectedItem &&
					this.selectedItem.getAttribute('ntiid');

			return href && selected && href !== selected;
		},

		showEditor: function () {
			this.parentSelection = this.addParentSelection(
				this.record,
				this.parentRecord,
				this.rootRecord,
				this.onFormChange.bind(this)
			);

			if (this.selectedItem) {
				this.addReadingPreview(this.selectedItem);
				this.addAdvancedDisclosure();
			}

			this.formCmp = this.addFormCmp();

			if (this.record) {
				this.deleteBtn = this.addDeleteButton();
				this.switchTypeBtn = this.maybeAddSwitchTypeButton();
				this.addAdvancedDisclosure();
			}
		},

		addReadingPreview: function (item) {
			var me = this,
				breadcrumb = ContentUtils.getReadingBreadCrumb(item),
				pages = ContentUtils.getReadingPages(item),
				pageCount = pages.length + 1,
				parts = [
					{
						cls: 'path',
						cn: breadcrumb.map(function (part) {
							return { tag: 'span', html: part };
						}),
					},
					{
						tag: 'span',
						cls: 'label',
						html: item.getAttribute('label'),
					},
					{
						tag: 'span',
						cls: 'page-count',
						html:
							'(' +
							Ext.util.Format.plural(pageCount, 'Page') +
							')',
					},
				];

			if (!this.record || this.record.hasLink('edit-target')) {
				parts.push([{ tag: 'span', cls: 'change', html: 'Change' }]);
			}

			breadcrumb.pop(); //Pop off the leaf, which should be the reading itself

			me.add({
				xtype: 'box',
				autoEl: {
					cls: 'reading-preview',
					cn: parts,
				},
				listeners: {
					click: {
						element: 'el',
						fn: function (e) {
							if (e.getTarget('.change')) {
								me.onChangeReading();
							}
						},
					},
				},
			});
		},

		getIconPlaceholder() {
			if (this.record) {
				return (
					this.record.icon ||
					RelatedWork.getIconForMimeType('unknown')
				);
			}

			const icon = this.contentPackage && this.contentPackage.get('icon');

			return icon || RelatedWork.getIconForMimeType('unknown');
		},

		getFormSchema: function () {
			var schema = this.callParent(arguments);

			schema.unshift({ type: 'hidden', name: 'href' });
			schema.unshift({ type: 'hidden', name: 'target' });
			schema.unshift({ type: 'hidden', name: 'type' });

			return schema;
		},

		getDefaultValues: function () {
			const values = this.callParent(arguments);
			const { selectedItem, contentPackage } = this;

			if (!this.record && selectedItem) {
				values.label =
					values.label ||
					selectedItem.getAttribute('label') ||
					selectedItem.getAttribute('title');
				values.href = selectedItem.getAttribute('ntiid');
				values.target = values.href;
				values.description = contentPackage
					? contentPackage.get('description')
					: '';
			}

			values.type = RelatedWork.CONTENT_TYPE;

			return values;
		},
	}
);
