Ext.define('NextThought.app.course.overview.components.editing.outline.outlinenode.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-outlinenode',

	statics: {
		getSupported: function() {
			return NextThought.model.courses.navigation.CourseOutlineNode.mimeType;
		}
	},


	requires: [
		'NextThought.model.courses.navigation.CourseOutlineNode',
		'NextThought.app.course.overview.components.editing.Controls',
		'NextThought.app.course.overview.components.editing.outline.Items',
		'NextThought.app.course.overview.components.editing.content.Index',
		'NextThought.app.course.overview.components.editing.outline.outlinenode.Preview'
	],

	PREVIEW_TYPE: 'overview-editing-outline-outlinenode-preview',

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.loadContents = this.showOutlineNode(this.record, this.parentRecord);
	},


	onceLoaded: function() {
		var me = this;

		return (me.loadContents || Promise.resolve())
			.then(function() {
				var items = me.items.items || [];

				return Promise.all(items.map(function(item) {
					if (item && item.onceLoaded) {
						return item.onceLoaded();
					}

					return Promise.resolve();
				}));
			});
	},


	showOutlineNode: function(record, parentRecord) {
		var me = this,
			outline = me.outline,
			bundle = me.bundle;

		return Promise.all([
				me.getItems(record),
				me.getContents(record)
			]).then(function(results) {
				var items = results[0],
					contents = results[1],
					cmps = [
						me.getPreviewConfig(record, parentRecord, contents, outline, bundle)
					];

				if (items && items.length) {
					cmps.push(me.getItemsConfig(items, record, bundle));
				}

				if (contents) {
					cmps.push(me.getContentsConfig(contents, record, bundle));
				}

				me.add(cmps);
			});
	},


	getItems: function(record) {
		return record.get('Items');
	},


	getContents: function(record) {
		return record.getContents ? record.getContents() : Promise.resolve(null);
	},


	getPreviewConfig: function(record, parentRecord, contents, outline, bundle) {
		return {
			xtype: this.PREVIEW_TYPE,
			record: record,
			parentRecord: parentRecord,
			afterDelete: this.onDelete.bind(this),
			bundle: bundle,
			contents: contents,
			root: outline  //For editing stuff under a lesson node, the lesson overview is the root
		};
	},


	getControlsConfig: function(record, contents, bundle) {
		return {
			xtype: 'overview-editing-controls',
			record: record,
			root: contents,//For editing stuff under a lesson node, the lesson overview is the root
			contents: contents,
			bundle: bundle,
			optionsConfig: {
				order: ['audit', 'publish', 'edit']
			}
		};
	},


	getItemsConfig: function(items, record, bundle) {
		return {
			xtype: 'overview-editing-outline-items',
			record: record,
			recordItems: items,
			bundle: bundle,
			navigateToOutlineNode: this.navigateToOutlineNode
		};
	},


	getContentsConfig: function(contents, record, bundle) {
		return {
			xtype: 'overview-editing-content',
			record: contents,
			outlineNode: record,
			bundle: bundle,
			navigate: this.navigate
		};
	},


	onDelete: function() {
		if (this.afterDelete) {
			this.afterDelete();
		}
	}
});
