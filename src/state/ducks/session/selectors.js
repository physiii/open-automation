const isAuthenticated = (session) => Boolean(session.token);

export {
	isAuthenticated
};
