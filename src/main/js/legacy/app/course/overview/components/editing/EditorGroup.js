const Ext = require('@nti/extjs');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.EditorGroup',
	{
		inheritableStatics: {
			/**
			 * Get a list of all the editors in this group
			 *
			 * @override
			 * @returns {[Editors]} the editors
			 */
			getSubEditors: function () {},

			getEditors: function () {
				const editors = this.getSubEditors() || [];

				for (let editor of editors) {
					if (editor.attachToGroup) {
						editor.attachToGroup(this);
					}
				}

				return editors;
			},

			getEditorCount: function () {
				const editors = this.getSubEditors() || [];

				return editors.length;
			},

			/**
			 * Return a combined list of the mimetypes handled by the
			 * editors in the group
			 *
			 * @returns {[string]} the mimeTypes
			 */
			getHandledMimeTypes: function () {
				var editors = this.getEditors() || [],
					seen;

				seen = editors.reduce(function (acc, editor) {
					var handled = editor.getHandledMimeTypes
						? editor.getHandledMimeTypes()
						: [];

					handled.forEach(function (mimeType) {
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
			 * @returns {[Objects]} combined types
			 */
			getTypes: function () {
				var editors = this.getEditors() || [];

				return editors.reduce(function (acc, editor) {
					var types = editor.getTypes ? editor.getTypes() : [];

					if (!Array.isArray(types)) {
						types = [types];
					}

					types.forEach(function (type) {
						acc.push(type);
					});

					return acc;
				}, []);
			},

			getDefaultEditor: function () {},

			/**
			 * Return the editor in this group that can handle a record
			 * @param {Object} record the record to find the editor for
			 * @returns {Editor} the Class to instantiate to edit the record
			 */
			getEditorForRecord: function (record) {
				var editors = this.getEditors() || [],
					canHandle;

				canHandle = editors
					.sort((a, b) => {
						//sort the editors in from most specific to least
						const aSpec = a.specificity || 0;
						const bSpec = b.specificity || 0;

						return aSpec - bSpec;
					})
					.reduce(function (acc, editor) {
						var e = editor.getEditorForRecord
							? editor.getEditorForRecord(record)
							: null;

						if (e) {
							acc.push(e);
						}

						return acc;
					}, []);

				if (canHandle.length > 1) {
					console.warn(
						'More than one editor for record, picking the first one.'
					);
				} else if (canHandle.length === 0) {
					canHandle = this.getDefaultEditor();
				}

				return canHandle[0] || null;
			},

			/**
			 * Return the type switcher to handle switching between the items in the group
			 * @returns {Object} component to handle switching types
			 */
			getTypeSwitcher: function () {},
		},
	}
);
