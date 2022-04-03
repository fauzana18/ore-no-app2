const express = require('express');
const app = express();

function requireHTTPS(req, res, next) {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

app.use(requireHTTPS);

app.use(express.static('./dist'));

app.get('/*', function(req, res) {
    res.sendFile('index.html', {root: 'dist/'}
  );
});

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});