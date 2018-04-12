const isAuthenticated = (session) => {
	return !!session.token;
};

export {
	isAuthenticated
};
