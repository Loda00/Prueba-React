import React, { Component } from 'react';

class Business extends Component {
  state = {
    title: 'Business Create',
  };

  render() {
    const { title } = this.state;
    return (
      <div className="section-container">
        <div className="section-general no-margin">
          {title}
        </div>
      </div>
    );
  }
}

export default Business;
