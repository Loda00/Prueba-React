export function setRole(role) {
  return {
    type: 'USER_COMPANY_SET_ROLE_SUCCESS', role,
  };
}

export function setID(id) {
  return {
    type: 'USER_COMPANY_SET_ID_SUCCESS', id,
  };
}
