Ext.define('NextThought.overrides.builtins.FileReaderAPI', function() {

	function free() {
		//I don't think we need to do this... :/ and its blowing up in IE10 now. sooo....
	}

	if (window.FileReader) {
		FileReader.prototype.free = free;
	}

	return {};
});
