Ext.define('NextThought.view.assessment.components.WordBank', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-components-wordbank',

	cls: 'wordbank',

	renderTpl: Ext.DomHelper.markup({ 'tag': 'tpl', 'for': 'entries', cn: [
		{
			cls: 'target wordentry drag {parent.unique:boolStr("unique")}',
			'data-wid': '{wid:htmlEncode}',
			'data-lang': '{lang:htmlEncode}',
			'data-word': '{word:htmlEncode}',
			'data-question': '{parent.question}',
			'data-part': '{parent.part}',
			cn: [{cls: 'reset'}, '{word}']
		}
	]}),


	beforeRender: function() {
		var bank = this.record.get('wordbank'),
			e = (bank && bank.get('entries')) || [],
			num = Ext.isNumber(this.partNumber) ? this.partNumber : undefined;

		Ext.apply(this.renderData, {
			unique: bank.get('unique'),
			part: num,
			question: this.questionId,
			entries: e.map(function(e) {return e.getData();})
		});

		return this.callParent(arguments);
	},


	afterRender: function() {
		this.callParent(arguments);
		this.setupDragging();
	},


	getDragProxy: function() {
		var proxy = this.dragProxy;

		if (!proxy) {
			proxy = this.dragProxy = new Ext.dd.StatusProxy({
				cls: 'dd-assessment-proxy-ghost',
				id: this.id + '-drag-status-proxy',
				repairDuration: 1000
				//repair : Ext.emptyFn <--to help debug
			});
		}
		return proxy;
	},


	setupDragging: function() {
		var cfg, me = this, z;

		cfg = {
			animRepair: true,
			proxy: this.getDragProxy(),

			getDragData: function(e) {
				var sourceEl = e.getTarget('.drag', 10), d;
				if (sourceEl) {
					d = sourceEl.cloneNode(true);
					d.id = Ext.id();
					return Ext.apply({
						sourceEl: sourceEl,
						repairXY: Ext.fly(sourceEl).getXY(),
						ddel: d
					}, sourceEl.dataset);
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
						dx = Math.floor(el.getWidth() / 2),
						dy = -Math.floor(el.getHeight() / 2);

				// Center drag and drop proxy on cursor pointer
				this.setDelta(dx, dy);

				data.sheild = Ext.DomHelper.insertFirst(co, {cls: 'sheild'}, true);
				Ext.getBody().addCls('dragging');
				Ext.fly(so).addCls('dragging');
			},

			onEndDrag: function(data) {
				Ext.destroy(data.sheild);
				Ext.getBody().removeCls('dragging');
				Ext.fly(data.sourceEl).removeCls('dragging');
			}
		};

		z = this.dragZones = [];
		this.el.select('.target.drag').each(function(e) {
			z.push(new Ext.dd.DragZone(e, cfg));
		});
	}
});
