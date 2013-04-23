Ext.define('NextThought.view.assessment.input.Matching',{
	extend: 'NextThought.view.assessment.input.Base',
	alias: 'widget.question-input-matchingpart',

	require:[
		'Ext.dd.DragZone',
		'Ext.dd.DropZone',
		'Ext.dd.DragSource',
		'Ext.dd.DropTarget',
		'Ext.dd.StatusProxy'
	],

	inputTpl: Ext.DomHelper.markup({ cls: 'dragzone', cn:[
		{'tag':'tpl', 'for': 'matches', cn:[{
			cls: 'match', cn:[
				{ cls: 'label', 'data-part':'{[xindex-1]}', html:'{[String.fromCharCode(64+xindex)]}.' },
				{ cls: 'draggable-area', 'data-match':'{[xindex-1]}', cn:[
					{ tag: 'span', cls: 'control'},
					{ cls: 'text', html:'{.}' }
				]}
			]}
		]}
	]}),


	solTpl: Ext.DomHelper.createTemplate({
		cls: 'matching-solution',
		cn: [{ tag:'span', html:'{0}.'},{tag: 'span', cls: 'solution-matching-text', html:'{1}'}]
	}).compile(),


	renderSelectors: {
		draggableEl: '.match .draggable-area',
		floaterEl: '.floater',
		dragzoneEl: '.dragzone'
	},


	initComponent: function(){
		this.callParent(arguments);

		var me = this;
		this.matches = Ext.clone(this.part.get('values'));
		this.renderData = Ext.apply(this.renderData || {}, {
			matches: me.matches
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.initializeDragZone(this);
		this.initializeDropZone();

		this.dragzoneEl.dom.id = Ext.id();
	},


	getValue: function(){
		var val = {};

		this.el.select('.match').each(function(e){
			var p1 = e.down('.label'),
				p2 = e.down('.draggable-area');

			p1 = p1 && parseInt(p1.getAttribute('data-part'), 10);
			p2 = p2 && parseInt(p2.getAttribute('data-match'), 10);
			if(!Ext.isEmpty(p1) && !Ext.isEmpty(p2)){
				val[p1] = parseInt(p2);
			}
		});
		console.log('match question values: ', val);
		return val;
	},


	getSolutionContent: function(part) {
		var m = this.matches,
			out = [], tpl = this.solTpl;

		Ext.each(part.get('solutions'),function(s){
			var x = s.get('value'), i;

			for(i in x){
				if(x.hasOwnProperty(i)){
					i = parseInt(i);
					out.push( tpl.apply( [String.fromCharCode(65+i), m[x[i]]]));
				}
			}
		});

		return out.join('');
	},


	editAnswer: function(){
		if(this.submitted){
			this.up('assessment-question').reset();
			this.disableSubmission();
		}
	},


	mark: function(){
		var s = this.part.get('solutions')[0],
			c = s.get('value');

		this.getEl().select('.match').removeCls(['correct','incorrect']);

		Ext.each(this.getEl().query('.match'),function(e){
			var l = Ext.fly(e).down('.label'),
				x = parseInt(l.getAttribute('data-part'),10),
				d = Ext.fly(e).down('.draggable-area'),
				m = parseInt(d.getAttribute('data-match'), 10),
				cls = c[x]=== m ?'correct':'incorrect';

			d.addCls(cls);
		});
	},


	markCorrect: function(){
		this.callParent();
		this.mark();
	},


	markIncorrect: function(){
		this.callParent();
		this.mark();
	},


	reset: function(){
		this.el.select('.match .draggable-area').removeCls(['correct','incorrect']);
		this.resetOrder();
		this.callParent();
	},


	resetOrder: function(){
		var draggableParts = this.el.select('.match .draggable-area');
		this.quickSort(draggableParts.elements);
	},


	quickSort: function(a){
		/**
		 * @adaptation of the quick sort algorithm found at http://en.literateprograms.org/Quicksort_(JavaScript)
		 * While  we could easily do the swapping with a basic sort algorithm or remove all the items and add them again in order, and the performance would still be great,
		 * since the size of the set is small,
		 * it's good to use this algorithm and hopefully reduce the number of comparison and swaps we need to do.
		 */
		function qsort(a, begin, end){
			var pivot;
			if(begin < end){
				pivot = begin + Math.floor(Math.random()*(end-begin));

				pivot = partition(a, begin, end, pivot);
				qsort(a, begin, pivot);
				qsort(a, pivot+1, end);
			}
		}

		function partition(a, begin, end, pivot){
			var p = parseInt(a[pivot].getAttribute('data-match')),
				s, i, t;

			me.swap(p, end-1);
			s = begin;
			for(i=begin; i<end-1; i++){
				t = parseInt(a[i].getAttribute('data-match'));
				if(t <= p){
					me.swap(p, end-1);
					s++;
				}
			}

			me.swap(end-1, s);
			return s;
		}

		var me = this;
		qsort(a, 0, a.length);
	},


	swap: function(a, b){
		if(a === b){ return; }
		var ad = this.el.down('.draggable-area[data-match='+a+']'),
			bd = this.el.down('.draggable-area[data-match='+b+']'),
			ap = ad.up('.match'),
			bp = bd.up('.match');

		console.log('Will swap draggable parts of index: ', a, ' ', b);
		ap.select('.draggable-area').remove();
		bp.select('.draggable-area').remove();
		ap.dom.appendChild(bd.dom);
		bp.dom.appendChild(ad.dom);
	},


	swapNodes: function(target, dd){
		var sourceDom = dd.dragData.ddel,
			targetParent = target.up('.match', null, true),
			d, sourceEl,
			a = sourceDom.getAttribute('data-match'),
			b = target.getAttribute('data-match');

		Ext.fly(sourceDom).removeCls('selected');
		Ext.fly(targetParent).removeCls('target-hover');

		this.swap(a, b);

		//Make sure we enable the submit button, since the user has started dragging.
		if(this.submissionDisabled){
			this.enableSubmission();
		}

		return true;
	},


	initializeDragZone: function(){
		var me = this,
			proxy = new Ext.dd.StatusProxy({
			id: me.el.id + '-drag-status-proxy',
			animRepair: true,
			constrain: true
		});

		me.dragZone = new Ext.dd.DragZone(me.getEl(), {
			getDragData: function(e){
				var sourceEl = e.getTarget('.draggable-area', undefined, true), d;

				if(sourceEl){
					sourceEl.addCls('selected');
					d = sourceEl.dom.cloneNode(true);
					d.id = Ext.id();

					me.dragData = {
						ddel: d,
						sourceEl: sourceEl,
						repairXY: Ext.fly(sourceEl.getXY())
					};
					return me.dragData;
				}
			},
			getRepairXY: function(){
				return this.dragData.repairXY;
			},

			proxy: proxy,

			onStartDrag: function(){
				//NOTE: We only want to drag vertically
				this.setXConstraint(0,0);
				// Center drag and drop proxy on cursor pointer
				this.setDelta(0, 40);
			}
		});
	},

	initializeDropZone: function(){
		var me = this;
		this.dropZone = new Ext.dd.DropZone(this.getEl(), {
			getTargetFromEvent: function(e) {
				return e.getTarget('.draggable-area', null, true);
			},
			onNodeEnter: function(target, dd, e, data){
				var p = target.up('.match');

			 	if(p){
				    Ext.fly(p).addCls('target-hover');
			    }
			},
			onNodeOut: function(target, dd, e, data){
				var p = target.up('.match');
				if(p){ Ext.fly(p).removeCls('target-hover'); }
			},
			onNodeOver: function(target, dd, e, data){
				if(target.dom === dd.dragData.sourceEl.dom){
					return false;
				}

				// NOTE: We could also swap onNodeOver however it doesn't feel right.
//				Ext.defer(me.swapNodes, 250, me, [target, dd]);
				return Ext.dd.DropZone.prototype.dropAllowed;
			},

			onNodeDrop: function(target, dd, e, data){ me.swapNodes(target, dd); }
		});
	}
});
