var Ext = require('extjs');
var CardsContent = require('../components/cards/Content');
var CardsQuestion = require('../components/cards/Question');
var CardsRelatedWork = require('../components/cards/RelatedWork');
var CardsSlide = require('../components/cards/Slide');
var CardsVideo = require('../components/cards/Video');
var ListRelatedWork = require('../components/list/RelatedWork');


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
	},

	parse: function (obj, kind) {
		var cmp;
		if (kind === 'card') {
			cmp = {
				xtype: 'context-relatedwork-card',
				type: this.self.type,
				content: obj,
				course: this.course
			};
		} else if (kind === 'list') {
			cmp = Ext.widget('context-relatedwork-list', {
				type: this.self.type,
				content: obj,
				course: this.course,
				record: this.contextRecord
			});
		} else {
			cmp = Ext.widget('context-relatedwork-card', {
				type: this.self.type,
				content: obj,
				course: this.course,
				record: this.contextRecord,
				doNavigate: this.doNavigate
			});
		}
		return cmp;
	}
});
