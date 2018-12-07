var spawn = require('cross-spawn');

module.exports = (data, callback) => {
    var file_name = data.file_name.replace(/\\/g, '/');
    var options = { encoding: 'utf8' , cwd: data.cwd };
    var proc = spawn('node_modules/.bin/tsc', [file_name, '--noEmit', '--pretty', 'false', '--noUnusedLocals', '--allowJs'], options);
    proc.on('error', (err) => {
        callback(err);
    });
    var stdout = '';
    proc.stdout.on('data', (d) => stdout += d);
    proc.on('exit', () => {
        var outlines = stdout.split('\n');
        var result = {};
        for (var i = 0; i < outlines.length; i++) {
            var outline = outlines[i];
            var match = outline.match(/^(.+)\((\d+),(\d+)\): error TS(6133|6192):/);
            if (!match) continue;
            var file = match[1].replace(/\\/g, '/');
            if (file_name.slice(-file.length) !== file) continue;
            var line = Number(match[2]);
            var pos = Number(match[3]);
            if (!Array.isArray(result[line])) {
                result[line] = [];
            }
            switch (match[4]) {
                case '6133': {
                    match = outline.match(/^(.+)\((\d+),(\d+)\): error TS(\d+): '(.+)'/);
                    if (!match) continue;
                    result[line].push({
                        file: file,
                        line: line,
                        pos: pos,
                        name: match[5],
                        all: false,
                    });
                } break;
                case '6192': {
                    result[line].push({
                        file: file,
                        line: line,
                        pos: pos,
                        name: null,
                        all: true,
                    });
                } break;
            }
        }
        callback(null, result);
    });
};