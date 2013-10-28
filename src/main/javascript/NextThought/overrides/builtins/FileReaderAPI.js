Ext.define('NextThought.overrides.builtins.FileReaderAPI', function() {

	function free() {
		this.onload = this.onloaded = this.onloadstart = this.onloadend = function() {};
		this.readAsDataURL(new Blob());//replace with small object...
		if (this.result !== '') {
			console.error('Could not free FileReader, or empty result looks different in this browser:', this.result);
		}
	}

	if (window.FileReader) {
		FileReader.prototype.free = free;
	}

	return {};
});
