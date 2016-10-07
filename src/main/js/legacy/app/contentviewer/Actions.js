const Ext = require('extjs');
const ContentUtils = require('../../util/Content');
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


	getContentsForAssignment (assignment/*, bundle*/) {
		let parts = assignment && assignment.get('parts');
		let part = parts && parts[0];
		let questionSet = part && part.get('question_set');
		let questions = questionSet && questionSet.get('questions');
		let title = assignment && assignment.get('title');
		let description = assignment && assignment.get('content');
		let contents = [];

		if (title) {
			contents.push({cls: 'chapter title', html: title});
		}

		if (description) {
			contents.push({cls: 'sidebar', html: description});
		}

		return (questions || []).reduce((acc, question) => {
			let ntiid = question.get('NTIID');

			acc.push({
				tag: 'object',
				data: ntiid,
				'data-canindividual': true,
				'data-ntiid': ntiid,
				type: question.get('MimeType'),
				cn: [
					{tag: 'param', name: 'canindividual', value: true},
					{tag: 'param', name: 'ntiid', value: ntiid},
					{html: '&nbsp;'}
				]
			});


			return acc;
		}, contents);
	},


	getAssignmentPageInfo (assignment, bundle) {
		const ntiid = assignment.getId();
		const contents = this.getContentsForAssignment(assignment, bundle);
		const assessmentItems = [assignment];
		const pageInfo = NextThought.model.PageInfo.create({
			ID: ntiid,
			NTIID: ntiid,
			AssessmentItems: assessmentItems,
			DoNotLoadAnnotations: true,
			isFakePageInfo: true,
			content: Ext.DomHelper.markup([
				{tag: 'head', cn: [
					{tag: 'title', html: assignment.get('title')}
				]},
				{tag: 'body', cn: [{
					cls: 'page-contents',
					cn: [
						{'data-ntiid': ntiid, ntiid: ntiid, cn: contents}
					]
				}]}
			])
		});


		pageInfo.regenerate = (newAssignment) => this.getAssignmentPageInfo(newAssignment || assignment, bundle);

		return pageInfo;
	},


	showAttachmentInPreviewMode: function (contentFile, parentRecord) {
		var rec = ParseUtils.parseItems(contentFile)[0],
			type = contentFile && (contentFile.fileMimeType || contentFile.contentType),
			AttachmentWindow = NextThought.app.contentviewer.components.attachment.Window;

		if (!AttachmentWindow.canShowFile(type)) {
			return;
		}

		if (!this.PromptActions) {
			this.PromptActions = NextThought.app.prompt.Actions.create();
		}

		this.PromptActions.prompt('attachment-preview-mode', {
			record: rec,
			parent: parentRecord
		});
	}
});
