#! /usr/bin/node

'use strict';

const http = require('http');
const { URL } = require('url');

const MongoClient = require('mongodb').MongoClient;

const options = new URL('http://api.bilibili.com/x/web-interface/index/icon');

const fetchIcon = () => {
  return new Promise((resolve, reject) => {

    http.request(options, (res) => {

      res.on('data', chunk => {
        try {
          const data = JSON.parse(chunk.toString());
          resolve(data.data);
        } catch (e) {
          reject(e);
          throw e;
        }
      });
  
    }).end();
  })
}

const dbUrl = 'mongodb://localhost:27017/';
MongoClient.connect(dbUrl, (err, client) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log('--- connect db success ---');
  console.log('--- start fetch icons ---');

  const db = client.db('bilibili');

  fetchIcon().then(data => {
    // TODO handle data
    console.log(data);

    db.collection('icons', {strict: true}, (err, col) => {
      // use strict , then we can create collection with validation
      if (err && err.message.indexOf('does not exist') > -1) {
        // TODO create icons collection
      }

      // insert row
    })
  })
});
