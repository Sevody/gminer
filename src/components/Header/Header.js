import React, { Component } from 'react';
import s from './Header.scss';
import withStyles from '../../decorators/withStyles';
import Link from '../Link';
import Navigation from '../Navigation';

@withStyles(s)
class Header extends Component {

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <Navigation className={s.nav} />
          <Link className={s.brand} to="/">
            <img src={require('./G-Logo2.png')} width="38" height="38" alt="React" />
            <span className={s.brandTxt}>GMiner</span>
          </Link>
          <div className={s.banner}>
            <h1 className={s.bannerTitle}>Visualization</h1>
            <p className={s.bannerDesc}>Co-authorship network graph</p>
          </div>
        </div>
      </div>
    );
  }

}

export default Header;
