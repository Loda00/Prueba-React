const SET_MOBILE_NAV_VISIBILITY = 'LAYOUT/SET_MOBILE_NAV_VISIBILITY';
const SET_MOBILE_NAV_VISIBILITY_RIGHT = 'LAYOUT/SET_MOBILE_NAV_VISIBILITY_RIGHT';
export const setMobileNavVisibility = visibility => ({
  type: SET_MOBILE_NAV_VISIBILITY,
  visibility,
});

export const toggleMobileNavVisibility = () => (dispatch, getState) => {
  const visibility = getState().layout.mobileNavVisibility;
  dispatch(setMobileNavVisibility(!visibility));
};

export const setMobileNavVisibilityRight = visibility => ({
  type: SET_MOBILE_NAV_VISIBILITY_RIGHT,
  visibility,
});

export const toggleMobileNavVisibilityRight = () => (dispatch, getState) => {
  const visibility = getState().layoutRight.mobileNavVisibilityRight;
  dispatch(setMobileNavVisibilityRight(!visibility));
};
