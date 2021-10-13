import { Router, Route } from '@nti/web-routing';

import { SegmentEditor } from './editor/Editor';
import { SegmentFrame } from './Frame';

export default Router.for(
	[
		Route({
			path: '/',
			component: SegmentEditor,
		}),
	],
	{ frame: SegmentFrame }
);
