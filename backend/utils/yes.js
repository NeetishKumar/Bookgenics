const fs = require('fs')
const csv = require('csv-parser')
const {Book} = require('../models/book');
const {Genre} = require('../models/genre');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/bookgenics", {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Connected to Database'))
    .catch(err => console.log(err));

fs.createReadStream('./Full Filtered Data.csv')
  .pipe(csv())
  .on('data', async (row) => {

    genres = row.genres.substring(1, row.genres.length-1);
    let arr = [];
    for(let idx=0;idx<genres.length;idx++) {
      if(genres[idx]>='a' && genres[idx]<='z') {
        f = idx;
        let idx2 = f;
        while(idx2<genres.length && genres[idx2] !== '\'') {
          idx2++;
        }
        arr.push(genres.substring(f, idx2));
        idx = idx2;
      }
    }
    let genreArray = [];
    for(let idx=0;idx<arr.length;idx++) {
      const gen = await Genre.find({name: arr[idx]});
      genreArray.push(gen[0]);
    }
    
    try {
      const book = new Book({
        title: row.Title,
        author: row.Author,
        content: row.Content,
        genres: genreArray
      });
      await book.save();
    }
    catch(ex) {
      console.log('1 Deleted');
    }
  })
  .on('end', () => {
    console.log('DONE');
  });

  