export default Ext.define('NextThought.app.context.components.list.Video', {
	extend: 'NextThought.app.context.components.list.Content',
	alias: 'widget.context-video-list',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'icon'},
		{cn: [
			{cls: 'location'},
			{cls: 'context video-context', cn: [
				{cls: 'snippet text', cn: [
					{tag: 'img', cls: 'video-thumbnail'},
					{cls: 'video-title'}
				]}
			]}
		]}
	]),


	renderSelectors: {
		iconEl: '.icon',
		locationEl: '.location',
		snippetEl: '.snippet',
		videoImgEl: '.video-thumbnail',
		videoTitleEl: '.video-title'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.video, 'resolved-poster', this.setPoster.bind(this));

		this.setPoster();

		this.videoTitleEl.update(this.video.get('title'));
	},


	setPoster: function() {
		if (!this.videoImgEl) { return; }

		var poster = this.video.get('poster');

		this.videoImgEl.dom.setAttribute('src', poster);
	},


	setLineage: function(path) {
		if (!this.rendered) {
			this.on('afterrender', this.setLineage.bind(this, path));
			return;
		}

		var root = path[0],
			leaf = path[1];

		this.pathTpl.append(this.locationEl, {
			leaf: leaf && leaf.getTitle && leaf.getTitle(),
			root: root && root.getTitle && root.getTitle()
		});
	}
});
