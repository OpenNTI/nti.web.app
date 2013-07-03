// http://www.webrtc.org/
// https://code.google.com/p/webrtc-samples/source/browse/trunk/apprtc/
// adapter.js

var WebRTC = function() {

	// peer connection constraints that must be set by the client

	this.offerConstraints = {};
	this.mediaConstraints = {};
	this.pcConstraints = {};
	this.pcConfig = {};

	// we want audio and video by default

	this.sdpConstraints = {
		'mandatory': {
			'OfferToReceiveAudio': true,
			'OfferToReceiveVideo':true
		}
	};

	// assuming single p2p for now, make it an array to scale

	this.localStream = undefined;
	this.remoteStream = undefined;
	this.peerConnection = undefined;

	// user defined callbacks when a stream becomes available or goes away

	this.onIceCandidate = undefined;
	this.onRemoteStreamAdded = undefined;
	this.onRemoteStreamRemoved = undefined;

	// session events occur when a call or answer is successful
	// and passes the sessionDescription as a param

	this.onSessionEvent = undefined;
};

// browser specific properties and methods

if (navigator.mozGetUserMedia) {
	WebRTC.isAvailable= true;
	WebRTC.browser = "firefox";

	WebRTC.PeerConnection = mozRTCPeerConnection;
	WebRTC.SessionDescription = mozRTCSessionDescription;
	WebRTC.IceCandidate = mozRTCIceCandidate;

	WebRTC.prototype.getUserMedia = navigator.mozGetUserMedia.bind(navigator);

	// utilities

	WebRTC.prototype.attachMediaStream = function(element, stream) {
		element.mozSrcObject = stream;
		element.play();
	};
	WebRTC.prototype.reattachMediaStream = function(to, from) {
		to.mozSrcObject = from.mozSrcObject;
		to.play();
	};

	// Fake get{Video,Audio}Tracks ~ used below

	MediaStream.prototype.getVideoTracks = function() {
		return [];
	};

	MediaStream.prototype.getAudioTracks = function() {
		return [];
	};

} else if (navigator.webkitGetUserMedia) {
	WebRTC.isAvailable= true;
	WebRTC.browser = "chrome";

	WebRTC.PeerConnection = webkitRTCPeerConnection;
	WebRTC.SessionDescription = RTCSessionDescription;
	WebRTC.IceCandidate = RTCIceCandidate;

	WebRTC.prototype.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

	// utilities

	WebRTC.prototype.attachMediaStream = function(element, stream) {
		element.src = webkitURL.createObjectURL(stream);
	};
	WebRTC.prototype.reattachMediaStream = function(to, from) {
		to.src = from.src;
	};

	// unify differences between M26 and earlier versions of chrome

	if (!webkitMediaStream.prototype.getVideoTracks) {
		webkitMediaStream.prototype.getVideoTracks = function() {
			return this.videoTracks;
		};
		webkitMediaStream.prototype.getAudioTracks = function() {
			return this.audioTracks;
		};
	}
	if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
		webkitRTCPeerConnection.prototype.getLocalStreams = function() {
			return this.localStreams;
		};
		webkitRTCPeerConnection.prototype.getRemoteStreams = function() {
			return this.remoteStreams;
		};
	}

} else {
	WebRTC.isAvailable= false;
}

// instance methods

WebRTC.prototype.openAVConnection = function(options) {
	var me = this;
	this.getUserMedia({
		'audio':true,
		'video':this.mediaConstraints
	}, function(stream) {
		me.localStream = stream;
		if (options.success) options.success.apply(this,arguments);
	}, options.error);
}

WebRTC.prototype.closeAVConnection = function() {
	if (this.localStream) {
		this.localStream.stop();
		this.localStream = null;
	}
}

WebRTC.prototype.initializePeerConnection = function() {
	var constraints = this.pcConstraints;
	var config = this.pcConfig;

	if (WebRTC.browser == "firefox") { // Force IP STUN for Firefox
		config = {"iceServers":[{"url":"stun:23.21.150.121"}]};
	}

	var pc = new WebRTC.PeerConnection(config, constraints);

	pc.onicecandidate = this.bindContext(this._onIceCandidate, this);
	pc.onaddstream = this.bindContext(this._onRemoteStreamAdded, this);
	pc.onremovestream = this.bindContext(this._onRemoteStreamRemoved, this);

	pc.addStream(this.localStream);
	this.peerConnection = pc;
}

WebRTC.prototype.terminatePeerConnection = function() {
	this.peerConnection.close();
	this.peerConnection = null;

	// what else does this fire,
	// and do we want to null out the remoteStream?
	this.remoteStream = null;
}

WebRTC.prototype.setRemoteDescription = function(sdpString) {
	this.peerConnection.setRemoteDescription(new WebRTC.SessionDescription(sdpString));
}

WebRTC.prototype.addIceCandidate = function(candidate) {
	this.peerConnection.addIceCandidate(candidate);
}

WebRTC.prototype.isConnected = function() {
	return (this.peerConnection &&
		this.localStream &&
		this.remoteStream);
}

// Custom peer connection callbacks which also call into user defined hooks

WebRTC.prototype._onIceCandidate = function(event) {
	if (this.onIceCandidate) {
		this.onIceCandidate.apply(this,arguments);
	}
}

WebRTC.prototype._onRemoteStreamAdded = function(event) {
	this.remoteStream = event.stream;
	if (this.onRemoteStreamAdded) {
		this.onRemoteStreamAdded.apply(this,arguments);
	}
}

WebRTC.prototype._onRemoteStreamRemoved = function(event) {
	if (this.onRemoteStreamRemoved) {
		this.onRemoteStreamRemoved.apply(this,arguments);
		this.remoteStream = null; // not firing
	}
}

// begin or answer a peer connection

WebRTC.prototype.callPeer = function() {
	var constraints = this.adjustConstraints(this.offerConstraints);
	var callback = this.bindContext(this._onSessionEvent, this);
	this.peerConnection.createOffer(callback, null, constraints);
}

WebRTC.prototype.answerPeer = function() {
	var callback = this.bindContext(this._onSessionEvent, this);
	this.peerConnection.createAnswer(callback, null, this.sdpConstraints);
}

WebRTC.prototype._onSessionEvent = function(sessionDescription) {
	sessionDescription.sdp = this.preferOpus(sessionDescription.sdp);
	this.peerConnection.setLocalDescription(sessionDescription);
	if (this.onSessionEvent) {
		this.onSessionEvent.apply(this,arguments);
	}
}

// Utility to merge A/V constraints when initiating peer connection

WebRTC.prototype.adjustConstraints = function(constraints) {
	// temporary measure to remove Moz* constraints in Chrome
	if (WebRTC.browser === "chrome") {
		for (prop in constraints.mandatory) {
			if (prop.indexOf("Moz") != -1) {
				delete constraints.mandatory[prop];
			}
		}
	}
	constraints = this.mergeConstraints(constraints, this.sdpConstraints);
	return constraints;
}

WebRTC.prototype.mergeConstraints = function(cons1, cons2) {
	var merged = cons1;
	for (var name in cons2.mandatory) {
		merged.mandatory[name] = cons2.mandatory[name];
	}
	merged.optional.concat(cons2.optional);
	return merged;
}

// Utility to support method callbacks that retain this

WebRTC.prototype.bindContext = function(func, context) {
	return function() {
		return func.apply(context,arguments);
	}
}

// Utilities to mute/unmute the local a/v stream

WebRTC.prototype.toggleLocalMute = function(mute) {
	var videoTracks = this.localStream.getVideoTracks();
	var audioTracks = this.localStream.getAudioTracks();
	for (i = 0; i < videoTracks.length; i++) {
		if (mute === undefined) videoTracks[i].enabled = !videoTracks[i].enabled;
		else videoTracks[i].enabled = !mute;
	}
	for (i = 0; i < audioTracks.length; i++) {
		if (mute === undefined) audioTracks[i].enabled = !audioTracks[i].enabled;
		else audioTracks[i].enabled = !mute;
	}
}

// prefer audio codec opus jujitsu
// directly from google sample source code

// Set Opus as the default audio codec if it's present.
WebRTC.prototype.preferOpus = function(sdp) {
	var sdpLines = sdp.split('\r\n');

	// Search for m line.
	for (var i = 0; i < sdpLines.length; i++) {
		if (sdpLines[i].search('m=audio') !== -1) {
			var mLineIndex = i;
			break;
		}
	}
	if (mLineIndex === null)
		return sdp;

	// If Opus is available, set it as the default in m line.
	for (var i = 0; i < sdpLines.length; i++) {
		if (sdpLines[i].search('opus/48000') !== -1) {
			var opusPayload = this.extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
			if (opusPayload)
				sdpLines[mLineIndex] = this.setDefaultCodec(sdpLines[mLineIndex], opusPayload);
			break;
		}
	}

	// Remove CN in m line and sdp.
	sdpLines = this.removeCN(sdpLines, mLineIndex);

	sdp = sdpLines.join('\r\n');
	return sdp;
}

WebRTC.prototype.extractSdp = function(sdpLine, pattern) {
	var result = sdpLine.match(pattern);
	return (result && result.length == 2)? result[1]: null;
}

// Set the selected codec to the first in m line.
WebRTC.prototype.setDefaultCodec = function(mLine, payload) {
	var elements = mLine.split(' ');
	var newLine = new Array();
	var index = 0;
	for (var i = 0; i < elements.length; i++) {
		if (index === 3) // Format of media starts from the fourth.
			newLine[index++] = payload; // Put target payload to the first.
		if (elements[i] !== payload)
			newLine[index++] = elements[i];
	}
	return newLine.join(' ');
}

// Strip CN from sdp before CN constraints is ready.
WebRTC.prototype.removeCN = function(sdpLines, mLineIndex) {
	var mLineElements = sdpLines[mLineIndex].split(' ');
	// Scan from end for the convenience of removing an item.
	for (var i = sdpLines.length-1; i >= 0; i--) {
		var payload = this.extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
		if (payload) {
			var cnPos = mLineElements.indexOf(payload);
			if (cnPos !== -1) {
				// Remove CN payload from m line.
				mLineElements.splice(cnPos, 1);
			}
			// Remove CN line in sdp
			sdpLines.splice(i, 1);
		}
	}

	sdpLines[mLineIndex] = mLineElements.join(' ');
	return sdpLines;
}
