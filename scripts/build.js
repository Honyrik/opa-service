/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json')));
delete packageJson.devDependencies;
delete packageJson.jest;
packageJson.scripts = {
    server: 'nodemon ./main.js',
};
packageJson.nodemonConfig = {
    ignore: ['node_modules/**'],
    env: {
        NLS_LANG: 'American_America.UTF8',
        NLS_DATE_FORMAT: 'dd.mm.yyyy',
        NLS_TIMESTAMP_FORMAT: 'dd.mm.yyyy"T"hh:mi:ss',
    },
    delay: '10000',
    watch: false,
};
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'package.json'), JSON.stringify(packageJson, null, 4));
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'yarn.lock'), fs.readFileSync(path.join(__dirname, '..', 'yarn.lock')));