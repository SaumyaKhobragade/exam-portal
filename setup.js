const fs = require('fs');
const path = require('path');

const folders = [
    'src',
    'src/config',
    'src/controllers',
    'src/models',
    'public/images/uploads',
    'public/javascripts',
    'public/stylesheets',
    'src/routes',
    'src/utils',
    'src/views'
];

folders.forEach(folder => {
    fs.mkdirSync(path.join(process.cwd(), folder), { recursive: true });
});

// Create a basic index.js
fs.writeFileSync(path.join(process.cwd(), 'index.js'), `console.log('Backend setup complete!');`);

console.log('Basic backend structure created.');