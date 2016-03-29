var Ext = require('extjs');
var ComponentsAudioClip = require('../app/assessment/components/AudioClip');
var ComponentsSequence = require('../app/assessment/components/Sequence');
var ComponentsWordBank = require('../app/assessment/components/WordBank');
var WordbankWordEntry = require('../model/assessment/wordbank/WordEntry');
var AssessmentAssessedPart = require('../model/assessment/AssessedPart');
var AssessmentAssessedQuestion = require('../model/assessment/AssessedQuestion');
var AssessmentAssessedQuestionSet = require('../model/assessment/AssessedQuestionSet');
var AssessmentAssessmentItemContainer = require('../model/assessment/AssessmentItemContainer');
var AssessmentAssignment = require('../model/assessment/Assignment');
var AssessmentAssignmentPart = require('../model/assessment/AssignmentPart');
var AssessmentAssignmentSubmission = require('../model/assessment/AssignmentSubmission');
var AssessmentAssignmentSubmissionPendingAssessment = require('../model/assessment/AssignmentSubmissionPendingAssessment');
var AssessmentDictResponse = require('../model/assessment/DictResponse');
var AssessmentFilePart = require('../model/assessment/FilePart');
var AssessmentFillInTheBlankShortAnswerPart = require('../model/assessment/FillInTheBlankShortAnswerPart');
var AssessmentFillInTheBlankShortAnswerSolution = require('../model/assessment/FillInTheBlankShortAnswerSolution');
var AssessmentFillInTheBlankWithWordBankPart = require('../model/assessment/FillInTheBlankWithWordBankPart');
var AssessmentFillInTheBlankWithWordBankQuestion = require('../model/assessment/FillInTheBlankWithWordBankQuestion');
var AssessmentFillInTheBlankWithWordBankSolution = require('../model/assessment/FillInTheBlankWithWordBankSolution');
var AssessmentFreeResponsePart = require('../model/assessment/FreeResponsePart');
var AssessmentFreeResponseSolution = require('../model/assessment/FreeResponseSolution');
var AssessmentHTMLHint = require('../model/assessment/HTMLHint');
var AssessmentHint = require('../model/assessment/Hint');
var AssessmentLatexSymbolicMathSolution = require('../model/assessment/LatexSymbolicMathSolution');
var AssessmentMatchingPart = require('../model/assessment/MatchingPart');
var AssessmentMatchingSolution = require('../model/assessment/MatchingSolution');
var AssessmentMathPart = require('../model/assessment/MathPart');
var AssessmentMathSolution = require('../model/assessment/MathSolution');
var AssessmentModeledContentPart = require('../model/assessment/ModeledContentPart');
var AssessmentMultipleChoiceMultipleAnswerPart = require('../model/assessment/MultipleChoiceMultipleAnswerPart');
var AssessmentMultipleChoiceMultipleAnswerSolution = require('../model/assessment/MultipleChoiceMultipleAnswerSolution');
var AssessmentMultipleChoicePart = require('../model/assessment/MultipleChoicePart');
var AssessmentMultipleChoiceSolution = require('../model/assessment/MultipleChoiceSolution');
var AssessmentNumericMathPart = require('../model/assessment/NumericMathPart');
var AssessmentNumericMathSolution = require('../model/assessment/NumericMathSolution');
var AssessmentOrderingPart = require('../model/assessment/OrderingPart');
var AssessmentOrderingSolution = require('../model/assessment/OrderingSolution');
var AssessmentPart = require('../model/assessment/Part');
var AssessmentPoll = require('../model/assessment/Poll');
var AssessmentPollSubmission = require('../model/assessment/PollSubmission');
var AssessmentQuestion = require('../model/assessment/Question');
var AssessmentQuestionBank = require('../model/assessment/QuestionBank');
var AssessmentQuestionMap = require('../model/assessment/QuestionMap');
var AssessmentQuestionSet = require('../model/assessment/QuestionSet');
var AssessmentQuestionSetSubmission = require('../model/assessment/QuestionSetSubmission');
var AssessmentQuestionSubmission = require('../model/assessment/QuestionSubmission');
var AssessmentRandomizedQuestionSet = require('../model/assessment/RandomizedQuestionSet');
var AssessmentResponse = require('../model/assessment/Response');
var AssessmentSingleValuedSolution = require('../model/assessment/SingleValuedSolution');
var AssessmentSolution = require('../model/assessment/Solution');
var AssessmentSurvey = require('../model/assessment/Survey');
var AssessmentSurveySubmission = require('../model/assessment/SurveySubmission');
var AssessmentSymbolicMathPart = require('../model/assessment/SymbolicMathPart');
var AssessmentSymbolicMathSolution = require('../model/assessment/SymbolicMathSolution');
var AssessmentTextHint = require('../model/assessment/TextHint');
var AssessmentTextResponse = require('../model/assessment/TextResponse');
var AssessmentTimedAssignment = require('../model/assessment/TimedAssignment');
var AssessmentUsersCourseAssignmentSavepoint = require('../model/assessment/UsersCourseAssignmentSavepoint');
var AssessmentUsersCourseAssignmentSavepointItem = require('../model/assessment/UsersCourseAssignmentSavepointItem');
var AssessmentUsersCourseInquiryItem = require('../model/assessment/UsersCourseInquiryItem');
var AssessmentUsersCourseInquiryItemResponse = require('../model/assessment/UsersCourseInquiryItemResponse');
var {guidGenerator} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.mixins.QuestionContent', {
	typeToComponent: {
		//'text/html': 'NextThought.view.assessment.components.Base',
		'application/vnd.nextthought.ntiaudio': 'assessment-components-audio-clip',
		'application/vnd.nextthought.contentsequence': 'assessment-components-sequence',
		'application/vnd.nextthought.naqwordbank': 'assessment-components-wordbank'
	},

	contentComponents: [],
	contentComponentsToRender: [],

	parseDomString: function (dom) {
		var a = document.createElement('div');

		a.id = 'tempdom';
		a.innerHTML = dom;

		return a;
	},

	/**
	 * Takes the content of a question/part and returns the string to be inserted into the dom
	 * @param  {String|Element} dom the string or element of the question content
	 * @param  {bool} dontRender the element mixing in will hanldle it
	 * @return {String} the html string of the content
	 */
	buildContent: function (dom, dontRender) {
		if (Ext.isString(dom)) {
			dom = this.parseDomString(dom);
		}

		function topLevelOnly (o) {
			var p = o.parentNode;
			if (p && p.nodeName === 'OBJECT') { return false; }
			return p ? topLevelOnly(p) : true;
		}

		dom = Ext.getDom(dom);

		var me = this,
			objects = dom.querySelectorAll('object').toArray().filter(topLevelOnly);

		me.contentComponents = [];
		me.contentComponentsToRender = [];

		objects.forEach(function (object) {
			var type = object.getAttribute('type'),
				placeholder,
				container = object.parentNode,
				id = guidGenerator(),
				added;
			try {
				added = me.addObject(type, {
					renderTo: id,
					domObject: object,
					reader: me.reader,
					record: me.part || me.question,
					question: me.question,
					questionId: me.question && me.question.getId(),
					ownerCt: me
				}, me.rendered && !dontRender);
			} catch (e) {
				added = true;
			}

			if (added) {
				placeholder = document.createElement('div');
				placeholder.setAttribute('id', id);

				container.insertBefore(placeholder, object);
				container.removeChild(object);
			}
		});

		if (!me.rendered && !dontRender) {
			me.on('afterrender', 'renderContentComponents');
		}

		//once we are destroyed clean up the components
		me.on('destroy', 'destroyContent');

		return dom.innerHTML;
	},

	/**
	 * Takes the configs for the components we need to render and creates them
	 * @return {Undefined}	no return value
	 */
	renderContentComponents: function () {
		var me = this;

		me.contentComponentsToRender.forEach(function (component) {
			me.addObject(null, component, true);
		});

		me.contentComponentsToRender = [];
	},

	/**
	 * Takes the config for a component and either creates it or adds it to a a list to be created.
	 * @param {String}	type	the data-type attribute of the object element
	 * @param {Object} config	the config to pass to the component
	 * @param {bool} create		whether or not to create the element or add it to the list of things to be created
	 * @return {bool} whether or not we have a component for the type
	 */
	addObject: function (type, config, create) {
		var placeholderEl, parent,
			name = config.compName || (type && this.typeToComponent[type]);

		if (!name) {
			console.error('Unsupported question content type:', type, config);
			return false;
		}

		//if we are suppose to create it create it and add the component to the list
		if (create) {
			placeholderEl = Ext.getDom(config.renderTo);
			parent = placeholderEl.parentNode;
			this.contentComponents.push(Ext.widget(name, config));

			while (placeholderEl.lastChild) {
				parent.insertBefore(placeholderEl.lastChild, placeholderEl);
			}
			parent.removeChild(placeholderEl);

		} else {
			//if we are suppose to wait just add the config to the toRender list
			config.compName = name;
			this.contentComponentsToRender.push(config);
		}

		return true;
	},

	destroyContent: function () {
		Ext.destroy(this.contentComponents);
	}
});
