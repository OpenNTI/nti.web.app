const Ext = require('@nti/extjs');

require('./BaseQuote');

module.exports = exports = Ext.define(
	'NextThought.app.course.overview.components.editing.content.quotes.ContentQuote',
	{
		extend:
			'NextThought.app.course.overview.components.editing.content.quotes.BaseQuote',
		alias: 'widget.overview-editing-content-development',
		hubspotPageUrl: 'https://www.nextthought.com/content-quote',

		statics: {
			getHandledMimeTypes() {
				return [];
			},

			getTypes() {
				return [
					{
						title: 'Content Development',
						category: 'content-development',
						iconCls: 'ad-content',
						description: '',
						editor: this,
						hideFooter: true,
						isAvailable: () => true,
						subtitle: 'Learn More',
					},
				];
			},
		},
	}
);
