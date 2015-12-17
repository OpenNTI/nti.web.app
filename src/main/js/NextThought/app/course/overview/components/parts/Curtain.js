Ext.define('NextThought.app.course.overview.components.parts.Curtain', {
	extend: 'Ext.Component',
	alias: 'widget.course-overview-curtain',

	requires: [
		'NextThought.model.resolvers.VideoPosters'
	],

	renderTpl: Ext.DomHelper.markup([{
		cls: 'curtain',
		cn: [{
			cls: 'ctr',
			cn: [{
				cls: 'play',
				cn: [{
					cls: 'blur-clip',
					cn: {
						cls: 'blur'
					}
				}, {
					cls: 'label',
					'data-qtip': '{{{NextThought.view.courseware.overview.parts.Videos.playtranscript}}}'
				}, {
					cls: 'launch-player',
					'data-qtip': '{{{NextThought.view.courseware.overview.parts.Videos.play}}}'
				}]
			}]
		}]
	}]),

	renderSelectors: {
		curtainEl: '.curtain',
		playBtnEl: '.curtain .play',
		playLabelEl: '.curtain .play .label',
		playBlurEl: '.curtain .play .blur'
	},

	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, this.video);
	},

	afterRender: function() {
		this.selectVideo();
		this.mon(this.curtainEl, 'click', this.onCurtainClicked.bind(this));
	},


	// Adds a videos attributes to the curtain
	selectVideo: function() {
		if (!this.rendered) {
			this.on('afterrender', this.selectVideo.bind(this));
			return;
		}

		var me = this,
			sources = me.video.sources || me.video.get('sources') || [],
			resolver = NextThought.model.resolvers.VideoPosters;

		Promise.all(
			sources.map(function(source) {
				var data;

				if (source.poster) {
					data = {
						poster: source.poster,
						thumbnail: source.thumbnail
					};
				} else {
					data = resolver.resolveForSource(source)
						.fail(function() {
							return null;
						});
				}

				return data;
			})
		).then(function(results) {
			return results.filter(function(result) {
				return !!result;
			})[0];
		}).then(function(data) {
			if (!data || !data.poster) { return; }

			var p = 'url(' + data.poster + ')';

			if (me.curtainEl) {
				// me.showCurtain();
				me.curtainEl.setStyle({
					backgroundImage: p
				});
				me.playBlurEl.setStyle({
					backgroundImage: p
				});
				me.playLabelEl.update(me.video.label || me.video.get('label'));

				me.playBtnEl.addCls('transcripts');
				me.curtainEl.addCls('transcripts');
				me.playLabelEl.dom.setAttribute('data-qtip', getString('NextThought.view.courseware.overview.parts.Videos.playtranscript'));
			}
		});

	},

	onCurtainClicked: function(e) {
		e.stopEvent();
		this.curtainClicked(e);
	}
});
