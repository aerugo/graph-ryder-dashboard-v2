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
import config from '../../config/environment';

export function getProperties(req, res) {
  request({url: config.tulipApi + '/get/' + req.param('id'), qs: {keys: '*'}}, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getAttributes(req, res) {
  request({url: config.tulipApi + '/get/' + req.param('id'), qs: {attrs: '*'}}, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getAttributesTypes(req, res) {
  request(config.tulipApi + '/getAttributesTypes/', function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function createNode(req, res) {
  request({url: config.tulipApi + '/createNode/', method: 'POST', json: req.body}, function(error, response, body) {
    console.log(response.statusCode);
    if(!error && response.statusCode == 200) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(body.toString());
    }
  });
}

export function createEdge(req, res) {
  request({url: config.tulipApi + '/createEdge/', method: 'POST', json: req.body}, function(error, response, body) {
    console.log(response.statusCode);
    if(!error && response.statusCode == 200) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(body.toString());
    }
  });
}

export function set(req, res) {
  request({url: config.tulipApi + '/set/' + req.param('id'), method: 'PUT', json: req.body}, function(error, response, body) {
    console.log(response.statusCode);
    if(!error && response.statusCode == 200) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(body.toString());
    }
  });
}

export function destroy(req, res) {
  request({url: config.tulipApi + '/' + req.param('id'), method: 'DELETE'}, function(error, response, body) {
    console.log(response.statusCode);
    if(!error && response.statusCode == 200) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(body.toString());
    }
  });
}

export function countLabel(req, res) {
  request(config.tulipApi + '/countLabel/' + req.param('label'), function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function countLabels(req, res) {
  request(config.tulipApi + '/countLabels/', function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getLabels(req, res) {
  request(config.tulipApi + '/getLabels/', function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getLabelsHierarchy(req, res) {
  request(config.tulipApi + '/getLabelsHierarchy/', function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getLabelsById(req, res) {
  request(config.tulipApi + '/getLabels/' + req.param('id'), function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getPropertiesByLabel(req, res) {
  request(config.tulipApi + '/getProperties/' + req.param('label'), function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getPropertyValue(req, res) {
  request(config.tulipApi + '/getPropertyValue/' + req.param('label') + '/' + req.param('key'), function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}

export function getPropertyValueAndId(req, res) {
  request(config.tulipApi + '/getPropertyValueAndId/' + req.param('label') + '/' + req.param('key'), function(error, response, body) {
    if(!error && response.statusCode == 200) {
      return res.send(body);
    }
  });
}


