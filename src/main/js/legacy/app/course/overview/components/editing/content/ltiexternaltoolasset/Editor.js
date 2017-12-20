const Ext = require('extjs');

const LTIExternalToolAsset = require('legacy/model/LTIExternalToolAsset');
const NavigationActions = require('legacy/app/navigation/Actions');

require('../Editor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.ltiexternaltoolasset.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-ltiexternaltoolasset',

	statics: {
		getHandledMimeTypes: function () {
			return [
				LTIExternalToolAsset.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Add an LTI Tool',
					advanced: false,
					category: 'ltiexternaltoolasset',
					iconCls: 'link',
					description: '',
					editor: this
				}
			];
		}
	},

	cls: 'content-editor ltiexternaltoolasset',

	showEditor: function () {
		var href = this.parentRecord.data.href + '/@@create_external_tool';
		NavigationActions.navigateToHref(href);
		this.doClose();
	}

});
