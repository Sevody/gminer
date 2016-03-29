import React, { Component, PropTypes } from 'react';
import s from './ContactPage.scss';
import withStyles from '../../decorators/withStyles';

const title = 'Contact Me';

@withStyles(s)
class ContactPage extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.context.onSetTitle(title);
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h3 className={s.contact}>email: sevody@gamil.com</h3>
        </div>
      </div>
    );
  }

}

export default ContactPage;
