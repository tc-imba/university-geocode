/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var https = require('https');
var parse = require('url').parse;
var version = require('@google/maps/lib/version');
var shttps = require('socks5-https-client');

// add keep-alive header to speed up request
var agent = new https.Agent({ keepAlive: true });


/**
 * Makes a secure HTTP GET request for the given URL.
 *
 * Calls the callback with two parameters (err, response). If there was an
 * error, response should be null. If there was no error, err should be null,
 * and response should be an object with these properties
 * {
 *   status: number,
 *   headers: Object,
 *   json: Object
 * }
 *
 * Returns a function that cancels the request.
 *
 * @param {string} url
 * @param {function(ClientResponse)} onSuccess
 * @param {function(?)} onError
 * @param {Object} options
 * @return {function()}
 */
module.exports = function makeUrlRequest(url, onSuccess, onError, options) {

  var requestOptions = parse(url);
  var body;

  // Allow each API to provide some of the request options such as the
  // HTTP method, headers, etc.
  if (options) {
    for (var k in options) {
      if (k === 'body') {
        body = options[k];
      } else {
        requestOptions[k] = options[k];
      }
    }
  }

  requestOptions.headers = requestOptions.headers || {};
  requestOptions.headers['User-Agent'] = 'GoogleGeoApiClientJS/' + version;

  //requestOptions.agentClass = Agent;
  //requestOptions.strictSSL = true;

  var request = shttps.request(requestOptions, function(response) {

    response.on('error', function(error) {
      onError(error);
    });

    if (response.statusCode === 302) {
      // Handle redirect.
      var url = response.headers['location'];
      makeUrlRequest(url, onSuccess, onError, options);
    } else if (response.headers['content-type'] == 'application/json; charset=UTF-8') {
      // Handle JSON.
      var data = [];
      response.on('data', function(chunk) {
        data.push(chunk);
      });
      response.on('end', function() {
        let json;
        try {
          json = JSON.parse(Buffer.concat(data).toString())
        } catch (e) {
          json = {};
        }
        onSuccess({
          status: response.statusCode,
          headers: response.headers,
          json: json
        })
      });
    } else {
      // Fallback is for binary data, namely places photo download,
      // so just provide the response stream. Also provide the same
      // consistent name for status checking as per JSON responses.
      response.status = response.statusCode;
      onSuccess(response);
    }

  }).on('error', function(error) {
    onError(error);
  });

  if (body) {
    request.write(JSON.stringify(body));
  }

  request.end();

  return function cancel() { request.abort(); };
};
