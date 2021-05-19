import React from 'react';

import { Content } from '@nti/web-course';
import { Models } from '@nti/lib-interfaces';

Content.HeaderRegistry.register(
	Models.calendar.CalendarEventRef.MimeType,
	Heading
);

Heading.applies = item => item.hasLink('check-in') || true;

export default function Heading(props) {
	return <div>Hi</div>;
}
