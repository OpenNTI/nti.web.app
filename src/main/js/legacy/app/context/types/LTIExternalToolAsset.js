const Ext = require('@nti/extjs');

const PathActions = require('legacy/app/navigation/path/Actions');

require('../components/list/RelatedWork');

module.exports = exports = Ext.define(
	'NextThought.app.context.types.LTIExternalToolAsset',
	{
		statics: {
			type: 'LTIExternalToolAsset',

			canHandle (obj) {
				return obj && obj.get && (obj.get('Class') === 'ExternalToolAsset');
			}
		},

		constructor (config) {
			this.callParent(arguments);
			Ext.applyIf(this, config || {});

			this.PathActions = PathActions.create();
		},

		getCourseFor (obj) {
			if (this.course) {
				return Promise.resolve(this.course);
			}

			return this.PathActions.getPathToObject(obj).then(path =>
				this.PathActions.getRootBundleFromPath(path)
			);
		},

		parse (obj, kind) {
			return this.getCourseFor(obj).then(course => {
				let cmp;
				if (kind === 'card') {
					cmp = {
						xtype: 'context-relatedwork-card',
						type: this.self.type,
						content: obj,
						course: course
					};
				} else if (kind === 'list') {
					cmp = Ext.widget('context-relatedwork-list', {
						type: this.self.type,
						content: obj,
						course: course,
						record: this.contextRecord
					});
				} else {
					cmp = Ext.widget('context-relatedwork-card', {
						type: this.self.type,
						content: obj,
						course: course,
						record: this.contextRecord,
						doNavigate: this.doNavigate
					});
				}
				return cmp;
			});
		}
	}
);
