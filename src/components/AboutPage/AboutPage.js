import React, { Component, PropTypes } from 'react';
import s from './AboutPage.scss';
import withStyles from '../../decorators/withStyles';

const title = 'About';

@withStyles(s)
class AboutPage extends Component {

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
          <h4 className={s.about}>This app is used for visualizing the co-authorship.</h4>
        </div>
      </div>
    );
  }

}

export default AboutPage;
