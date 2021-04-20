import PropTypes from 'prop-types';
import React from 'react';

import Ext from '@nti/extjs';

WebappCalendarWindow.propTypes = {
	onClose: PropTypes.func.isRequired,
	target: PropTypes.object.isRequired,
	visible: PropTypes.bool.isRequired,
};

export default function WebappCalendarWindow({ onClose, target, visible }) {
	const windowRef = React.useRef(null);

	React.useEffect(() => {
		const listen = {
			single: true,
			close: onClose,
		};

		windowRef.current?.on(listen);
		return () => {
			windowRef.current?.un(listen);
		}
	}, [windowRef.current]);

	React.useEffect(() => {
		if (!visible) {
			windowRef.current?.hide();
		}
		else if (windowRef.current) {
			windowRef.current?.show();
		}
		else if (target) {
			const win = Ext.widget('gutter-list-calendar-window', {
				renderTo: Ext.get(target),
				onClose: onClose,
				navigateToObject: obj => this.navigateToObject(obj),
			});
			if (!visible) {
				win.hide();
			}
			windowRef.current = win;
		}

		return () => {
			windowRef.current?.destroy();
		}
	}, [visible]);

	return null;
}
