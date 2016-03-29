import fs from 'fs';
import { join } from 'path';
import { Router } from 'express';
import Promise from 'bluebird';
import fetch from '../core/fetch';
import { remoteAPI } from '../config.js';

// A folder with local json data('name', 'value')
const CONTENT_DIR = join(__dirname, './content');

const readFile = Promise.promisify(fs.readFile);
const fileExists = filename => new Promise(resolve => {
  fs.exists(filename, resolve);
});

const parseQuery = (queryObj) => {
  let queryArray = [];
  for (let key in queryObj) {
    queryArray.push('&');
    queryArray.push(key);
    queryArray.push('=');
    queryArray.push(queryObj[key]);
  }
  return queryArray.join('');
};

const router = new Router();

// get the remote data with cors
router.get('/remote', async (req, res, next) => {
  try {
    const type = req.query.type;
    delete req.query.type;
    const queryString = parseQuery(req.query);
    const path = `${remoteAPI}${queryString}`;
/*  const response = await fetch(path);
    const data = await response.json();
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).send(data);
*/
    console.log(path);
    fetch(path)
      .then(function(response) {
        return response.json()
      }).then(function(json) {
        res.header("Access-Control-Allow-Origin", "*");
        res.status(200).send(json);
      }).catch(function(ex) {
        console.log('parsing failed', ex)
      })

  } catch (err) {
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).send('404');
  }
});

// get the local data
router.get('/local', async (req, res, next) => {
  try {
    const type = req.query.type;
    delete req.query.type;
    const queryString = parseQuery(req.query);
    const path = `${type}${queryString}`;

    if (!path || path === 'undefined') {
      res.status(400).send({ error: `The 'path' query parameter cannot be empty.` });
      return;
    }

    let fileName = join(CONTENT_DIR, (path === '/' ? '/default' : path) + '.json');
    if (!(await fileExists(fileName))) {
      res.status(404).send({ error: `The data '${path}' is not found.` });
    } else {
      const source = await readFile(fileName, { encoding: 'utf8' });
      res.status(200).send(source);
    }
  } catch (err) {
    next(err);
  }
});

export default router;
