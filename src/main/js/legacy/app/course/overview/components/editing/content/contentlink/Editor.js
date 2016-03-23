var Ext = require('extjs');
var EditingEditorGroup = require('../../EditorGroup');
var TypesDoc = require('./types/Doc');
var TypesReading = require('./types/Reading');
var TypesURL = require('./types/URL');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.contentlink.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.EditorGroup',
	alias: 'widget.overview-editing-contentlink-editor',

	statics: {
		getSubEditors: function() {
			var base = NextThought.app.course.overview.components.editing.content.contentlink.types;

			return [
				base.Doc,
				// base.EmbeddedPDF,
				base.Reading,
				base.URL
			];
		}
	}
});
