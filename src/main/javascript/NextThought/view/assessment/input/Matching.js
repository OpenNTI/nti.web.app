Ext.define('NextThought.view.assessment.input.Matching',{
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-matchingpart-v3',


	inputTpl: Ext.DomHelper.markup([
		{ cls: 'terms', cn:{ 'tag': 'tpl', 'for': 'terms', cn: [{
			cls: 'target term drag', 'data-match': '{[xindex]}', cn: [
				{ cls: 'match', 'data-term':'{.:htmlEncode}',  html: '{.}' },
			]}
		]}},

		{'tag': 'tpl', 'for': 'targets', cn: [{
			cls: 'target choice', 'data-target': '{[xindex]}', cn: [
				{ cls: 'match dropzone', 'data-term':'{parent.term:htmlEncode}',  html: '{parent.term}' },
				{ cls: 'text', html: '{.}' }
			]}
		]}
	]),


	renderSelectors: {
		injectionSource: '.terms'
	},


	initComponent: function() {
		this.callParent(arguments);

		var values = Ext.clone(this.part.get('values')),
			labels = Ext.clone(this.part.get('labels')),
			i = values.length-1,
			m = [],
			n = [];

		for (i; i >= 0; i--) {
			n.push(this.filterHTML(labels[i]));
			m.push(this.filterHTML(values[i]));
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			term: 'Term',//shold the question part define this string?
			terms: n.reverse(),
			targets: m.reverse()
		});

		this.on({'afterRender':{fn:'injectMatchTerms', buffer: 1}});
	},


	injectMatchTerms: function(){
		var s = this.injectionSource,
			el, ownerMain;
		if(this.questionSet){
			return;
		}
		ownerMain = this.up('assessment-question');
		el = ownerMain.getInsertionEl();
		this.injectionSource.appendTo(el);
		//ownerMain.updateLayout();
	},


	getValue: function() {},


	getSolutionContent: function(part) {},


	editAnswer: function() {},


	mark: function() {},


	markCorrect: function() {
		this.callParent();
	},


	markIncorrect: function() {
		this.callParent();
	},


	reset: function() {
		this.callParent();
	},


	hideSolution: function() {
		this.callParent();
	},

}, function(){
	if (isFeature('v3matching')) {
		this.addXtype('question-input-matchingpart');
	}
});
