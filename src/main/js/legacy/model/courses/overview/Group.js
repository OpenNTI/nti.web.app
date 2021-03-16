const Ext = require('@nti/extjs');
const {Color} = require('@nti/lib-commons');

require('../../Base');
require('internal/legacy/mixins/OrderedContents');

module.exports = exports = Ext.define(
	'NextThought.model.courses.overview.Group',
	{
		extend: 'NextThought.model.Base',

		mixins: {
			OrderedContents: 'NextThought.mixins.OrderedContents',
		},

		statics: {
			mimeType: 'application/vnd.nextthought.nticourseoverviewgroup',

			COLOR_CHOICES: [
				{color: Color.fromHex('F9824E'),},
				{color: Color.fromHex('F5D420'),},
				{color: Color.fromHex('81C8DC'),},
				{color: Color.fromHex('A5C959'),},
				{color: Color.fromHex('F9869E'),},
				{color: Color.fromHex('A8699D'),},
				{color: Color.fromHex('C7D470'),},
				{color: Color.fromHex('6B718E'),},
				{color: Color.fromHex('D8AF7E'),},
				{color: Color.fromHex('59C997'),},
				{color: Color.fromHex('5474D6'),},
				{color: Color.fromHex('CE78E0'),},
				{color: Color.fromHex('F5A620'),},
				{color: Color.fromHex('7B8CDF'),},
				{color: Color.fromHex('D3545B'),},
				{color: Color.fromHex('728957'),},
			],
		},

		mimeType: 'application/vnd.nextthought.nticourseoverviewgroup',

		fields: [
			{ name: 'title', type: 'String' },
			{ name: 'accentColor', type: 'String' },
			{ name: 'Items', type: 'arrayItem' },
		],
	}
);
