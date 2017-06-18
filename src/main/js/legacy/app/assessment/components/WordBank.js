const Ext = require('extjs');

const DomUtils = require('legacy/util/Dom');


module.exports = exports = Ext.define('NextThought.app.assessment.components.WordBank', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-components-wordbank',

	cls: 'wordbank',

	childEls: ['bodyEl'],

	renderTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'wordbank-body', id: '{id}-bodyEl',
		cn: { 'tag': 'tpl', 'for': 'entries', cn: [
			{
				cls: 'target wordentry drag {parent.unique:boolStr("unique")}',
				'data-wid': '{wid:htmlEncode}',
				'data-lang': '{lang:htmlEncode}',
				'data-question': '{parent.question}',
				'data-part': '{parent.part}',
				'data-word': '{word:htmlEncode}',
				cn: [{cls: 'reset'}, '{[this.parseWord(values, parent.ownerCmp)]}']
			}
		]}}), {
			parseWord: function (values, cmp) { return cmp.parseWordEntry(values.content || values.word); }
		}),


	audioTeplate: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'button', cls: 'x-component-assessment audio-clip', cn: {
			tag: 'audio', cn: {tag: 'tpl', 'for': 'sources', cn: [
				{tag: 'source', src: '{source}', type: '{type}'}
			]}
		}
	})),


	parseDomString: function (dom) {
		var a = document.createElement('div');

		a.id = 'tempdom';
		a.innerHTML = dom;

		return a;
	},


	parseWordEntry: function (word) {
		var d = this.parseDomString(word),
			tpl = this.audioTeplate,
			elements = d.querySelectorAll('object[type$=ntiaudio]');

		function trn (o) {
			if (o.service !== 'html5' || o.source.length !== o.type.length) {
				console.error('Bad audio source', o);
				return [];
			}

			var a = [], i = 0;
			for (i; i < o.source.length; i++) {
				a.push({
					source: o.source[i],
					type: o.type[i]
				});
			}

			return a;
		}

		function flatten (agg, v) { return agg.concat(v); }


		for (let x = elements.length - 1; x >= 0; x--) {
			const o = elements[x];
			tpl.insertAfter(o, {
				sources: o.querySelectorAll('object[type$=audiosource]').toArray()
							.map(DomUtils.parseDomObject)
							.map(trn)
							.reduce(flatten, [])});
			o.parentNode.removeChild(o);
		}

		elements = d.querySelectorAll('p');
		for (let x = elements.length - 1; x >= 0; x--) {
			const o = elements[x];
			const p = o.parentNode;
			const c = o.getChildren();
			if (c.length === 1) {
				p.insertBefore(c[0], o);
				p.removeChild(o);
			}
		}

		return d.innerHTML;
	},


	beforeRender: function () {
		var bank = this.record.get('wordbank'),
			e = (bank && bank.get('entries')) || [],
			num = Ext.isNumber(this.partNumber) ? this.partNumber : undefined;

		Ext.apply(this.renderData, {
			unique: bank && bank.get('unique'),
			part: num,
			ownerCmp: this,
			question: this.questionId,
			entries: e.map(et => et.getData())
		});

		return this.callParent(arguments);
	},


	afterRender: function () {
		this.callParent(arguments);
		this.setupAudioClips();
		this.setupDragging();
		this.setupScrollLock();
	},


	lockWordBank: function (xy, left, refEl) {
		if (this.wordbankLocked) {return;}
		this.wordbankLocked = true;

		this.el.setHeight(this.el.getHeight());//lock it in.
		this.bodyEl.setWidth(this.el.getWidth());

		var body = this.bodyEl;

		body.setStyle({
			position: 'fixed',
			left: xy[0] + 'px',
			top: Ext.fly(refEl).getY() + 'px',
			zIndex: 10
		});

		body.addCls('locked');

		function onResize () {
			if (body.getStyle('position', true) !== 'fixed' || !body.dom) {return;}

			var refXY = Ext.fly(refEl).getXY();
			body.setStyle('left', (refXY[0] + left) + 'px');
		}

		Ext.EventManager.onWindowResize(onResize, window);

		this.wordbankLocked = function () {
			Ext.EventManager.removeResizeListener(onResize, window);
		};
	},


	unlockWordBank: function () {
		if (!this.wordbankLocked) {return;}
		if (Ext.isFunction(this.wordbankLocked)) {
			this.wordbankLocked();
		}

		this.wordbankLocked = false;

		this.bodyEl.removeCls('locked');
		this.bodyEl.setStyle({
			position: undefined,
			left: undefined,
			top: undefined
		});
	},


	onWordBankScroll: function (ev, scrollingEl) {
		var xy = this.el.getXY(),
			refXY = Ext.fly(scrollingEl).getXY(),
			diffY = xy[1] - refXY[1],
			diffX = xy[0] - refXY[0],
			foot;

		if (diffY <= 0) {
			this.lockWordBank(xy, diffX, scrollingEl);
		} else {
			this.unlockWordBank();
		}

		try {
			foot = this.up().down('question-parts').items.last().getY();

			if (this.bodyEl.getY() < foot) {
				this.bodyEl.show();
			} else {
				this.bodyEl.hide();
			}
		} catch (e) {
			console.error(e.stack || e.message || e);
		}
	},


	setupScrollLock: function () {
		var reader = this.reader;
		if (!reader || this.up('question-parts') || this.question.get('parts').length === 1) {
			return;
		}

		this.mon(reader, {
			'scroll': 'onWordBankScroll'
		});
	},


	setupAudioClips: function () {
		var me = this;

		function toggle (e) {
			e.stopEvent();
			var el = e.getTarget(),
				p = el.querySelector('audio');

			if (p.paused) { p.play(); }
			else { p.load(); }
			el.blur();
		}


		function playing (e) { e.getTarget('button.audio-clip', 0, true).addCls('playing'); }
		function stopped (e) { e.getTarget('button.audio-clip', 0, true).removeCls('playing'); }


		function cannotPlay (e) {
			var el = e.getTarget('button.audio-clip', 0, true);
			el.addCls('noplay');
			el.set({
				title: 'Cannot play this audio clip.'
			});
		}



		this.el.select('audio').each(function (audio) {
			me.mon(audio, {
				abort: stopped,
				emptied: stopped,
				ended: stopped,
				pause: stopped,
				play: playing
			});
			me.mon(audio.down('source:last-of-type'), { error: cannotPlay });
			me.mon(audio.parent(), { click: toggle });
			Ext.getDom(audio).load();
		});
	},


	getItem: function (wid) {
		if (!this.rendered) {
			Ext.Error.raise('Not rendered.');
		}

		return Ext.getDom(this.el.select('.wordentry[data-wid="' + wid + '"]').first());
	},


	getDragProxy: function () {
		var proxy = this.dragProxy;

		if (!proxy) {
			proxy = this.dragProxy = new Ext.dd.StatusProxy({
				cls: 'dd-assessment-proxy-ghost',
				id: this.id + '-drag-status-proxy',
				repairDuration: 1000
				//repair : Ext.emptyFn <--to help debug
			});
			this.on('destroy', 'destroy', proxy);
		}
		return proxy;
	},


	setupDragging: function () {
		var cfg, me = this;

		cfg = {
			animRepair: true,
			proxy: this.getDragProxy(),

			afterRepair: function () { this.dragging = false; }, //override to stop the flash

			getDragData: function (e) {
				var sourceEl = e.getTarget('.drag'), d;
				if (sourceEl && !e.getTarget('.used') && !me.up('assessment-question').submitted) {
					d = document.createElement('div');
					d.className = sourceEl.className;
					Ext.DomHelper.append(d, {cls: 'reset'});
					Ext.DomHelper.append(d, sourceEl.dataset.word);

					return Ext.apply({
						sourceEl: sourceEl,
						repairXY: Ext.fly(sourceEl).getXY(),
						ddel: d
					}, sourceEl.dataset);
				}
			},

			getRepairXY: function () {
				return this.dragData.repairXY;
			},

			onBeforeDrag: function () {
				return !me.submitted;
			},

			onStartDrag: function () {
				var data = this.dragData,
					co = Ext.fly(data.sourceEl).up('.component-overlay'),
					so = data.sourceEl,
					el = this.getProxy().getDragEl(),
					dx = Math.floor(el.getWidth() / 2),
					dy = -Math.floor(el.getHeight() / 2);

				if (!Ext.isIE10m) {
					// Center drag and drop proxy on cursor pointer
					this.setDelta(dx, dy);
				}

				data.shield = Ext.DomHelper.insertFirst(co, {cls: 'shield'}, true);
				Ext.getBody().addCls('dragging');
				Ext.fly(so).addCls('dragging');
			},

			onEndDrag: function (data) {
				if (data.shield) {
					data.shield.remove();
					delete data.shield;
				}
				Ext.getBody().removeCls('dragging');
				Ext.fly(data.sourceEl).removeCls('dragging');
			}
		};

		this.dd = new Ext.dd.DragZone(this.bodyEl, cfg);
		this.on('destroy', 'destroy', this.dd);
	}
});
