const SET_MOBILE_NAV_VISIBILITY = 'LAYOUT/SET_MOBILE_NAV_VISIBILITY';
const SET_MOBILE_NAV_VISIBILITY_RIGHT = 'LAYOUT/SET_MOBILE_NAV_VISIBILITY_RIGHT';

const layout = (state = false, action) => {
  switch (action.type) {
    case SET_MOBILE_NAV_VISIBILITY:
      return {
        ...state,
        mobileNavVisibility: action.visibility,
      };

    default:
      return state;
  }
};

export const layoutRight = (state = false, action) => {
  switch (action.type) {
    case SET_MOBILE_NAV_VISIBILITY_RIGHT:
      return {
        ...state,
        mobileNavVisibilityRight: action.visibility,
      };

    default:
      return state;
  }
};

export default layout;
