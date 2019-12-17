const Ext = require('@nti/extjs');

require('./BaseQuote');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.quotes.VideoQuote',
	{
		extend: 'NextThought.app.course.overview.components.editing.content.quotes.BaseQuote',
		alias: 'widget.overview-editing-video-production',
		hubspotPageUrl: 'https://www.nextthoughtstudios.com/video-quote',

		statics: {
			getHandledMimeTypes () {
				return [];
			},

			getTypes () {
				return [
					{
						title: 'Video Production',
						category: 'video-production',
						iconCls: 'ad-video',
						description: '',
						editor: this,
						hideFooter: true,
						isAvailable: () => true
					}
				];
			}
		}
	}
);
