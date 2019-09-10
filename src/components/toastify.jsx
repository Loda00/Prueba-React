import React from 'react';
import { toast } from 'react-toastify';
import classnames from 'classnames';
import { Icon } from 'semantic-ui-react';

const Custom = ({ message, type }) => (
  <div>
    <Icon
      style={{
        marginRight: 7,
      }}
      name={classnames({
        'check circle': type === 'success',
        'times circle': type === 'error',
        'warning circle': type === 'warning',
        'info circle': type === 'info',
      })}
      size="large"
    />
    {message}
  </div>
);

export function success(message) {
  toast.success(
    <Custom
      message={message}
      type="success"
    />,
  );
}

export function error(message) {
  toast.error(
    <Custom
      message={message}
      type="error"
    />,
  );
}

export function warning(message) {
  toast.warn(
    <Custom
      message={message}
      type="warning"
    />,
  );
}

export function info(message) {
  toast.info(
    <Custom
      message={message}
      type="info"
    />,
  );
}
