const Ext = require('extjs');

const PathActions = require('legacy/app/navigation/path/Actions');

require('../components/cards/Content');
require('../components/cards/Question');
require('../components/cards/RelatedWork');
require('../components/cards/Slide');
require('../components/cards/Video');
require('../components/list/RelatedWork');


module.exports = exports = Ext.define('NextThought.app.context.types.RelatedWork', {
	statics: {
		type: 'relatedwork',

		canHandle: function (obj) {
			return obj && obj.get && (obj.get('Class') === 'RelatedWork' || obj.get('Class') === 'NTICard');
		}
	},

	constructor: function (config) {
		this.callParent(arguments);
		Ext.applyIf(this, config || {});

		this.PathActions = PathActions.create();
	},


	getCourseFor (obj) {
		if (this.course) {
			return Promise.resolve(this.course);
		}

		return this.PathActions.getPathToObject(obj)
			.then(path => this.PathActions.getRootBundleFromPath(path));
	},

	parse: function (obj, kind) {
		return this.getCourseFor(obj)
			.then((course) => {
				var cmp;

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
				} else if (obj && obj.get && obj.get('Class') === 'NTICard') {
					cmp = Ext.widget('context-relatedwork-card', {
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
});
