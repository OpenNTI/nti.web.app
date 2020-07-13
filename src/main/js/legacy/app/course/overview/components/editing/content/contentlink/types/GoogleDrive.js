const Ext = require('@nti/extjs');
const {Drive} = require('@nti/web-integrations');

require('./Base');

const Type = 'application/vnd.nextthought.relatedworkref';

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.types.GoogleDrive', {
	extend: 'NextThought.app.course.overview.components.editing.content.contentlink.types.Base',
	alias: 'widget.overview-editing-contentlink-google-drive',

	statics: {
		getTypes () {
			return [
				{
					title: 'Google Drive',
					category: 'content',
					iconCls: 'upload',
					editor: this,
					isAvailable: async (bundle) => {
						const available = await bundle.getAvailableContentSummary();
						//TODO: check if the google drive
						return available[Type];
					}
				}
			];
		}
	},

	getFormSchema () {
		const base = this.callParent(arguments);

		base.push({type: 'hidden', name: 'targetMimeType'});

		return base;
	},

	addHeaderCmp () {
		return this.add({
			xtype: 'react',
			component: Drive.Picker,
			autoLaunch: true
		});
	}
});