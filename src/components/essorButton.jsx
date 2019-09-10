import React from 'react';
import { Button, Icon } from 'semantic-ui-react';
import classnames from 'classnames';
import checkWhite from 'assets/images/checkwhite.png';

const EssorButton = ({ type, children, submit, secondary, ...props }) => {
  let icon = '';
  let tag = 'i';

  if (type) {
    switch (type) {
      case 'check':
        icon = checkWhite;
        tag = 'img';
        break;
      default:
        icon = type;
        break;
    }
  }

  return (
    <Button
      className={classnames('essor-button', {
        secondary,
      }, {
        'submit-btn': submit,
      })}
      {...props}
    >
      {tag === 'i'
        ? <Icon name={icon} />
        : <Icon as="img" src={icon} />
      }

      {children}
    </Button>
  );
};

export default EssorButton;
