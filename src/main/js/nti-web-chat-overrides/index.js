import { SocialFeatures } from '@nti/web-profiles';

import CalendarWindow from './CalendarWindow';
import ChatWindow from './ChatWindow';

export function setupOverrides() {
	SocialFeatures.ChatWindowRef.setChatWindow(ChatWindow);
	SocialFeatures.CalendarWindowRef.setCalendarWindow(CalendarWindow);
}
