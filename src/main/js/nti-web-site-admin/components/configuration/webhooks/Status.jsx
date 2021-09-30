const Container = styled('div')`
	flex: 1;
	display: flex;
	align-items: center;
	gap: var(--padding-sm, 0.375em);

	&::before {
		content: '';
		flex: 0 0 6px;
		height: 6px;
		border-radius: 50%;
	}

	&.status-success::before {
		background-color: var(--color-success);
	}

	&.status-failed::before {
		background-color: var(--color-error);
	}
`;

export const Status = ({item}) => <Container status={item?.status}>{item?.status}</Container>;
