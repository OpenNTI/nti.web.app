Ext.define('NextThought.view.course.overview.parts.ContentLink',{
	extend: 'NextThought.view.cards.Card',
	alias: [
		'widget.course-overview-content',
		'widget.course-overview-externallink'
	],

	constructor: function(config){
		var n = config.node,
			i = config.locationInfo;

		config.data = {
			creator: n.getAttribute('creator'),
			description: n.getAttribute('desc'),
			href: n.getAttribute('href'),
			thumbnail: getURL(i.root+n.getAttribute('icon')),
			ntiid: n.getAttribute('ntiid'),
			title: n.getAttribute('label'),
			asDomSpec: DomUtils.asDomSpec
		};

		this.callParent([config]);
	}
});
