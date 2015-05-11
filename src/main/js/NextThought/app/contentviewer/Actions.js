Ext.define('NextThought.app.contentviewer.Actions', {
	extend: 'NextThought.common.Actions',

	requires: ['NextThought.model.PageInfo'],


	getTarget: function(data) {
		var ntiid = data.ntiid,
			pageInfo, DH = Ext.DomHelper,
			postfix = data.notTarget ? '' : '-target',
			pageURI = encodeURIComponent('Pages(' + ntiid + ')'),
			userURI = encodeURIComponent($AppConfig.username);

		pageInfo = NextThought.model.PageInfo.create({
			ID: ntiid,
			NTIID: ntiid,
			content: DH.markup([
				{tag: 'head', cn: [
					{tag: 'title', html: data.title},
					{tag: 'meta', name: 'icon', content: data.thumbnail}
				]},
				{tag: 'body', cn: {
					cls: 'page-contents no-padding',
					cn: Ext.applyIf({
						tag: 'object',
						cls: 'nticard' + postfix,
						type: 'application/vnd.nextthought.nticard' + postfix,
						'data-ntiid': ntiid,
						html: DH.markup([
							{tag: 'img', src: data.thumbnail},
							{tag: 'span', cls: 'description', html: data.description}
						])
					}, data.asDomSpec())
				}}
			]),
			Links: [
				{
					Class: 'Link',
					href: '/dataserver2/users/' + userURI + '/' + pageURI + '/UserGeneratedData',
					rel: 'UserGeneratedData'
				}
			]
		});

		pageInfo.hideControls = true;

		return pageInfo;
	}
});
