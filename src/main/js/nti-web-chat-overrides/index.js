import { SocialFeatures } from '@nti/web-profiles';

import CalendarWindow from './CalendarWindow';
import ChatWindow from './ChatWindow';

export function setupOverrides(scope) {
	SocialFeatures.ChatWindowRef.setChatWindow(ChatWindow);
	SocialFeatures.CalendarWindowRef.setCalendarWindow(props =>
		CalendarWindow(props, scope)
	);
}
