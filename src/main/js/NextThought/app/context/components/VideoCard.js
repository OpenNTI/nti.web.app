Ext.define('NextThought.app.context.components.VideoCard', {
	extend: 'NextThought.app.context.components.Card',
	alias: 'widget.context-video-card',

	videoPlayerTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{ cls: 'curtain context-video-curtain', cn: [
			{ cls: 'ctr', cn: [
				{ cls: 'play', cn: [
					{cls: 'blur-clip', cn: {cls: 'blur'}},
					{ cls: 'label', 'data-qtip': 'Play' }
				]}
			]}
		]}
	])),


	CARD_SIZE: 330,


	setContent: function () {
		var content = this.__buildVideoPosterElement(this.video);

		if (content) {
			this.targetEl.appendChild(content);
		}
	},

	__buildVideoPosterElement: function(video) {
		var d = document.createElement('div'),
			t = this.videoPlayerTpl.append(d), o, 
			src = video && video.get('sources')[0].poster;

		o = Ext.fly(t).setStyle({
				backgroundImage: 'url(' + src + ')',
				backgroundSize: this.CARD_SIZE + 'px',
				backgroundPosition: '0 0'
			});

		return o.dom;
	}
});