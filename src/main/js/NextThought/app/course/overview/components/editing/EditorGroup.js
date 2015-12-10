Ext.define('NextThought.app.course.overview.components.editing.EditorGroup', {

	inheritableStatics: {
		/**
		 * Get a list of all the editors in this group
		 *
		 * @override
		 * @return {[Editors]} the editors
		 */
		getSubEditors: function() {},


		/**
		 * Return a combined list of the mimetypes handled by the
		 * editors in the group
		 *
		 * @return {[String]} the mimeTypes
		 */
		getHandledMimeTypes: function() {
			var editors = this.getSubEditors() || [],
				seen;

			seen = editors.reduce(function(acc, editor) {
				var handled = editor.getHandledMimeTypes ? editor.getHandledMimeTypes() : [];

				handled.forEach(function(mimeType) {
					acc[mimeType] = true;
				});

				return acc;
			}, {});

			return Object.keys(seen);
		},


		/**
		 * Return a combined list of the types handled by the
		 * editors in the group
		 *
		 * @see look in NextThought.app.course.overview.components.editing.Editor for an example of a type
		 * @return {[Objects]} combined types
		 */
		getTypes: function() {
			var editors = this.getSubEditors() || [];

			return editors.reduce(function(acc, editor) {
				var types = editor.getTypes ? editor.getTypes() : [];

				if (!Array.isArray(types)) {
					types = [types];
				}

				types.forEach(function(type) {
					acc.push(type);
				});

				return acc;
			}, []);
		},


		/**
		 * Return the editor in this group that can handle a record
		 * @return {Editor} the Class to instantiate to edit the record
		 */
		getEditorForRecord: function(record) {
			var editors = this.getSubEditors() || [],
				canHandle;

			canHandle = editors.reduce(function(acc, editor) {
				var e = editor.getEditorForRecord ? editor.getEditorForRecord(record) : null;

				if (e) {
					acc.push(e);
				}

				return acc;
			}, []);

			if (canHandle.length > 1) {
				console.warn('More than one editor for record, picking the first one.');
			}

			return canHandle[0] || null;
		}
	}
});
