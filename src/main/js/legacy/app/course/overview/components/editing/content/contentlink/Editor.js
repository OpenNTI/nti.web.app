const Ext = require('extjs');

const TypeSwitcher = require('./TypeSwitcher');
const TypesDoc = require('./types/Doc');
const TypesReading = require('./types/Reading');
const TypesURL = require('./types/URL');

require('../../EditorGroup');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.EditorGroup',
	alias: 'widget.overview-editing-contentlink-editor',

	statics: {
		getSubEditors: function () {
			return [
				TypesDoc,
				TypesReading,
				TypesURL
			];
		},


		getTypeSwitcher: function () {
			return TypeSwitcher;
		}
	}
});
