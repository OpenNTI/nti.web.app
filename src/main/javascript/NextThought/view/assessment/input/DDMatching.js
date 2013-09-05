Ext.define('NextThought.view.assessment.input.DDMatching',{
	extend: 'NextThought.view.assessment.input.Base',
//	alias: 'widget.question-input-matchingpart',

	require:[
		'Ext.dd.DragZone',
		'Ext.dd.DropZone',
		'Ext.dd.DragSource',
		'Ext.dd.DropTarget',
		'Ext.dd.StatusProxy'
	],

	inputTpl: Ext.DomHelper.markup({ cls: 'dd-matching', cn:[
		{'tag':'tpl', 'for': 'matches', cn:[{
			cls: 'match', cn:[
				{ cls: 'control'},
				{ cls: 'label-part', cn:[
					{tag:'span', cls:'placeholder', html:'Term'}
				]},
				{ cls: 'value-part', 'data-part':'{[xindex-1]}', cn:[
					{ cls: 'text', html:'{value}' }
				]}
			]}
		]}
	]}),


	solTpl: Ext.DomHelper.createTemplate({
		cls: 'matching-solution',
		cn: [{ tag:'span', html:'{0}'},{tag: 'span', cls: 'solution-matching-text', html:'{1}'}]
	}).compile(),


	labelTpl: Ext.DomHelper.createTemplate({
		tag:'span', cls:'dd-label-token', 'data-part':'{1}', cn:[
			{tag:'span', cls: 'value', html:'{0}' },
			{tag:'span', cls:'x'}
		]
	}).compile(),


	labelsTpm: Ext.DomHelper.createTemplate({ cls:'labels', html:'{0}' }).compile(),


	renderSelectors: {
		valueEl: '.match .value-part',
		labelEl: '.match .label-part'
	},


	initComponent: function(){
		this.callParent(arguments);

		var values = Ext.clone(this.part.get('values')),
			labels = Ext.clone(this.part.get('labels')),
			i=0, m = [], me = this;

		for(i; i < values.length; i++){
			m.push({
				value: me.filterHTML(values[i])
			});
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			matches: m
		});
	},


	afterRender: function(){
		this.callParent(arguments);

		var me = this;

		this.injectLabels();
	},

	handleClick: function(e){
		var t = e.getTarget('.x',null,true),
			p = t ? t.up('.dd-label-token') : null,
			l = p ? p.up('.label-part') : null, tid;
		if( t && p ){
			console.log('clicked label token');
			tid = p.getAttribute('data-part');
			p.remove();
			l.removeCls('matched');
			this.showLabelToken(tid);
			e.stopEvent();
		}
	},

	showLabelToken: function(tokenId){
		var q = this.up('assessment-question'),
			l = q.el.down('.labels .dd-label-token[data-part='+tokenId+']');

		if(l){l.show();}
	},

	injectLabels: function(){
		var labels = this.filterHTML(Ext.clone(this.part.get('labels'))),
			q = this.up('assessment-question'),
			qBodyPart = q && q.getLayout().getRenderTarget(),
			tpl = this.labelTpl,
			out = [];

		if(!qBodyPart) {
			this.mon(q,'afterlayout',this.injectLabels,this,{single:true});
			return;
		}

		Ext.each(labels, function(l, i){
			out.push(tpl.apply([l, i]));
		});

		out = out.join('');
		Ext.DomHelper.append(qBodyPart, this.labelsTpm.apply([out]));
		q.updateLayout();

		q.el.select('.labels .dd-label-token').setVisibilityMode(Ext.dom.Element.VISIBILITY);

		//Now we can start the dragging process.
		this.initializeDragZone();
		this.initializeDropZone();
		this.mon(this.el.select('.label-part'), 'click', this.handleClick, this);
	},


	getValue: function(){
		var val = {};

		this.el.select('.match').each(function(e){
			var p1 = e.down('.label-part'),
				labelIndex, valueIndex,
				p2 = e.down('.value-part');

			p1 = p1 && p1.down('.dd-label-token');
			labelIndex = p1 && parseInt(p1.getAttribute('data-part'), 10);
			valueIndex = p2 && parseInt(p2.getAttribute('data-part'), 10);
			if(labelIndex >= 0 ){
				val[labelIndex] = valueIndex;
			}
		});
		return val;
	},



	getSolutionContent: function(part) {
		var values = Ext.clone(this.part.get('values')),
			labels = Ext.clone(this.part.get('labels')),
			out = [], tpl = this.solTpl;


		values = this.filterHTML(values);
		labels = this.filterHTML(labels);
		Ext.each(part.get('solutions'),function(s){
			var x = s.get('value'), i, valueIndex;

			for(i in x){
				if(x.hasOwnProperty(i)){
					i = parseInt(i, 10);
					valueIndex = x[i];
					out.push( tpl.apply( [labels[i], values[valueIndex]]));
				}
			}
		});

		return out.join('');
	},


	mark: function(){
		var s = this.part.get('solutions')[0],
			c = s.get('value'),
			values = Ext.clone(this.part.get('values')),
			labels = Ext.clone(this.part.get('labels'));

		this.getEl().select('.match').removeCls(['correct','incorrect']);

		Ext.each(this.getEl().query('.match'),function(match){
			var l = Ext.fly(match).down('.label-part'), labelIndex, d, valueIndex, cls;

			l = l && l.down('.dd-label-token');
			labelIndex = l && parseInt(l.getAttribute('data-part'),10);
			d = Ext.fly(match).down('.value-part');
			valueIndex = d && parseInt(d.getAttribute('data-part'), 10);
			cls = (labelIndex >= 0 && valueIndex === c[labelIndex]) ? 'correct' : 'incorrect';
			Ext.fly(match).addCls(cls);
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
		var q = this.up('assessment-question');

		q.el.select('.dd-label-token').show();
		this.el.select('.dd-label-token').remove();
		this.el.select('.label-part').removeCls('matched');
		this.el.select('.match').removeCls(['correct','incorrect']);

		this.callParent();
	},


	editAnswer: function(){
		if(this.submitted){
			this.up('assessment-question').reset();
			this.disableSubmission();
		}
	},


	initializeDragZone: function(){
		var me = this,
			proxy = new Ext.dd.StatusProxy({
				id: me.el.id + '-drag-status-proxy',
				constrain: true
			}),
			q = this.up('assessment-question');

		me.dragZone = new Ext.dd.DragZone(q.getEl(), {
			getDragData: function(e){
				var sourceEl = e.getTarget(me.self.DDSELECTOR, undefined, true), d;

				//We want to make it un-draggable when it's in a grade mode.
				if(e.getTarget('.correct') || e.getTarget('.incorrect')){
					sourceEl = null;
				}

				if(sourceEl){
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
				return this.dragData.sourceEl.getXY();
			},

			repairHighlightColor: "ffffff",

			afterInvalidDrop: function(){
				var s = this.dragData.sourceEl;
				s.show();
			},


			animRepair: true,

			proxy: proxy,

			onStartDrag: function(){
				var el = this.getProxy().el.down(me.self.DDSELECTOR),
					s = this.dragData.sourceEl,
					w = s.getWidth() + 'px',
					h = s.getHeight() + 'px';

				// Center drag and drop proxy on cursor pointer
				this.setDelta(0, 20);

				if(el){
					el.setStyle( {
						'width': w,
						'height': h
					});
				}

				s.hide();

			}
		});
	},

	initializeDropZone: function(){
		var me = this;
		this.dropZone = new Ext.dd.DropZone(this.getEl(), {
			getTargetFromEvent: function(e) {
				return e.getTarget('.match', null, true);
			},
			onNodeEnter: function(target, dd, e, data){
				var p = !target.is('.match') ? target.up('.match') : target;

				if(p){
					Ext.fly(p).addCls('target-hover');
				}
			},
			onNodeOut: function(target, dd, e, data){
				var p = !target.is('.match') ? target.up('.match') : target;

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

			onNodeDrop: function(target, dd, e, data){
				var m = target.down('.label-part'),
					d = dd.dragData.ddel, tid, t,
					isDraggedFromSource = !Boolean(dd.dragData.sourceEl.up('.match')), sp;

				if(!isDraggedFromSource){
					sp = dd.dragData.sourceEl.up('.label-part');
					sp.removeCls('matched');
					dd.dragData.sourceEl.remove();
				}

				if(Ext.fly(m).down('.dd-label-token')){
					//Before we drop a new token, make sure we move back the previous token.
					t = Ext.fly(m).down('.dd-label-token');
					tid = t && t.getAttribute('data-part');
					t.remove();
					t.removeCls('matched');
					me.showLabelToken(tid);
				}
				m.addCls('matched');
				m.dom.appendChild(d);

				Ext.defer(function(){
					me.updateLayout();
					me.syncElementHeight();
				}, 1);


				if(me.submissionDisabled && me.shouldEnableSubmission()){
					me.enableSubmission();
				}
				return true;
			}
		});
	},


	shouldEnableSubmission: function(){
		var ml = this.el.select('.label-part.matched').elements.length,
			l = this.el.select('.label-part').elements.length;

		//NOTE: Every entry needs to be matched before you can submit a question.
		return ml === l;
	},

	statics:{
		'DDSELECTOR': '.dd-label-token'
	}


});