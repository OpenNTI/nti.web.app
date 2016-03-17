export default Ext.define('NextThought.mixins.QuestionContent', {
	requires: [
		'NextThought.app.assessment.components.AudioClip',
		'NextThought.app.assessment.components.Sequence',
		'NextThought.app.assessment.components.WordBank',
		'NextThought.model.assessment.wordbank.WordEntry',
		'NextThought.model.assessment.AssessedPart',
		'NextThought.model.assessment.AssessedQuestion',
		'NextThought.model.assessment.AssessedQuestionSet',
		'NextThought.model.assessment.AssessmentItemContainer',
		'NextThought.model.assessment.Assignment',
		'NextThought.model.assessment.AssignmentPart',
		'NextThought.model.assessment.AssignmentSubmission',
		'NextThought.model.assessment.AssignmentSubmissionPendingAssessment',
		'NextThought.model.assessment.DictResponse',
		'NextThought.model.assessment.FilePart',
		'NextThought.model.assessment.FillInTheBlankShortAnswerPart',
		'NextThought.model.assessment.FillInTheBlankShortAnswerSolution',
		'NextThought.model.assessment.FillInTheBlankWithWordBankPart',
		'NextThought.model.assessment.FillInTheBlankWithWordBankQuestion',
		'NextThought.model.assessment.FillInTheBlankWithWordBankSolution',
		'NextThought.model.assessment.FreeResponsePart',
		'NextThought.model.assessment.FreeResponseSolution',
		'NextThought.model.assessment.HTMLHint',
		'NextThought.model.assessment.Hint',
		'NextThought.model.assessment.LatexSymbolicMathSolution',
		'NextThought.model.assessment.MatchingPart',
		'NextThought.model.assessment.MatchingSolution',
		'NextThought.model.assessment.MathPart',
		'NextThought.model.assessment.MathSolution',
		'NextThought.model.assessment.ModeledContentPart',
		'NextThought.model.assessment.MultipleChoiceMultipleAnswerPart',
		'NextThought.model.assessment.MultipleChoiceMultipleAnswerSolution',
		'NextThought.model.assessment.MultipleChoicePart',
		'NextThought.model.assessment.MultipleChoiceSolution',
		'NextThought.model.assessment.NumericMathPart',
		'NextThought.model.assessment.NumericMathSolution',
		'NextThought.model.assessment.OrderingPart',
		'NextThought.model.assessment.OrderingSolution',
		'NextThought.model.assessment.Part',
		'NextThought.model.assessment.Poll',
		'NextThought.model.assessment.PollSubmission',
		'NextThought.model.assessment.Question',
		'NextThought.model.assessment.QuestionBank',
		'NextThought.model.assessment.QuestionMap',
		'NextThought.model.assessment.QuestionSet',
		'NextThought.model.assessment.QuestionSetSubmission',
		'NextThought.model.assessment.QuestionSubmission',
		'NextThought.model.assessment.RandomizedQuestionSet',
		'NextThought.model.assessment.Response',
		'NextThought.model.assessment.SingleValuedSolution',
		'NextThought.model.assessment.Solution',
		'NextThought.model.assessment.Survey',
		'NextThought.model.assessment.SurveySubmission',
		'NextThought.model.assessment.SymbolicMathPart',
		'NextThought.model.assessment.SymbolicMathSolution',
		'NextThought.model.assessment.TextHint',
		'NextThought.model.assessment.TextResponse',
		'NextThought.model.assessment.TimedAssignment',
		'NextThought.model.assessment.UsersCourseAssignmentSavepoint',
		'NextThought.model.assessment.UsersCourseAssignmentSavepointItem',
		'NextThought.model.assessment.UsersCourseInquiryItem',
		'NextThought.model.assessment.UsersCourseInquiryItemResponse',
	],

	typeToComponent: {
		//'text/html': 'NextThought.view.assessment.components.Base',
		'application/vnd.nextthought.ntiaudio': 'assessment-components-audio-clip',
		'application/vnd.nextthought.contentsequence': 'assessment-components-sequence',
		'application/vnd.nextthought.naqwordbank': 'assessment-components-wordbank'
	},

	contentComponents: [],
	contentComponentsToRender: [],

	parseDomString: function(dom) {
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
	buildContent: function(dom, dontRender) {
		if (Ext.isString(dom)) {
			dom = this.parseDomString(dom);
		}

		function topLevelOnly(o) {
			var p = o.parentNode;
			if (p && p.nodeName === 'OBJECT') { return false; }
			return p ? topLevelOnly(p) : true;
		}

		dom = Ext.getDom(dom);

		var me = this,
			objects = dom.querySelectorAll('object').toArray().filter(topLevelOnly);

		me.contentComponents = [];
		me.contentComponentsToRender = [];

		objects.forEach(function(object) {
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
	renderContentComponents: function() {
		var me = this;

		me.contentComponentsToRender.forEach(function(component) {
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
	addObject: function(type, config, create) {
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


	destroyContent: function() {
		Ext.destroy(this.contentComponents);
	}
});
