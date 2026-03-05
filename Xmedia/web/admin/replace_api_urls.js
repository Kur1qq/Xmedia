const fs = require('fs');
const path = require('path');

const srcDir = '/Users/gansmac/Desktop/desktop/Xmedia/Xmedia/web/admin/src';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir(srcDir, function (filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Replace: const API = 'http://localhost:4000/api';
        content = content.replace(/const API = 'http:\/\/localhost:4000\/api';/g, "const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';");

        // Replace inside backticks: `http://localhost:4000/api/something`
        content = content.replace(/`http:\/\/localhost:4000\/api([^`]*)`/g, '`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:4000/api\'}$1`');

        // Replace inside single quotes: 'http://localhost:4000/api/something'
        content = content.replace(/'http:\/\/localhost:4000\/api([^']*)'/g, '`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:4000/api\'}$1`');

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated:', filePath);
        }
    }
});
