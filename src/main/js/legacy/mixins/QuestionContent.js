const Ext = require('extjs');

require('legacy/app/assessment/components/AudioClip');
require('legacy/app/assessment/components/Sequence');
require('legacy/app/assessment/components/WordBank');
require('legacy/model/assessment/wordbank/WordEntry');
require('legacy/model/assessment/AssessedPart');
require('legacy/model/assessment/AssessedQuestion');
require('legacy/model/assessment/AssessedQuestionSet');
require('legacy/model/assessment/AssessmentItemContainer');
require('legacy/model/assessment/Assignment');
require('legacy/model/assessment/AssignmentPart');
require('legacy/model/assessment/AssignmentSubmission');
require('legacy/model/assessment/AssignmentSubmissionPendingAssessment');
require('legacy/model/assessment/DictResponse');
require('legacy/model/assessment/FilePart');
require('legacy/model/assessment/FillInTheBlankShortAnswerPart');
require('legacy/model/assessment/FillInTheBlankShortAnswerSolution');
require('legacy/model/assessment/FillInTheBlankWithWordBankPart');
require('legacy/model/assessment/FillInTheBlankWithWordBankQuestion');
require('legacy/model/assessment/FillInTheBlankWithWordBankSolution');
require('legacy/model/assessment/FreeResponsePart');
require('legacy/model/assessment/FreeResponseSolution');
require('legacy/model/assessment/HTMLHint');
require('legacy/model/assessment/Hint');
require('legacy/model/assessment/LatexSymbolicMathSolution');
require('legacy/model/assessment/MatchingPart');
require('legacy/model/assessment/MatchingSolution');
require('legacy/model/assessment/MathPart');
require('legacy/model/assessment/MathSolution');
require('legacy/model/assessment/ModeledContentPart');
require('legacy/model/assessment/MultipleChoiceMultipleAnswerPart');
require('legacy/model/assessment/MultipleChoiceMultipleAnswerSolution');
require('legacy/model/assessment/MultipleChoicePart');
require('legacy/model/assessment/MultipleChoiceSolution');
require('legacy/model/assessment/NumericMathPart');
require('legacy/model/assessment/NumericMathSolution');
require('legacy/model/assessment/OrderingPart');
require('legacy/model/assessment/OrderingSolution');
require('legacy/model/assessment/Part');
require('legacy/model/assessment/Poll');
require('legacy/model/assessment/PollSubmission');
require('legacy/model/assessment/Question');
require('legacy/model/assessment/QuestionBank');
require('legacy/model/assessment/QuestionMap');
require('legacy/model/assessment/QuestionSet');
require('legacy/model/assessment/QuestionSetSubmission');
require('legacy/model/assessment/QuestionSubmission');
require('legacy/model/assessment/RandomizedQuestionSet');
require('legacy/model/assessment/Response');
require('legacy/model/assessment/SingleValuedSolution');
require('legacy/model/assessment/Solution');
require('legacy/model/assessment/Survey');
require('legacy/model/assessment/SurveySubmission');
require('legacy/model/assessment/SymbolicMathPart');
require('legacy/model/assessment/SymbolicMathSolution');
require('legacy/model/assessment/TextHint');
require('legacy/model/assessment/TextResponse');
require('legacy/model/assessment/UsersCourseAssignmentSavepoint');
require('legacy/model/assessment/UsersCourseAssignmentSavepointItem');
require('legacy/model/assessment/UsersCourseInquiryItem');
require('legacy/model/assessment/UsersCourseInquiryItemResponse');

const {guidGenerator} = require('legacy/util/Globals');


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
