const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/bank0705')
.then(() => console.log('Database connected'))
.catch(error => console.log(error), process.exit(1));
