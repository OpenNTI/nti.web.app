const Ext = require('extjs');

const PromptActions = require('legacy/app/prompt/Actions');
const PageInfo = require('legacy/model/PageInfo');
const ContentUtils = require('legacy/util/Content');
const ParseUtils = require('legacy/util/Parsing');
const {guidGenerator} = require('legacy/util/Globals');

const AttachmentWindow = require('./components/attachment/Window');

require('legacy/common/Actions');
require('legacy/model/RelatedWork');
require('legacy/util/Content');

const TOPIC_EMBED = 'application/vnd.nextthought.app.embededtopic';


function buildPageInfoForAssignment (assignment, contents, regenerate) {
	const ntiid = assignment.getId();
	const assessmentItems = [assignment];
	const pageInfo = PageInfo.create({
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

	pageInfo.regenerate = regenerate;

	return pageInfo;
}

module.exports = exports = Ext.define('NextThought.app.contentviewer.Actions', {
	extend: 'NextThought.common.Actions',

	getRelatedWorkPageInfo: function (data, bundle) {
		var ntiid = data.get ? data.get('NTIID') : data.NTIID,
			href = data.get ? data.get('href') : data.href,
			DH = Ext.DomHelper;

		return new Promise((fulfill, reject) => {
			if (ParseUtils.isNTIID(href)) {
				Service.getPageInfo(href, void 0, void 0, void 0, bundle)
					.then(x => fulfill(x))
					.catch(() => reject());
			} else {
				reject();
			}
		}).catch(() => {
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

					pageInfo = PageInfo.create({
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
		});

	},


	getContentsForAssignment (assignment) {
		const title = assignment && assignment.get('title');
		const description = assignment && assignment.get('content');
		let contents = [];

		if (title) {
			contents.push({cls: 'chapter title', html: title});
		}

		if (description) {
			contents.push({cls: 'sidebar', html: description});
		}

		return Promise.resolve(contents);
	},


	getContentsForRegularAssignment (assignment, bundle) {
		return this.getContentsForAssignment(assignment, bundle)
			.then((contents) => {
				let parts = assignment && assignment.get('parts');
				let part = parts && parts[0];
				let questionSet = part && part.get('question_set');
				let questions = questionSet && questionSet.get('questions');

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
			});
	},


	getRegularAssignmentPageInfo (assignment, bundle) {
		return this.getContentsForRegularAssignment(assignment, bundle)
			.then((contents) => {
				return buildPageInfoForAssignment(assignment, contents, (newAssignment) => {
					return this.getRegularAssignmentPageInfo(newAssignment || assignment, bundle);
				});
			});
	},


	getContentsForDiscussionAssignment (assignment, bundle, student) {
		return this.getContentsForAssignment(assignment, bundle)
			.then((contents) => {
				return assignment.resolveTopic(student)
					.then((topic) => {
						const ntiid = topic.getId();

						contents.push({
							tag: 'object',
							data: ntiid,
							'data-canindividual': true,
							'data-ntiid': ntiid,
							type: TOPIC_EMBED,
							cn: [
								{tag: 'param', name: 'canindividual', value: true},
								{tag: 'param', name: 'ntiid', value: ntiid}
							]
						});

						return contents;
					})
					.catch(() => {
						const ntiid = guidGenerator();

						contents.push({
							tag: 'object',
							'data-canindividual': true,
							'data-ntiid': ntiid,
							type: TOPIC_EMBED,
							cn: [
								{tag: 'param', name: 'canindividual', value: true}
							]
						});

						return contents;
					});
			});
	},


	getDiscussionAssignmentPageInfo (assignment, bundle, student) {
		return this.getContentsForDiscussionAssignment(assignment, bundle, student)
			.then((contents) => {
				return buildPageInfoForAssignment(assignment, contents, (newAssignment) => {
					return this.getDiscussionAssignmentPageInfo(newAssignment || assignment, bundle);
				});
			});
	},


	getAssignmentPageInfo (assignment, bundle, student) {
		return assignment.isDiscussion ?
			this.getDiscussionAssignmentPageInfo(assignment, bundle, student) :
			this.getRegularAssignmentPageInfo(assignment, bundle);
	},


	showAttachmentInPreviewMode: function (contentFile, parentRecord) {
		var rec = ParseUtils.parseItems(contentFile)[0],
			type = contentFile && (contentFile.fileMimeType || contentFile.contentType);

		if (!AttachmentWindow.canShowFile(type)) {
			return;
		}

		if (!this.PromptActions) {
			this.PromptActions = PromptActions.create();
		}

		this.PromptActions.prompt('attachment-preview-mode', {
			record: rec,
			parent: parentRecord
		});
	}
});
