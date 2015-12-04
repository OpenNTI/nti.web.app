Ext.define('NextThought.app.course.overview.components.editing.contentlink.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.Editor',
	alias: 'widget.overview-editing-contentlink-editor',

	statics: {
		getTypes: function() {
			return {
				mimeType: NextThought.model.RelatedWork.mimeType,
				types: [
					{
						title: 'External Link',
						iconCls: 'link',
						type: 'hyperlink',
						description: 'blah blah blah'
					},
					{
						title: 'Embed PDF',
						iconCls: 'pdf',
						type: 'internalpdf'
					},
					{
						title: 'Reading',
						iconCl: 'doc',
						type: 'reading'
					}
				]
			};
		}
	},

	requires: [
		'NextThought.app.course.overview.components.editing.contentlink.Preview',
		'NextThought.model.RelatedWork'
	],


	getFormSchema: function() {
		var schema = [
				{name: 'MimeType', type: 'hidden'},
				{name: 'icon', displayName: 'Icon', type: 'file'},
				{name: 'label', displayName: 'Title', type: 'text', placeholder: 'Title....'},
				{name: 'byline', displayName: 'Author', type: 'text', placeholder: 'Author...'},
				{name: 'description', displayName: 'Description', type: 'textarea', placeholder: 'Description goes here...'}
			];

		if (this.type === 'hyperlink') {
			schema.push({name: 'href', displayName: 'Link', type: 'text', placeholder: 'Link...'});
		} else if (this.type === 'internalpdf') {
			schema.push({name: 'href', displayName: 'PDF', type: 'file'});
		} else if (this.type === 'reading') {
			schema.push({name: 'href', displayName: 'Reading', type: 'text', placeholder: 'Reading...'});
		}

		return schema;
	},


	addToolbar: function() {
		if (this.record) { return; }

		var me = this,
			groups = me.parentRecord.get('Items'),
			toolbar;

		toolbar = this.add({
			xtype: 'box',
			autoEl: {
				cls: 'group-selection',
				cn: [
					{tag: 'span', html: 'Group'},
					{
						tag: 'select',
						cn: groups.map(function(group, index) {
							var config = {
								tag: 'option',
								html: group.get('title'),
								'data-label': group.get('title'),
								'data-link': group.getAppendLink()
							};

							if (index === 0) {
								config.selected = true;
							}

							return config;
						})
					}
				]
			},
			afterRender: function() {
				var select = this.el.dom.querySelector('select');

				function selectActiveOption() {
					var selected = select.querySelector('[data-label="' + select.value + '"]'),
						url = selected && selected.getAttribute('data-link');

					if (url) {
						me.formCmp.setAction(url);
					}

					console.log(select, me);
				}

				select.addEventListener('change', selectActiveOption);

				selectActiveOption();
			}
		});
	},


	addPreview: function(values) {
		return this.add({
			xtype: 'overview-editing-contentlink-preview',
			values: values
		});
	},


	getDefaultValues: function() {
		if (this.record) {
			return this.record.isModel && this.record.getData();
		}

		return {
			MimeType: NextThought.model.RelatedWork.mimeType
		};
	}
});
