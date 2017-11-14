const Ext = require('extjs');

const ExternalToolAsset = require('legacy/model/ExternalToolAsset');

require('legacy/common/components/cards/Card');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.parts.ExternalToolAsset', {
	extend: 'NextThought.common.components.cards.Card',

	doNotRenderIcon: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'thumbnail', cn: [
			{ cls: 'icon {extension} {iconCls}', style: 'background-image: url(\'{thumbnail}\');', cn: [
				{tag: 'label', cls: 'extension', html: '{extension}'}
			]}
		]},
		{ cls: 'meta', cn: [
			{ cls: 'title', html: '{title}' },
			{ cls: 'byline', html: '{{{NextThought.view.cards.Card.by}}}' },
			{ cls: 'description', html: '{description}' }
		]}
	]),

	constructor: function () {
		this.callParent(arguments);

	},

});
