const Ext = require('@nti/extjs');
const {scoped} = require('@nti/lib-locale');
const {encodeForURI} = require('@nti/lib-ntiids');

const SurveyRef = require('legacy/model/SurveyRef');
const NavigationActions = require('legacy/app/navigation/Actions');
const Type = 'application/vnd.nextthought.nasurvey';

require('../questionset/types/Assignment');
require('./SurveySelection');
require('./SurveyEditor');

const t = scoped('nti-web-app.course.overview.components.editing.content.survey.Editor', {
	create: 'Create Survey'
});

module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.survey.Editor', {
	extend: 'NextThought.app.course.overview.components.editing.content.questionset.types.Assignment',
	alias: 'widget.overview-editing-survey',

	isAssignment: false,

	statics: {
		getHandledMimeTypes: function () {
			return [
				SurveyRef.mimeType
			];
		},

		getTypes: function () {
			return [
				{
					title: 'Survey',
					category: 'survey',
					advanced: false,
					iconCls: 'survey',
					description: '',
					editor: this,
					isAvailable: async (bundle) => {
						// const available = await bundle.getAvailableContentSummary();

						return true;//available[Type];
					}
				}
			];
		},

		getEditorForRecord: function (record) {
			if (record instanceof SurveyRef) {
				return this;
			}
		}
	},

	addFormCmp: function () {},

	EDITOR_XTYPE: 'overview-editing-survey-editor',
	LIST_XTYPE: 'overview-editing-survey-selection',
	backToList: 'Surveys',
	SWITCHED: 'switched',
	cls: 'content-editor survey',

	afterRender: function () {
		this.callParent(arguments);

		if (this.loading) {
			this.el.mask('Loading...');
		}
	},


	getItemList: function () {
		return this.bundle.getAllSurveys();
	},


	addCreateButton () {
		return this.add({
			xtype: 'box',
			autoEl: {tag: 'div', cls: 'create-assignment-overview-editing', html: t('create')},
			listeners: {
				click: {
					element: 'el',
					fn: this.createSurvey.bind(this)
				}
			}
		});
	},


	getSelectionFromRecord (record) {
		return this.bundle.getAllSurveys()
			.then(function (surveys) {
				const target = record.get('Target-NTIID');

				for (let survey of surveys) {
					if (survey.getId() === target) {
						return survey;
					}
				}
			});
	},


	async createSurvey () {
		if (!this.AssessmentActions) { return; }

		const {parentRecord, rootRecord, outlineNode} = this;

		if (this.el) {
			this.el.mask('Loading...');
		}

		try {
			const survey = await this.AssessmentActions.createSurveyIn(this.bundle);
			const ref = {
				MimeType: SurveyRef.mimeType,
				label: survey.get('title'),
				title: survey.get('title'),
				'Target-NTIID': survey.get('NTIID')
			};

			//Add the ref to the survey to the group
			await this.EditingActions.saveValues(ref, null, null, {parent: parentRecord, position: parentRecord.getItemsCount()}, rootRecord);

			//Navigate to the created survey
			const route = `/course/${encodeForURI(this.bundle.getId())}/lessons/${encodeForURI(outlineNode.getId())}/content/${encodeForURI(survey.getId())}/edit`;

			NavigationActions.pushRootRoute(null, route, {survey});
			this.doClose();
		} catch (e) {
			alert('Unable to create survey');
		} finally {
			if (this.el) {
				this.el.unmask();
			}
		}
	}
});
