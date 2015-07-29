/**
 * Minimalist image reader I coded in an airplane to read comics in a nice format
 * Code is of course ugly ...
 */

var fs = require('fs')
  , http = require('http')
  , server = http.createServer()
  , authorizedExtensions = ['.jpg', '.jpeg', '.png']
  , favicon = fs.readFileSync('favicon.ico');
  ;

server.on('request', function (req, res) {
  // Don't serve favicon
  if (req.url.match(/favicon\.ico$/)) { 
    res.write(favicon);
    res.end();
    return;
  }

  // Replace url-encoded spaces by real spaces
  req.url = req.url.replace(/%20/g, ' ');

  // Serve image if image requested, counting on intelligent browsers understanding image type without my help. So evil.
  if (req.url.match(/^\/images\//)) {
    var image = fs.readFileSync(req.url.substring(1));
    res.write(image);
    res.end();
    return;
  }

  // Root page lists all directories
  if (req.url === '/') {
    var content = '<ul>';
    fs.readdirSync('images').forEach(function (d) {
      content += '<li><a href="/' + d + '">' + d + '</a></li>';
    });
    content += '</ul>';
    res.setHeader('content-type', 'text/html');
    res.write(content);
    res.end();
    return;
  }

  // Serve display page if no pattern matches
  var content = fs.readFileSync('display.html', 'utf8');
  var directory = req.url.split('/')[1];
  var image = req.url.split('/')[2];
  var current = 0, i;
  var _dirContents = fs.readdirSync('images/' + directory);   // No error checking here, will crash if user error input
  var dirContents = [];
  _dirContents.forEach(function (f) {
    var ext = f.split('.');
    ext = '.' + ext[ext.length - 1];
    if (authorizedExtensions.indexOf(ext) !== -1) { dirContents.push(f); }
  });

  if (image) {
    for (i = 0; i < dirContents.length; i +=1) {
      if (image === dirContents[i]) { current = i; }
    }
  }
  previous = current - 1;
  next = current + 1;
  var title = directory + ' - ' + (current + 1) + '/' + dirContents.length;
  current = dirContents[current];
  previous = dirContents[previous] || 'noshow';
  next = dirContents[next] || 'noshow';

  // Could use a real templating language but that was easier in the short run ...
  content = content.replace(/{{directory}}/g, directory);
  content = content.replace(/{{current}}/g, current);
  content = content.replace(/{{previous}}/g, previous);
  content = content.replace(/{{next}}/g, next);
  content = content.replace(/{{title}}/g, title);

  res.setHeader('content-type', 'text/html');
  res.write(content);
  res.end();
  return;
});


// Start
server.listen(1234);
