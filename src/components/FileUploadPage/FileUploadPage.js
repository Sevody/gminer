import React, { Component, PropTypes } from 'react';
import s from './FileUploadPage.scss';
import withStyles from '../../decorators/withStyles';
import DropzoneComponent from 'react-dropzone-component';

const title = 'Upload Files';
var self = null;
var componentConfig = {
    iconFiletypes: ['.json'],
    showFiletypeIcon: true,
    postUrl: '/upload'
};

/**
 * For a full list of possible configurations,
 * please consult
 * http://www.dropzonejs.com/#configuration
 */
var djsConfig = {
    addRemoveLinks: true,
    acceptedFiles: ".json"
};

/**
 * If you want to attach multiple callbacks, simply
 * create an array filled with all your callbacks.
 * @type {Array}
 */
var callbackArray = [
    function() {
    }
];

/**
 * Simple callbacks work too, of course.
 */
var addedfileCallback = function() {
    document.getElementsByClassName('dz-default dz-message')[0].style.display = "none";
    document.getElementsByClassName('filepicker')[0].style.justifyContent = "space-around";
    for(let i=0; i<document.getElementsByClassName('dz-error-mark').length; i++){
        document.getElementsByClassName('dz-error-mark')[i].style.display = "none";
        document.getElementsByClassName('dz-remove')[i].style.display = "none";
    }
};
var successCallback = function(finish, id) {
    if(id !== '0'){
        self.setState({createdId: id, showTip: true})
    }
}
/**
 * Attach event handlers here to be notified
 * for pretty much any event.
 * Arrays are accepted.
 */
var eventHandlers = {
    // All of these receive the event as first parameter:
    drop: callbackArray,
    dragstart: null,
    dragend: null,
    dragenter: null,
    dragover: null,
    dragleave: null,
    // All of these receive the file as first parameter:
    addedfile: addedfileCallback,
    removedfile: null,
    thumbnail: null,
    error: null,
    processing: null,
    uploadprogress: null,
    sending: null,
    success: successCallback,
    complete: null,
    canceled: null,
    maxfilesreached: null,
    maxfilesexceeded: null,
    // All of these receive a list of files as first parameter
    // and are only called if the uploadMultiple option
    // in djsConfig is true:
    processingmultiple: null,
    sendingmultiple: null,
    successmultiple: null,
    completemultiple: null,
    canceledmultiple: null,
    // Special Events
    totaluploadprogress: null,
    reset: null,
    queuecompleted: null
};

@withStyles(s)
class FileUploadPage extends Component {
    constructor() {
        super();
        self = this;
        this.state ={
            createdId: '0',
            showTip: false
      }
    }
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.context.onSetTitle(title);
  }

  render() {
    let createdLink = `./visualization?search=${this.state.createdId}`;
    let uploadTipStyle = this.state.showTip ? s.showTip : s.hideTip;
    let format = `
            {
                "d": {
                    "Publication": {
                        "TotalItem": 1,
                        "Result": [{
                            "Author": [{
                                "FirstName": "张",
                                "ID": 123,
                                "LastName": "三"
                            }, {
                                "FirstName": "李",
                                "ID": 456,
                                "LastName": "四"
                            }]
                        }]
                    }
                }
            }`;
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h3 className={s.contact}>You can upload your own data to visualize</h3>
          <DropzoneComponent
            className={s.filepicker}
            config={componentConfig}
            eventHandlers={eventHandlers}
            djsConfig={djsConfig}>
          </DropzoneComponent>
          <div className={uploadTipStyle}>
            Upload succeed，please visit this
            &nbsp;<a href={createdLink}>link</a>
           </div>
           <div className={s.format}>The data format should have some fixed field like this:
            <pre>{format}</pre>
           </div>
        </div>
      </div>
    );
  }

}

export default FileUploadPage;
