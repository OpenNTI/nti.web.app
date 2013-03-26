describe("Dom.js Tests",function(){
	var testBody, DomUtil;
	
	beforeEach(function(){
		DomUtil = NTITestUtils.newInstanceOfSingleton(NextThought.util.dom);
		testBody = document.createElement('div');
		document.body.appendChild(testBody);
	});

	afterEach(function(){
		document.remove(testBody);
	});

	describe("getVideosFromDom",function(){
		var result, videoObject = {
			'url' : 'www.youtube.com',
			'thumbnail' : 'image.jpeg'
		};
		videoContainer = document.createElement('object');
		videoContainer.className("videoContainer");
		video = document.createElement('object');
		video.className('naqvideo');
		firstParam = document.createElement('param');
		firstParam.name = 'url';
		firstParam.value = 'www.youtube.com';
		secondParam = document.createElement('param');
		secondParam.name = 'thumbnail';
		secondParam.value = 'image.jpeg';

		video.appendChild(firstParam);
		video.appendChild(secondParam);
		videoContainer.appendChild(video); 

		result = DomUtil.getVideoFromDom(videoContainer);

		expect(result).toBe(videoObject);
	});
})
