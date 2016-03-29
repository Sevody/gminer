import React, { Component, PropTypes } from 'react';
import s from './AuthorDisplay.scss';
import withStyles from '../../decorators/withStyles';
import Link from '../Link';

@withStyles(s)
class AuthorDisplay extends Component {
    constructor() {
        super();
        this.state ={
      }
    }
    static propTypes = {
        authorList: PropTypes.array,
    };

    static defaultProps = {
        authorList: [],
    };
    clickCallBack() {
        console.log("AuthorDiaplayClickCallBack");
    }
    render() {
        let authorBox = []
        let self = this;
        const authorList = this.props.authorList;
        if (authorList) {
            authorList.map(function(author, i){
                let authorName = `${author.FirstName} ${author.MiddleName} ${author.LastName}`;
                let link = `./visualization?search=${author.ID}`;
                let achievement = `H-Index:  ${author.HIndex}  |  #Publication:  ${author.PublicationCount}  |  #Citation:  ${author.CitationCount}`;
                let affiliation = author.Affiliation && `${author.Affiliation.Name}  |  `;
                let wiki = author.HomepageURL && `${author.HomepageURL}`;
                let researchDomain = [];
                author.ResearchInterestDomain && author.ResearchInterestDomain.map(function(domain, i){
                    researchDomain.push(domain.Name);
                })
                authorBox.push(
                    <div className={s.author} key={i}>
                        <img src={author.DisplayPhotoURL} alt="logo"/>
                        <div className={s.information}>
                            <Link className={s.name} to={link} onClick={self.clickCallBack.bind(self)}>{authorName}</Link>
                            <ul className={s.achievement}>
                                <li>
                                    <span className={s.span}>H-Index: </span>
                                    <span>{author.HIndex}</span>
                                    <span> | </span>
                                </li>
                                <li>
                                    <span className={s.span}>#Publication: </span>
                                    <span>{author.PublicationCount}</span>
                                    <span> | </span>
                                </li>
                                <li>
                                    <span className={s.span}>#Citation: </span>
                                    <span>{author.CitationCount}</span>
                                </li>
                            </ul>
                            <span className={s.affiliation}>{affiliation}<a className={s.wiki} href={wiki} target="_blank">wiki</a></span>
                            <div className={s.domain}>
                                {researchDomain}
                            </div>
                        </div>
                    </div>
                    );
            });
        }
        return (
          <div className={s.root}>
            <div className={s.container}>
                {authorBox}
            </div>
          </div>
        );
      }
}

export default AuthorDisplay;
