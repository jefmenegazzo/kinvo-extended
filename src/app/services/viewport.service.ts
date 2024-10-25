export const isPortrait = (): boolean => {
	return window.innerWidth < window.innerHeight;
};

export const isLandScape = (): boolean => {
	return window.innerWidth > window.innerHeight;
};

export const isExtraSmallScreen = (): boolean => {
	return window.innerWidth < 640;
};

export const isSmallScreen = (): boolean => {
	return window.innerWidth >= 640 && window.innerWidth < 768;
};

export const isMediumScreen = (): boolean => {
	return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isLargeScreen = (): boolean => {
	return window.innerWidth >= 1024 && window.innerWidth < 1280;
};

export const isExtraLargeScreen = (): boolean => {
	return window.innerWidth >= 1280 && window.innerWidth < 1536;
};

export const isExtraExtraLargeScreen = (): boolean => {
	return window.innerWidth >= 1536;
};

export const isMediumOrHigherScreen = (): boolean => {
	return window.innerWidth >= 768;
};
