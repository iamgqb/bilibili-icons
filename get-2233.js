#! /usr/bin/node

'usr strict';

const http = require('http');
const fs = require('fs');
const { URL } = require('url');
const originJson = require('./2233.json');

const fetchList = originJson.data.list;

const fetchImg = (fileName, url) => {
  return new Promise ((resolve, reject) => {
  
    const options = new URL(url);
    const path = `./cache/${fileName}.png`;
    
    fs.open(path, 'a+', (err, fd) => {
      if (err) {
        throw err;
      }

      http.request(options, (res) => {
  
        res.on('data', buf => {
          fs.write(fd, buf, (err, byte) => {
            if (err) console.error(`write ${path} error`);
          });

        });
      
        res.on('end', () => {
          console.log(`done: ${fileName}`);
          fs.close(fd);
          resolve();
        })
      }).end();
    })
  })
}

const main = (idx) => {
  if (idx < fetchList.length) {
    const item = fetchList[idx];
    fetchImg(item.id, `http:${item.data.img}`).then(() => {
      main(idx + 1)
    })
  }
}

// main(0);
