const Ext = require('extjs');

const ExternalToolAsset = require('legacy/model/ExternalToolAsset');
const Globals = require('legacy/util/Globals');
const NavigationActions = require('legacy/app/navigation/Actions');

require('../Editor');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.externaltoolasset.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.Editor',
	alias: 'widget.overview-editing-externaltoolasset',

	statics: {
		getHandledMimeTypes: function () {
			return [
				ExternalToolAsset.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Add an LTI Tool',
					advanced: false,
					category: 'externaltoolasset',
					iconCls: 'link',
					description: '',
					editor: this
				}
			];
		}
	},

	cls: 'content-editor externaltoolasset',

	showEditor: function () {
		var href = this.parentRecord.data.href + '/@@create_external_tool';
		NavigationActions.navigateToHref(href);
		this.doClose();
	}

});
