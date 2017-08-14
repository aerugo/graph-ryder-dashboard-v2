/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/data              ->  index
 * POST    /api/data              ->  create
 * GET     /api/data/:id          ->  show
 * PUT     /api/data/:id          ->  upsert
 * PATCH   /api/data/:id          ->  patch
 * DELETE  /api/data/:id          ->  destroy
 */

'use strict';

let request = require('request');

export function get(req, res) {
  request({url: 'http://localhost:5000/get/' + req.param('id'), qs: {keys: "*"}}, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getLabels(req, res) {
  request('http://localhost:5000/getLabels/', function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getLabelsHierarchy(req, res) {
  request('http://localhost:5000/getLabelsHierarchy/', function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getLabelsById(req, res) {
  request('http://localhost:5000/getLabels/' + req.param('id'), function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getProperties(req, res) {
  request('http://localhost:5000/getProperties/' + req.param('label'), function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getPropertyValue(req, res) {
  request('http://localhost:5000/getPropertyValue/' + req.param('label') + '/' + req.param('key'), function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}


