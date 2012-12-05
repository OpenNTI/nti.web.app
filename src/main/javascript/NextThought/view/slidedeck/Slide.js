Ext.define('NextThought.view.slidedeck.Slide',{
	extend: 'Ext.container.Container',
	alias: 'widget.slidedeck-slide'

/* Copy/Paste Email:

	On Wednesday, December 5, 2012 at 1:18 PM, Sean Jones wrote:

	Based on several off-line discussions here is a revised skeleton:

	The external video div is not repeated per slide and is located before any related slides in the content.
	<div class="externalvideo" id="nti video id">
		<iframe width="640" height="360" src="video url" frameborder="0" allowfullscreen="true" ></iframe>
	</div>

	<object type="application/vnd.nextthought.slide" data-ntiid="slide ntiid">
		<param name="slidetitle" value="Slide Title">
		<param name="slideimage" value="image url">
		<param name="slidevideo" value="youtube | vimeo video id"> (optional)
		<param name="slidevideotype" value="youtube | vimeo"> (optional)
		<param name="slidevideoid" value="nti video id"> (optional)
		<param name="slidevideothumb" value="video thumb image url"\> (optional)
		<param name="slidevideostart" value="video start time"\> (optional)
		<param name="slidevideoend" value="video end time"> (optional)

		<span itemprop="nti-data-markupenabled nti-data-resizeable">
			<img crossorigin="anonymous" src="url" id="image id" alt="some alt text"
					style="width=640px;height=480px;"
					data-nti-image-size="half"
					data-nti-image-full="full url"
					data-nti-image-half="half url"
					data-nti-image-quarter="quarter url" />
		</span>
	<\object>
*/
});
