var Ext = require('extjs');
var ContentUtils = require('../../util/Content');
const ParseUtils = require('legacy/util/Parsing');
require('legacy/app/prompt/Actions');
require('../../common/Actions');
require('../../model/PageInfo');
require('../../model/RelatedWork');
require('../../util/Content');
require('./components/attachment/Window');

module.exports = exports = Ext.define('NextThought.app.contentviewer.Actions', {
	extend: 'NextThought.common.Actions',

	getRelatedWorkPageInfo: function (data, bundle) {
		var ntiid = data.get ? data.get('NTIID') : data.NTIID,
			DH = Ext.DomHelper;

		return ContentUtils.getLocation(ntiid, bundle)
			.then(function (locations) {
				var location = locations[0],
					root = location && location.root,
					postfix, pageInfo,
					pageURI = encodeURIComponent('Pages(' + ntiid + ')'),
					userURI = encodeURIComponent($AppConfig.username);

				if (data.asDomData) {
					data = data.asDomData(root || '');
				}

				postfix = data.noTarget ? '' : '-target';

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
							}, data.domSpec)
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
			});
	},


	showAttachmentInPreviewMode: function (contentFile, parentRecord) {
		var rec = ParseUtils.parseItems(contentFile)[0];

		if (!this.PromptActions) {
			this.PromptActions = NextThought.app.prompt.Actions.create();
		}

		this.PromptActions.prompt('attachment-preview-mode', {
			record: rec,
			parent: parentRecord
		});
	}
});
