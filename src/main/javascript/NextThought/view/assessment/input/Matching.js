Ext.define('NextThought.view.assessment.input.Matching',{
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-matchingpart-v3',

	requires: [
		'Ext.dd.DragZone',
		'Ext.dd.DropZone',
		'Ext.dd.StatusProxy'
	],


	//<editor-fold desc="Setup & Config">
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


		this.setupDragZones();
		this.setupDropZones();
	},
	//</editor-fold>


	//<editor-fold desc="Drag & Drop">
	getDragProxy: function(){
		var proxy = this.dragProxy;

		if (!proxy) {
			proxy = this.dragProxy = new Ext.dd.StatusProxy({
				cls: 'dd-matching-proxy-ghost',
				id: this.id + '-drag-status-proxy',
				constrain: true
				//repair : Ext.emptyFn <--to help debug
			});
		}
		return proxy;
	},


	setupDragZones: function() {
		var me = this;

		this.injectionSource.select('.drag').each(function(el) {
			var cfg,
				dragData,
				dragZone;

			cfg = {
				animRepair: true,
				proxy: me.getDragProxy(),

				getDragData: function(e) {
					var sourceEl = e.getTarget('.drag', 10), d;
					if (sourceEl) {
						d = sourceEl.cloneNode(true);
						d.id = Ext.id();
						return (dragData = {
							sourceEl: sourceEl,
							repairXY: Ext.fly(sourceEl).getXY(),
							ddel: d,
							matchOrdinal: sourceEl.getAttribute('data-match')
						});
					}
				},

				getRepairXY: function() {
					return this.dragData.repairXY;
				},

				onStartDrag: function() {
					var el = this.getProxy().getDragEl(),
						dx = Math.floor(el.getWidth()/2),
						dy = -Math.floor(el.getHeight()/2);

					// Center drag and drop proxy on cursor pointer
					this.setDelta(dx, dy);

					Ext.fly(dragData.sourceEl).addCls('dragging');
				},


				afterValidDrop: function(){
					Ext.fly(dragData.sourceEl).removeCls('dragging');
				},


				afterInvalidDrop: function(){
					Ext.fly(dragData.sourceEl).removeCls('dragging');
				}
			};

			dragZone = new Ext.dd.DragZone(el, cfg);
		});
	},


	setupDropZones: function() {

	},
	//</editor-fold>


	//<editor-fold desc="Grading">
	getValue: function() {},


	//	mark: function() {},


	markCorrect: function() {
		this.callParent();
	},


	markIncorrect: function() {
		this.callParent();
	},
	//</editor-fold>


	//<editor-fold desc="UI State">
	reset: function() {
		this.callParent();
	},


	editAnswer: function() {},


	getSolutionContent: function(part) {},


	hideSolution: function() {
		this.callParent();
	},
	//</editor-fold>


}, function(){
	if (isFeature('v3matching')) {
		this.addXtype('question-input-matchingpart');
	}
});
