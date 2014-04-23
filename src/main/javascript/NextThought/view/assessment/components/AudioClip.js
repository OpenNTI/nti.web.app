Ext.define('NextThought.view.assessment.components.AudioClip', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-components-audio-clip',

	ui: 'assessment',
	cls: 'audio-clip',

	autoEl: 'button',

	childEls: ['audioEl'],

	renderTpl: Ext.DomHelper.markup({tag: 'audio', id: '{id}-audioEl', cn: {tag: 'tpl', 'for': 'sources', cn: [
			{tag: 'source', 'data-service': '{service}', src: '{source}', type: '{type}'}
		]}
	}),


	renderSelectors: {
		lastSource: 'source:last-of-type'
	},


	beforeRender: function() {
		Ext.apply(this.renderData, {
			sources: this.domObject.querySelectorAll('object[type$=audiosource]').toArray().map(DomUtils.parseDomObject)
		});

		return this.callParent(arguments);
	},


	initComponent: function() {
		this.callParent(arguments);

		this.on({
			el: {
				click: 'toggle'
			},
			audioEl: {
				abort: 'stopped',
				emptied: 'stopped',
				ended: 'stopped',
				pause: 'stopped',
				play: 'playing'
			},
			lastSource: {
				error: 'cannotPlay'
			}
		});
	},


	toggle: function() {
		if (this.dead) {return;}

		var p = Ext.getDom(this.audioEl);
		if (p.paused) {
			this.addCls('playing');
			p.play();
		}
		else {
			p.load();
		}
		this.el.blur();
	},


	playing: function() { this.addCls('playing'); },
	stopped: function() { this.removeCls('playing'); },
	cannotPlay: function() { this.stopped(); this.dead = true; this.addCls('noplay'); }
});
