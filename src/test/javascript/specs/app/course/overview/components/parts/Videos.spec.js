describe('Tests Videos on the overview', function () {
	var testBody, noop = function(){},
		slidedeckId = "tag:nextthought.com,2011-10:OU-NTISlideDeck-NTI-Test-Course:Slidedeck-Test",
		videos = {
			"tag:nextthought.com,2011-10:system-NT-Video-with-slidedeck": {
				Class: "Video",
				MimeType: "application/vnd.nextthought.ntivideo",
				NTIID: "tag:nextthought.com,2011-10:system-NT-Video-with-slidedeck",
				slidedeck: slidedeckId,
				sources: [{
					Class: "VideoSource",
					MimeType: "application/vnd.nextthought.ntivideosource",
					NTIID: "tag:nextthought.com,2011-10:system-OID-0x014dd4:5573657273",
					service: "kaltura",
					source: ["1500101:0_oh2n8z0b"],
					type: ["video/kaltura"]
				}],
				title: "Video With Slidedeck",
				transcripts: [{
					Class: "Transcript",
					NTIID: "tag:nextthought.com,2011-10:system-OID-0x014dd3:5573657273",
					src: "resources/Test-Course/45af12e9e9348e397bf91257741c98c28ca8ee55/90784fa2c5c148922446e05d45ff35f0aee3e69b.vtt",
					type: "text/vtt"
				}]
			},
			"tag:nextthought.com,2011-10:system-NT-Video-with-no-slidedeck": {
				Class: "Video",
				Title: "Test Video Without Slidedeck",
				MimeType: "application/vnd.nextthought.ntivideo",
				NTIID: 'tag:nextthought.com,2011-10:system-NT-Video-with-no-slidedeck',
				sources: [{
					Class: 'VideoSource',
					NTIID: "tag:nextthought.com,2011-10:system-OID-0x014dd4:5573657273",
					service: "kaltura",
					source: ["1600101:0_oh2n8z0b"],
					type: ["video/kaltura"]
				}],
				transcripts: [{
					Class: "Transcript",
					NTIID: "tag:nextthought.com,2011-10:system-OID-0x014dd3:5573657273",
					src: "resources/Test-Course/45af12e9e9348e397bf91257741c98c28ca8ee55/90784fa2c5c148922446e05d45ff35f0aee3e69b.vtt",
					type: "text/vtt"	
				}]
			},

			'tag:nextthought.com,2011-10:system-NT-Video-with-no-slidedeck-2': {
				Class: "Video",
				Title: "Test Video Without Slidedeck 2",
				MimeType: "application/vnd.nextthought.ntivideo",
				NTIID: 'tag:nextthought.com,2011-10:system-NT-Video-with-no-slidedeck-2',
				sources: [{
					Class: 'VideoSource',
					NTIID: "tag:nextthought.com,2011-10:system-OID-0x014dd4:5573657273",
					service: "kaltura",
					source: ["1600101:0_oh2n8z0b"],
					type: ["video/kaltura"]
				}],
				transcripts: [{
					Class: "Transcript",
					NTIID: "tag:nextthought.com,2011-10:system-OID-0x014dd3:5573657273",
					src: "resources/Test-Course/45af12e9e9348e397bf91257741c98c28ca8ee55/90784fa2c5c148922446e05d45ff35f0aee3e69b.vtt",
					type: "text/vtt"	
				}]
			}
		},
		course = Ext.create('NextThought.model.courses.CourseInstance', {NTIID: 'tag:nextthought.com,2011-10:system-NT-Test-Course-Catalongentry'});

	describe('Curtain click tests', function() {
		course.getVideoIndex = function() { return Promise.resolve(videos); };

		beforeEach(function(){
			//mock the testBody
			testBody = document.createElement("div");
			document.body.appendChild(testBody);
			jasmine.Clock.useMock();
		});

		afterEach(function(){
			document.body.removeChild(testBody);
		});

		it('tests that a click on launch player on regular video opens the video inline', function() {
			var overviewVideo = {
					label: "Test Video Without Slidedeck",
					ntiid: "tag:nextthought.com,2011-10:system-NT-Video-with-no-slidedeck",
					poster: "//www.kaltura.com/p/1500101/thumbnail/entry_id/0_qmfzskae/width/1280/",
					locationInfo: {}
				},
				e = {
					stopEvent: noop,
					getTarget: function(target){
						if (target === '.launch-player') {
							return true;
						}
						return false;
					} 
				}, videoCmp;

			videoCmp = Ext.create('NextThought.app.course.overview.components.parts.Videos', {
				course: course,
				items: [overviewVideo],
				renderTo: testBody
			});

			spyOn(videoCmp, 'getSelectedVideo').andCallFake(function(){
				var s = videoCmp.store;
				return s && s.findRecord('id', overviewVideo.ntiid);
			});

			spyOn(videoCmp, 'maybeCreatePlayer').andCallFake(noop);
			spyOn(videoCmp, 'navigateToTarget').andCallFake(noop);
			spyOn(videoCmp, 'navigateToSlidedeck').andCallFake(noop);

			jasmine.Clock.tick(2);

			videoCmp.onCurtainClicked(e);

			expect(videoCmp.maybeCreatePlayer).toHaveBeenCalled();
		});

		it('tests that a click on launch player on a slidedeck video opens the slidedeck', function() {
			var overviewVideo = {
					label: "Test Video With Slidedeck",
					ntiid: "tag:nextthought.com,2011-10:system-NT-Video-with-slidedeck",
					poster: "//www.kaltura.com/p/1500101/thumbnail/entry_id/0_qmfzskae/width/1280/",
					locationInfo: {}
				},
				e = {
					stopEvent: noop,
					getTarget: function(target){
						if (target === '.launch-player') {
							return true;
						}
						return false;
					} 
				}, videoCmp;

			videoCmp = Ext.create('NextThought.app.course.overview.components.parts.Videos', {
				course: course,
				items: [overviewVideo],
				renderTo: testBody
			});

			spyOn(videoCmp, 'getSelectedVideo').andCallFake(function(){
				var s = videoCmp.store;
				return s && s.findRecord('id', overviewVideo.ntiid);
			});

			spyOn(videoCmp, 'maybeCreatePlayer').andCallFake(noop);
			spyOn(videoCmp, 'navigateToTarget').andCallFake(noop);
			spyOn(videoCmp, 'navigateToSlidedeck').andCallFake(noop);

			jasmine.Clock.tick(2);

			videoCmp.onCurtainClicked(e);

			expect(videoCmp.navigateToSlidedeck).toHaveBeenCalledWith(slidedeckId);
		});

		it('tests that a click on the curtain opens the mediaviewer for a video with transcript', function() {
			var overviewVideo = {
					label: "Test Video Without Slidedeck 2",
					ntiid: "tag:nextthought.com,2011-10:system-NT-Video-with-no-slidedeck-2",
					poster: "//www.kaltura.com/p/1500101/thumbnail/entry_id/0_qmfzskae/width/1280/",
					locationInfo: {}
				},
				e = {
					stopEvent: noop,
					getTarget: function(target){
						if (target === '.launch-player') {
							return false;
						}
						return true;
					} 
				}, videoCmp, targetVideo;

			videoCmp = Ext.create('NextThought.app.course.overview.components.parts.Videos', {
				course: course,
				items: [overviewVideo],
				renderTo: testBody
			});

			spyOn(videoCmp, 'getSelectedVideo').andCallFake(function(){
				var s = videoCmp.store;
				return s && s.findRecord('id', overviewVideo.ntiid);
			});

			spyOn(videoCmp, 'maybeCreatePlayer').andCallFake(noop);
			spyOn(videoCmp, 'navigateToSlidedeck').andCallFake(noop);
			spyOn(videoCmp, 'navigateToTarget').andCallFake(function(videoRecord, basePath){
				targetVideo = videoRecord;
			});
			
			jasmine.Clock.tick(2);

			videoCmp.onCurtainClicked(e);

			expect(videoCmp.navigateToTarget).toHaveBeenCalled();
			expect(targetVideo.get('id')).toBe(overviewVideo.ntiid);
		});
	});
});