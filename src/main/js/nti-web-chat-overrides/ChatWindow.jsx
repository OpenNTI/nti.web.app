import PropTypes from 'prop-types';
import React from 'react';

import ChatActions from '../legacy/app/chat/Actions';

const styles = stylesheet`
	.expanded {
		right: 240px !important;
	}
`;

WebappChatWindow.propTypes = {
	entity: PropTypes.string.isRequired,
	expanded: PropTypes.bool,

	onClose: PropTypes.func,
};

export default function WebappChatWindow({ onClose, entity, expanded }) {
	const [window, setState] = React.useState(null);

	React.useEffect(() => {
		const listen = {
			single: true,
			close: onClose,
		};

		window?.on(listen);
		return () => {
			window?.un(listen);
		}
	}, [window, onClose]);

	React.useEffect(() => {
		const openChat = async (entity) => {
			const actions = ChatActions.create();
			const roomInfo = await actions.createChatRoom(entity);

			return actions.openChatWindow(roomInfo);
		};

		if (entity) {
			openChat(entity).then(window => setState(window));
		} else {
			window?.hide();
		}

		return () => {
			window?.hide();
		}
	}, [entity]);

	React.useEffect(() => {
		if (expanded) {
			window?.addCls(styles.expanded);
		} else {
			window?.removeCls(styles.expanded);
		}
	}, [window, expanded]);

	return null;
}
