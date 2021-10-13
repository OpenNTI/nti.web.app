import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

import Ext from '@nti/extjs';

WebappCalendarWindow.propTypes = {
	onClose: PropTypes.func.isRequired,
	target: PropTypes.object.isRequired,
	visible: PropTypes.bool,
};

export default function WebappCalendarWindow(
	{ onClose, target, visible },
	scope
) {
	const windowRef = useRef(null);
	useEffect(() => windowRef.current?.destroy(), []);

	useEffect(() => {
		// capture the instance value of 'current' into this closure so it won't change when 'current' will.
		// This way the calls to 'un' and 'destroy' apply to the correct reference.
		const ref = windowRef.current;

		const listen = {
			single: true,
			close: onClose,
		};

		ref?.on(listen);
		return () => {
			ref?.un(listen);
			ref?.destroy();
		};
	}, [windowRef.current]);

	useEffect(() => {
		if (!visible) {
			windowRef.current?.hide();
		} else if (windowRef.current) {
			windowRef.current?.show();
		} else if (target) {
			const win = Ext.widget('gutter-list-calendar-window', {
				renderTo: Ext.get(target),
				onClose: onClose,
				navigateToObject: obj => scope.navigateToObject(obj),
			});
			if (!visible) {
				win.hide();
			}
			windowRef.current = win;
		}

		return () => {
			windowRef.current?.hide();
		};
	}, [visible]);

	return null;
}
