const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync(__dirname + '/src/app').filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  content = content.replace(/\$\{\{/g, '₹{{');
  content = content.replace(/\$1,000/g, '₹1,000');
  content = content.replace(/\$30,000/g, '₹30,000');
  if (content !== original) {
    fs.writeFileSync(file, content);
  }
});
