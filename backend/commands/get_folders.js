const { esmExports } = require('esm-exports');
const fs = require('fs');

module.exports = (data, callback) => {
    const folders = data.folders || [];
    if (folders.length === 0 && data.importRoot) {
        folders.push(data.importRoot);
    }
    const result = [];
    const promises = folders
        .filter(d => fs.existsSync(d))
        .map(d => esmExports(d, { type: 'directory' }).then(items => {
            result.push(...items);
        }));
    return Promise.all(promises)
        .then(() => {
            callback(null, result);
        })
        .catch(err => {
            if (!err) err = new Error('Unknow error.');
            callback(err);
        });
};