const Ext = require('@nti/extjs');
const { Survey } = require('@nti/web-assessment');
const { ensureAuthorized } = require('@nti/web-integrations');
const PromptActions = require('internal/legacy/app/prompt/Actions');
const PageInfo = require('internal/legacy/model/PageInfo');
const ContentUtils = require('internal/legacy/util/Content');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);
const { guidGenerator } = require('internal/legacy/util/Globals');

const AttachmentWindow = require('./components/attachment/Window');

require('internal/legacy/common/Actions');
require('internal/legacy/model/RelatedWork');
require('internal/legacy/util/Content');

const TOPIC_EMBED = 'application/vnd.nextthought.app.embededtopic';

function buildPageInfoForAssignment(assignment, contents, regenerate) {
	const ntiid = assignment.getId();
	const assessmentItems = [assignment];
	const pageInfo = PageInfo.create({
		ID: ntiid,
		NTIID: ntiid,
		AssessmentItems: assessmentItems,
		DoNotLoadAnnotations: true,
		isFakePageInfo: true,
		content: Ext.DomHelper.markup([
			{
				tag: 'head',
				cn: [{ tag: 'title', html: assignment.get('title') }],
			},
			{
				tag: 'body',
				cn: [
					{
						cls: 'page-contents',
						cn: [
							{ 'data-ntiid': ntiid, ntiid: ntiid, cn: contents },
						],
					},
				],
			},
		]),
	});

	pageInfo.regenerate = regenerate;

	return pageInfo;
}

module.exports = exports = Ext.define('NextThought.app.contentviewer.Actions', {
	extend: 'NextThought.common.Actions',

	async getRelatedWorkPageInfo(data, bundle) {
		const ntiid = data.get?.('NTIID') || data.NTIID;
		const href = data.get?.('href') || data.href;
		const DH = Ext.DomHelper;

		if (lazy.ParseUtils.isNTIID(href)) {
			try {
				// the await makes exceptions catch in this try/catch
				return await Service.getPageInfo(
					href,
					void 0,
					void 0,
					void 0,
					bundle
				);
			} catch {
				/* just continue with the below... */
			}
		}

		const [location] = await ContentUtils.getLocation(ntiid, bundle);

		const root = location?.root;
		const pageURI = encodeURIComponent('Pages(' + ntiid + ')');
		const userURI = encodeURIComponent($AppConfig.username);

		if (data.asDomData) {
			data = data.asDomData(root || '');
		}

		const postfix = data.noTarget ? '' : '-target';

		const target = new URL(href, global.location.href);
		if (target.origin !== global.location.origin) {
			await ensureAuthorized(target);
		}

		const pageInfo = PageInfo.create({
			ID: ntiid,
			NTIID: ntiid,
			content: DH.markup([
				{
					tag: 'head',
					cn: [
						{ tag: 'title', html: data.title },
						{
							tag: 'meta',
							name: 'icon',
							content: data.thumbnail,
						},
					],
				},
				{
					tag: 'body',
					cn: {
						cls: 'page-contents',
						cn: Ext.applyIf(
							{
								tag: 'object',
								cls: 'nticard' + postfix,
								type:
									'application/vnd.nextthought.nticard' +
									postfix,
								'data-ntiid': ntiid,
								html: DH.markup([
									{ tag: 'img', src: data.thumbnail },
									{
										tag: 'span',
										cls: 'description',
										html: data.description,
									},
								]),
							},
							data.domSpec
						),
					},
				},
			]),
			Links: [
				{
					Class: 'Link',
					href:
						'/dataserver2/users/' +
						userURI +
						'/' +
						pageURI +
						'/UserGeneratedData',
					rel: 'UserGeneratedData',
				},
			],
		});

		pageInfo.hideControls = true;
		pageInfo.isMock = true;

		return pageInfo;
	},

	getExternalToolAssetPageInfo(data, bundle) {
		const ntiid = data.get ? data.get('NTIID') : data.NTIID;
		const href = data.getLink('Launch');
		const pageURI = encodeURIComponent('Pages(' + ntiid + ')');
		const userURI = encodeURIComponent($AppConfig.username);

		const pageInfo = PageInfo.create({
			ID: ntiid,
			NTIID: ntiid,
			content: Ext.DomHelper.markup([
				{
					tag: 'head',
					cn: [
						{ tag: 'title', html: data.title },
						{
							tag: 'meta',
							name: 'icon',
							content: data.thumbnail,
						},
					],
				},
				{
					tag: 'body',
					cn: {
						cls: 'page-contents no-padding',
						cn: [
							{
								tag: 'object',
								cls: 'nticard-iframe',
								type: 'application/vnd.nextthought.nticard-iframe',
								'data-ntiid': ntiid,
								'data-href': `${href}?target=iframe&width=669`,
								html: Ext.DomHelper.markup([
									{ tag: 'img', src: data.thumbnail },
									{
										tag: 'span',
										cls: 'description',
										html: data.description,
									},
								]),
							},
						],
					},
				},
			]),
			Links: [
				{
					Class: 'Link',
					href:
						'/dataserver2/users/' +
						userURI +
						'/' +
						pageURI +
						'/UserGeneratedData',
					rel: 'UserGeneratedData',
				},
			],
		});

		pageInfo.hideControls = true;
		pageInfo.doNotSendAnalytics = true;
		pageInfo.isMock = true;

		return Promise.resolve(pageInfo);
	},

	getContentsForAssignment(assignment) {
		const title = assignment && assignment.get('title');
		const description = assignment && assignment.get('content');
		let contents = [];

		if (title) {
			contents.push({
				cls: 'chapter title',
				html: Ext.util.Format.htmlEncode(title),
			});
		}

		if (description) {
			contents.push({
				cls: 'sidebar assignment-description',
				html: description,
			});
		}

		return Promise.resolve(contents);
	},

	getContentsForRegularAssignment(assignment, bundle) {
		return this.getContentsForAssignment(assignment, bundle).then(
			async contents => {
				const parts = await Promise.all(
					(assignment?.get('parts') ?? []).map(part => {
						if (part.get('IsSummary')) {
							return part.fetchFromServer();
						}

						return part;
					})
				);

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
							{
								tag: 'param',
								name: 'canindividual',
								value: true,
							},
							{ tag: 'param', name: 'ntiid', value: ntiid },
							{ html: '&nbsp;' },
						],
					});

					return acc;
				}, contents);
			}
		);
	},

	getRegularAssignmentPageInfo(assignment, bundle) {
		return this.getContentsForRegularAssignment(assignment, bundle).then(
			contents => {
				return buildPageInfoForAssignment(
					assignment,
					contents,
					newAssignment => {
						return this.getRegularAssignmentPageInfo(
							newAssignment || assignment,
							bundle
						);
					}
				);
			}
		);
	},

	getContentsForDiscussionAssignment(assignment, bundle, student) {
		return this.getContentsForAssignment(assignment, bundle).then(
			contents => {
				return assignment
					.resolveTopic(student)
					.then(topic => {
						const ntiid = topic.getId();

						contents.push({
							tag: 'object',
							data: ntiid,
							'data-canindividual': true,
							'data-ntiid': ntiid,
							type: TOPIC_EMBED,
							cn: [
								{
									tag: 'param',
									name: 'canindividual',
									value: true,
								},
								{ tag: 'param', name: 'ntiid', value: ntiid },
							],
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
								{
									tag: 'param',
									name: 'canindividual',
									value: true,
								},
							],
						});

						return contents;
					});
			}
		);
	},

	getDiscussionAssignmentPageInfo(assignment, bundle, student) {
		return this.getContentsForDiscussionAssignment(
			assignment,
			bundle,
			student
		).then(contents => {
			return buildPageInfoForAssignment(
				assignment,
				contents,
				newAssignment => {
					return this.getDiscussionAssignmentPageInfo(
						newAssignment || assignment,
						bundle
					);
				}
			);
		});
	},

	getAssignmentPageInfo(assignment, bundle, student) {
		return assignment.isDiscussion
			? this.getDiscussionAssignmentPageInfo(assignment, bundle, student)
			: this.getRegularAssignmentPageInfo(assignment, bundle);
	},

	async getSurveyPageInfo(surveyModel, bundleModel) {
		const survey = await surveyModel.getInterfaceInstance();
		const bundle = await bundleModel.getInterfaceInstance();

		const raw = await Survey.Viewer.Utils.createPageInfo(survey, bundle);

		const ntiid = surveyModel.get('NTIID');
		const pageURI = encodeURIComponent('Pages(' + ntiid + ')');
		const userURI = encodeURIComponent($AppConfig.username);

		const pageInfo = PageInfo.create({
			ID: ntiid,
			NTIID: ntiid,
			AssessmentItems: [surveyModel],
			isFakePageInfo: true,
			content: raw.content,
			Links: [
				{
					Class: 'Link',
					href: `/dataserver2/users/${userURI}/${pageURI}/UserGeneratedData`,
					rel: 'UserGeneratedData',
				},
			],
		});

		pageInfo.isMock = true;
		pageInfo.backedBy = surveyModel;

		return pageInfo;
	},

	showAttachmentInPreviewMode: function (contentFile, parentRecord) {
		var rec = lazy.ParseUtils.parseItems(contentFile)[0],
			type =
				contentFile &&
				(contentFile.fileMimeType || contentFile.contentType);

		if (!AttachmentWindow.canShowFile(type)) {
			return;
		}

		if (!this.PromptActions) {
			this.PromptActions = PromptActions.create();
		}

		this.PromptActions.prompt('attachment-preview-mode', {
			record: rec,
			parent: parentRecord,
		});
	},
});
