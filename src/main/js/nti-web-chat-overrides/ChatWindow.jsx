import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import ChatActions from '../legacy/app/chat/Actions';

const styles = stylesheet`
	.expanded {
		right: 240px !important;
	}
`;

WebappChatWindow.propTypes = {
	entity: PropTypes.string,
	expanded: PropTypes.bool,

	onClose: PropTypes.func,
};

export default function WebappChatWindow({ onClose, entity, expanded }) {
	const [window, setState] = useState(null);

	useEffect(() => {
		const listen = {
			single: true,
			close: onClose,
		};

		window?.on(listen);
		return () => {
			window?.un(listen);
		};
	}, [window, onClose]);

	useEffect(() => {
		const openChat = async _entity => {
			const actions = ChatActions.create();
			const roomInfo = await actions.createChatRoom(_entity);

			return actions.openChatWindow(roomInfo);
		};

		if (entity) {
			openChat(entity).then(_window => setState(_window));
		} else {
			window?.hide();
		}

		return () => {
			window?.hide();
		};
	}, [entity]);

	useEffect(() => {
		if (expanded) {
			window?.addCls(styles.expanded);
		} else {
			window?.removeCls(styles.expanded);
		}
	}, [window, expanded]);

	return null;
}
