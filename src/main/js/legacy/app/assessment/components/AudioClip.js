var Ext = require('extjs');
var DomUtils = require('../../../util/Dom');


module.exports = exports = Ext.define('NextThought.app.assessment.components.AudioClip', {
	extend: 'Ext.Component',
	alias: 'widget.assessment-components-audio-clip',

	ui: 'assessment',
	cls: 'audio-clip',

	autoEl: 'button',

	childEls: ['audioEl'],

	renderTpl: Ext.DomHelper.markup({tag: 'audio', id: '{id}-audioEl', cn: {tag: 'tpl', 'for': 'sources', cn: [
			{tag: 'source', src: '{source}', type: '{type}'}
	]}
	}),


	renderSelectors: {
		lastSource: 'source:last-of-type'
	},


	beforeRender: function () {
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

		Ext.apply(this.renderData, {
			sources: this.domObject.querySelectorAll('object[type$=audiosource]').toArray()
							 .map(DomUtils.parseDomObject)
							 .map(trn)
							 .reduce(flatten, [])
		});

		return this.callParent(arguments);
	},


	initComponent: function () {
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


	toggle: function () {
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


	playing: function () { this.addCls('playing'); },
	stopped: function () { this.removeCls('playing'); },


	cannotPlay: function () {
		this.stopped();
		this.dead = true;
		this.addCls('noplay');
		this.el.set({
			title: 'Cannot play this audio clip.'
		});
	}
});
