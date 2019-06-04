const Ext = require('@nti/extjs');
const {ScormCollection} = require('@nti/web-course');

require('legacy/overrides/ReactHarness');
require('../../Editor');


const MimeType = 'application/vnd.nextthought.scormcontentref';

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.scorm.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-scorm',

	statics: {
		getHandledMimeTypes () {
			return [
				MimeType
			];
		},


		getTypes () {
			return [
				{
					title: 'Scorm Package',
					category: 'scorm-package',
					iconCls: 'scorm-package-icon',
					description: '',
					editor: this,
					isAvailable: (bundle) => {
						return bundle.hasLink('SCORMInstances');
					}
				}
			];
		}
	},

	cls: 'content-editor content-link lti-tools',

	maybeEnableBack (text) {
		if (!this.record && this.enableBack) {
			this.enableBack(text);
		}
	},

	showEditor () {
		if (this.record) {
			this.showItemEditor();
		} else {
			this.showItemList();
		}
	},


	showItemEditor () {
		debugger;	
	},


	async showItemList () {
		const course = await this.bundle.getInterfaceInstance();
	
		this.removeAll(true);
		this.maybeEnableBack(this.backText);

		this.itemList = this.add({
			xtype: 'react',
			component: ScormCollection,
			course
		});
	}
});