import path from 'path';

function MulterImpl(config) {
    var defaultDest = './content/';

    this.init = function () {
        var multer = require('multer');
        // var uploadDir = !config.uploadDir ? defaultDest : config.uploadDir;
        var uploadDir = path.join(__dirname, defaultDest);
        var options = {
            dest: uploadDir,
            rename: function (fieldname, filename) {
                // return filename + Date.now();
                var Afilename = filename.split('&');
                if(Afilename[0] === 'Publishtion' || Afilename[0] === 'Author'){
                    var object = Afilename[0];
                    var id = Afilename[1];
                    return `mss&ResultObjects=${object}&StartIdx=0&EndIdx=50&OrderBy=Rank&AuthorID=${id}`;
                }else{
                    var id = 's' + Date.now();
                    config.id = id;
                    var object = 'Publishtion';
                    return `mss&ResultObjects=${object}&StartIdx=0&EndIdx=50&OrderBy=Rank&AuthorID=${id}`;
                }
            },
            onFileUploadStart: function (file) {
                console.log(file.originalname + ' is starting ...');
            },
            onFileUploadComplete: function (file) {
                console.log(file.fieldname + ' uploaded to  ' + file.path);
            }
        };

        return multer(options);
    }
}

module.exports = MulterImpl;
