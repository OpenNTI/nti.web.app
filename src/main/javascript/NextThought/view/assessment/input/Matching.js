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
			cls: 'target term drag', 'data-match': '{[xindex-1]}', cn: [
				{ cls: 'match', 'data-term':'{.:htmlEncode}',  cn:[{cls:'reset'},'{.}'] }
			]}
		]}},

		{'tag': 'tpl', 'for': 'targets', cn: [{
			cls: 'target choice', 'data-target': '{[xindex-1]}', cn: [
				{ cls: 'match dropzone', 'data-term':'{parent.term:htmlEncode}',  html: '{parent.term}' },
				{ cls: 'text', html: '{.}' }
			]}
		]}
	]),


	renderSelectors: {
		shelfEl: '.terms'
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
		var s = this.shelfEl,
			el, ownerMain;
		if(this.questionSet){
			return;
		}
		ownerMain = this.up('assessment-question');
		el = ownerMain.getInsertionEl();
		this.shelfEl.appendTo(el);
		//ownerMain.updateLayout();

		this.setupDragging();
		this.setupDropZone();
	},
	//</editor-fold>


	//<editor-fold desc="Drag & Drop">
	getDragProxy: function(){
		var proxy = this.dragProxy;

		if (!proxy) {
			proxy = this.dragProxy = new Ext.dd.StatusProxy({
				cls: 'dd-matching-proxy-ghost',
				id: this.id + '-drag-status-proxy',
				repairDuration: 1000
				//repair : Ext.emptyFn <--to help debug
			});
		}
		return proxy;
	},


	setupDragging: function() {
		var cfg, me = this,
			el = this.up().getEl(), z;

		cfg = {
			animRepair: true,
			proxy: this.getDragProxy(),

			getDragData: function(e) {
				var sourceEl = e.getTarget('.drag', 10), d;
				if (sourceEl) {
					d = sourceEl.cloneNode(true);
					d.id = Ext.id();
					return {
						sourceEl: sourceEl,
						repairXY: Ext.fly(sourceEl).getXY(),
						ddel: d,
						matchOrdinal: sourceEl.getAttribute('data-match')
					};
				}
			},

			getRepairXY: function() {
				return this.dragData.repairXY;
			},

			onBeforeDrag: function() {
				return !me.submitted;
			},

			onStartDrag: function() {
				var data = this.dragData,
					co = Ext.fly(data.sourceEl).up('.component-overlay'),
					so = data.sourceEl,
					el = this.getProxy().getDragEl(),
					dx = Math.floor(el.getWidth()/2),
					dy = -Math.floor(el.getHeight()/2);

				// Center drag and drop proxy on cursor pointer
				this.setDelta(dx, dy);

				data.sheild = Ext.DomHelper.insertFirst(co, {cls:'sheild'}, true);
				Ext.getBody().addCls('dragging');
				Ext.fly(so).addCls('dragging');
			},

			onEndDrag: function(data){
				Ext.destroy(data.sheild);
				Ext.getBody().removeCls('dragging');
				Ext.fly(data.sourceEl).removeCls('dragging');
//			},
//
//			afterValidDrop: function(){
//			},
//
//			afterInvalidDrop: function(){
			}
		};

		z = this.dragZones = [];
		this.shelfEl.select('.target.drag').each(function(e) {
			z.push( new Ext.dd.DragZone(e, cfg) );
		});
	},


	setupDropZone: function() {

		function moveTerm(el, to){
			var p = el.parentNode,
				doc = p && (p.ownerDocument || p.documentElement) || document,
				term = p && p.getAttribute('data-term');
			if (p === Ext.getDom(to)) {
				return;
			}

			if (p.childNodes.length === 1 && !Ext.isEmpty(term)) {
				p.appendChild(doc.createTextNode(term));
			}

			to.appendChild(el);

			me.maybeChangeSubmitButtonState();
		}


		function resetTerm(e) {
			var toReset = e.getTarget('.target.drag');
			if (toReset) {
				moveTerm(toReset, me.shelfEl);
			}
		}

		var id = this.id,
			me = this,
			common = {
				//<editor-fold desc="Boilerplate">
				// If the mouse is over a target node, return that node. This is provided as the "target" parameter in all "onNodeXXXX" node event
				// handling functions
				getTargetFromEvent: function(e) { return e.getTarget('.target.choice') || e.getTarget('.terms'); },

				// On entry into a target node, highlight that node.
				onNodeEnter : function(target, dd, e, data){ Ext.fly(target).addCls('drop-hover'); },

				// On exit from a target node, unhighlight that node.
				onNodeOut : function(target, dd, e, data){ Ext.fly(target).removeCls('drop-hover'); },

				// While over a target node, return the default drop allowed
				onNodeOver : function(target, dd, e, data){ return Ext.dd.DropZone.prototype.dropAllowed; }
				//</editor-fzold>
			},
			dropOnAnswer = {
				onNodeDrop : function(target, dd, e, data){

					var t = Ext.fly(target).down('.dropzone',true),
							c = t && t.childNodes,
							n = c && c[0];

					if (!c || c.length > 1) { //problems
						return false;
					}

					if (Ext.isTextNode(n)) {
						t.removeChild(n);
					}

					if (n === data.sourceEl){
						return true;
					}

					if (n && !Ext.isTextNode(n)) {
						me.shelfEl.appendChild(n);
					}

					moveTerm(data.sourceEl,t);

					return true;
				}
			},
			dropOnShelf = {
				onNodeDrop : function(target, dd, e, data){
					moveTerm(data.sourceEl, Ext.get(target));
					return true;
				}
			};


		this.mon(this.shelfEl.select('.target.drag .reset'), 'click', resetTerm);


		this.dropZones = [
			new Ext.dd.DropZone(this.inputBox, Ext.apply(dropOnAnswer,common)),
			new Ext.dd.DropZone(this.shelfEl, Ext.apply(dropOnShelf,common))
		];
	},
	//</editor-fold>


	//<editor-fold desc="Grading">
	getValue: function() {
		var val = {};

		function int(e,i){ return e && parseInt(e.getAttribute(i),10); }

		this.el.select('.choice').each(function(e) {
			val[int(e,'data-target')] = int(e.down('.term'),'data-match');
		});

		return val;
	},


	setValue: function(value) {
		var q = '.term',
			terms = this.shelfEl.query(q).concat(this.inputBox.query(q));


		function int(e,i) { return e && parseInt(e.getAttribute(i),10); }

		function toMap(ar,attr) {
			var m = {};
			Ext.each(ar,function(e){ m[e.getAttribute(attr)] = e; });
			return m;
		}

		function s(bucket) {
			var key = int(bucket, 'data-target'),
				t = terms[value[key]];

			bucket = Ext.getDom(bucket.down('.dropzone'));
			if (Ext.isTextNode(bucket.firstChild)) {
				bucket.removeChild(bucket.firstChild);
			}

			if (t) {
				bucket.appendChild(t);
			} else {
				console.warn('Unexpected scenario... no term for bucket found: key:',key, 'map', terms);
			}
		}

		console.log('set:',value);
		terms = toMap(terms,'data-match');
		this.inputBox.select('.choice').each(s);
	},


	mark: function() {
		var s = this.part.get('solutions')[0],
			c = s.get('value'), i = 0, me = this,
			values = Ext.clone(this.part.get('values')),
			labels = Ext.clone(this.part.get('labels'));

		function int(e,i){ return e && parseInt(e.getAttribute(i),10); }

		function m(e) {
			var key = int(e,'data-target'),
				value = int(Ext.fly(e).down('.term'),'data-match'),
				cls = (key === i && value === c[i]) ? 'correct' : 'incorrect';
			e.down('.dropzone').addCls('graded');
			e.addCls(cls);
			console.log('marking:', key, i, value, c[i], cls);
			i++;
		}

		this.getEl().select('.choice').removeCls('correct incorrect').each(m);

		Ext.defer(function() {
			me.updateLayout();
			me.syncElementHeight();
		}, 1);
	},


	markCorrect: function() {
		this.callParent();
		this.mark();
	},


	markIncorrect: function() {
		this.callParent();
		this.mark();
	},
	//</editor-fold>


	//<editor-fold desc="UI State">
	maybeChangeSubmitButtonState: function() {
		var allInPlay = !this.shelfEl.down('.term');
		this[(allInPlay ? 'en':'dis')+'ableSubmission']();
	},


	reset: function() {
		var el = this.getEl();

		function r(e) {
			var p = Ext.getDom(e).parentNode,
				doc = p && (p.ownerDocument || p.documentElement) || document,
				term = p && p.getAttribute('data-term');
			if( p && !Ext.isEmpty(term) ){
				p.appendChild(doc.createTextNode(term));
			}
		}

		el.select('.choice').removeCls('correct incorrect');
		el.select('.choice .dropzone').removeCls('graded').each(r);
		el.select('.choice .dropzone .term').appendTo(this.shelfEl);
		this.callParent();
	},


	getSolutionContent: function(part) {
		return '';
	}


	//</editor-fold>


}, function(){
	if (isFeature('v3matching')) {
		this.addXtype('question-input-matchingpart');
	}
});
