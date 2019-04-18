const unzip = require('unzipper');
const fs = require('fs-extra');
const path = require('path');

const canvasGeneratedZipFile = process.argv.splice(process.execArgv.length + 2).join(' ');

const entryParser = (entry, destPath) => {
    let fileName = entry.path;
    let dirPath = destPath;
    if (!destPath) {
        const fileNameParts = fileName.split('_');
        const studentName = fileNameParts[0];
        fileName = fileNameParts.slice(3).join('_');
        dirPath = path.join(path.dirname(canvasGeneratedZipFile), studentName);
    }
    const finalPath = path.join(dirPath, fileName);
    dirPath = path.dirname(finalPath);
    fileName = path.basename(finalPath);
    if (entry.type === 'File') {
        fs.mkdirs(dirPath, () => {
            if (!fileName.endsWith('.zip')) {
                entry.pipe(fs.createWriteStream(finalPath));
            } else {
                entry
                    .pipe(unzip.Parse())
                    .on('entry', (entry) => {
                        entryParser(entry, dirPath);
                    });
            }
        });
    } else {
        entry.autodrain();
    }
};

fs.createReadStream(canvasGeneratedZipFile)
    .pipe(unzip.Parse())
    .on('entry', entryParser);