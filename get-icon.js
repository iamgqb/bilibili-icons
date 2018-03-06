#! /usr/bin/node

'use strict';

const http = require('http');
const { URL } = require('url');
const MongoClient = require('mongodb').MongoClient;

const options = new URL('http://api.bilibili.com/x/web-interface/index/icon');

// request
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

const dataHandler = (data) => {
  if (!data) throw new Error('data is null or undefined');

  if (!data.id) throw new Error('data`s is need existed');

  const {id, title, links, icon} = data;
  const link = links[0] || '';

  const keyword = link ? new URL(link).searchParams.get('keyword') : '';

  return {id, title, keyword, icon, link};
}

const dbUrl = 'mongodb://localhost:27017/';
MongoClient.connect(dbUrl).then(client => {

  console.log('--- connect db success ---');
  console.log('--- start fetch icons ---');

  const db = client.db('bilibili');

  const col_statistics = db.collection('statistics');
  const col_icons = db.collection('icons');

  const main = () => {
    fetchIcon().then(data => {
      // handle data
      const doc = dataHandler(data);
  
      console.log(doc);

      // insert id for analyze frequency
      col_statistics.findOne({
        id: doc.id
      }).then(res => {
        if (res) {
          // get count and update
          col_statistics.updateOne({
            id: doc.id
          }, {
            $inc: {count: 1}
          });
        } else {
          // insert doc
          col_statistics.insertOne({
            id: doc.id,
            count: 1
          });
        }
      })

      // insert doc into collection
      col_icons.insertOne({
        ...doc,
        _id: doc.id,
      });
    }).then(() => timer());
  }

  const timer = () => setTimeout(() => main(), 2000);

  main();

}, err => console.error(err))
