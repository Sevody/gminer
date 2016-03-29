
import React, { Component } from 'react';
import s from './Feedback.scss';
import withStyles from '../../decorators/withStyles';

@withStyles(s)
class Feedback extends Component {

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <a className={s.link} href="https://github.com/Sevody/visualization-of-relationship/issues/new">Report an issue</a>
        </div>
      </div>
    );
  }

}

export default Feedback;
