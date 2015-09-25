//A list of some of the variables we are putting on window
var globals = {
	TemplatesForNotes: 'NextThought.app.annotations.note.Templates',
	ReaderPanel: 'NextThought.app.contentviewer.components.Reader',
	ContentAPIRegistry: 'NextThought.app.contentviewer.reader.ContentAPIRegistry',
	CollisionDetection: 'NextThought.app.whiteboard.CollisionDetection',
	NTMatrix: 'NextThought.app.whiteboard.Matrix',
	IdCache: 'NextThought.cache.IdCache',
	LocationMeta: 'NextThought.cache.LocationMeta',
	UserRepository: 'NextThought.cache.UserRepository',
	Toaster: 'NextThought.common.toast.Manager',
	ImageZoomView: 'NextThought.common.ux.ImageZoomView',
	SlideDeck: 'NextThought.common.ux.SlideDeck',
	FilterManager: 'NextThought.filter.FilterManager',
	DelegateFactory: 'NextThought.mixins.Delegation.Factory',
	User: 'NextThought.model.User',
	Socket: 'NextThought.proxy.Socket',
	AnalyticsUtil: 'NextThought.util.Analytics',
	Anchors: 'NextThought.util.Anchors',
	AnnotationUtils: 'NextThought.util.Annotations',
	B64: 'NextThought.util.Base64',
	Color: 'NextThought.util.Color',
	ContentUtils: 'NextThought.util.Content',
	CSSUtils: 'NextThought.util.CSS',
	DomUtils: 'NextThought.util.Dom',
	NTIFormat: 'NextThought.util.Format',
	Globals: 'NextThought.util.Globals',
	LineUtils: 'NextThought.util.Line',
	ObjectUtils: 'NextThought.util.Object',
	ParseUtils: 'NextThought.util.Parsing',
	RangeUtils: 'NextThought.util.Ranges',
	RectUtils: 'NextThought.util.Rects',
	SharingUtils: 'NextThought.util.Sharing',
	StoreUtils: 'NextThought.util.Store',
	TextRangeFinderUtils: 'NextThought.util.TextRangeFinder',
	TimeUtils: 'NextThought.util.Time',
	ContentProxy: 'NextThought.proxy.JSONP',
	JSONP: 'NextThought.proxy.JSONP',
	PageVisibility: 'NextThought.util.Visibility',
	SearchUtils: 'NextThought.util.Search'
};


function fixRequires() {

}


function fixMixins() {

}


function fixReauires() {

}

//Useful links:
//https://github.com/facebook/jscodeshift
//https://github.com/benjamn/recast
//http://felix-kling.de/esprima_ast_explorer/
//https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
//https://github.com/benjamn/ast-types
//https://github.com/facebook/react/blob/master/packages/react-codemod/transforms/react-to-react-dom.js
module.exports = function(fileInfo, api) {
	const j = api.jscodeshift;
	var root = j(fileInfo.source);


	console.log(root.find(j.ExportDefaultDeclaration)
		.insertBefore(j.importDeclaration(
			[j.importDefaultSpecifier(j.identifier('foor'))],
			j.literal('bar')
		))
		.toSource());
};
