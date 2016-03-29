import React, { Component } from 'react';
import s from './Footer.scss';
import withStyles from '../../decorators/withStyles';
import Link from '../Link';

@withStyles(s)
class Footer extends Component {

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <span className={s.text}>© GMiner</span>
          <span className={s.spacer}>·</span>
          <Link className={s.link} to="/">Home</Link>
          <span className={s.spacer}>·</span>
          <a className={s.link} href="https://github.com/Sevody/visualization-of-relationship" target="_blank">Github</a>
          <span className={s.spacer}>·</span>
          <Link className={s.link} to="/feedback">Feedback</Link>
        </div>
      </div>
    );
  }

}

export default Footer;
