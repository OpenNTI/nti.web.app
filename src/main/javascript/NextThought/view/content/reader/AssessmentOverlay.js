Ext.define('NextThought.view.content.reader.AssessmentOverlay', {

	requires: [
		'NextThought.view.assessment.Question'
	],

	constructor: function(){
		this.on({
			scope: this,
			'content-updated': this.clearAssessments,
			'afterRender': this.insertAssessmentOverlay
		});

		this.activeAssessments = {};
	},


	insertAssessmentOverlay: function(){
		var container = Ext.DomHelper.append(this.getInsertionPoint('innerCt'), { cls:'assessment-overlay' }, true);
		this.on('destroy' , function(){ container.remove(); });
		this.assessmentOverlay = container;
	},


	clearAssessments: function(){
		var active = this.activeAssessments;
		this.activeAssessments = {};

		Ext.Object.each(active,function(k, v){
			delete active[k];
			v.destroy();
		});
	},


	injectAssessments: function(items){
		//nothing to do.
		if(!items || items.length < 1){
			return;
		}

		//TODO: Remove all content based submit buttons
		new Ext.dom.CompositeElement(
			this.getDocumentElement().querySelectorAll('.x-btn-submit,[onclick^=NTISubmitAnswers]')).remove();

		Ext.Array.sort(items, function(ar,br){
			var a = ar.getId();
			var b = br.getId();
			return ( ( a === b ) ? 0 : ( ( a > b ) ? 1 : -1 ) );
		});

		var me = this,
			c = this.assessmentOverlay;

		Ext.each(items,function(q){
			me.activeAssessments[q.getId()] = Ext.widget({
				xtype: 'assement-question',
				reader: me,
				question: q,
				renderTo: c,
				contentElement: me.getAssessmentElement('object','data-ntiid', q.getId())
			});
		});
	},


	getAssessmentElement: function(tagName, attribute, value){
		var doc = this.getDocumentElement();
		var tags = doc.getElementsByTagName(tagName);
		var i = tags.length-1;
		var vRe = new RegExp( '^'+RegExp.escape( value )+'$', 'ig');

		for(;i>=0; i--){
			if(vRe.test(tags[i].getAttribute(attribute))){
				return tags[i];
			}
		}

		return null;
	}




}, function(){
	//class defined callback, this = Class

});
