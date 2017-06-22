var express = require('express');
var router = express.Router();

var nodeModel = require('../database/nodeSchema');

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

router.get('/', function(req, res, next) {
	console.log('inside crawler');
    var url = 'http://python.org';

    var requestPromise = function(node) {

		return new Promise(function(resolve, reject){
			console.log('***************** Next with URL: '+node.url+ ' **********************');

			request(node.url, function(error, response, html){
				if (!error) {

					const parentNode = node.currentNode;
					var nextNodes = [];

					console.log('inside crawler request success');
		            var $ = cheerio.load(html);
		            var anchorLists = $('a');

		            var childNodes = [];

		            for (var j = 0; j < 12; j++) {
		            	console.log(j+'-'+anchorLists[j].attribs.href);
		            	var href = anchorLists[j].attribs.href;

		            	if (href) {
		            		if (href.substring(0,4)==="http") {
			            		console.log('vvvvvvvvvvvvvvvvvvv-- '+href+' allowed--vvvvvvvvvvvvvvvvvvv');

			            		var tempCurrentNode = Date.now()+j;
			            		nextNodes.push({
			            			'parentNode': parentNode,
			            			'currentNode': tempCurrentNode,
			            			'url': href
			            		});

			            		childNodes.push(tempCurrentNode)
			            	}
			            	else {
			            		// console.log('xxxxxxxxxxxxxxxxxxxxxxx-- '+href+' not allowed--xxxxxxxxxxxxxxxxxxxxxxx');
			            		continue;
			            	}
		            	}
		            	else {
		            		continue;
		            	}

		            }

		            var newNode = nodeModel({
						parentNode: node.parentNode,
						currentNode: node.currentNode,
						url: node.url,
						childNodes: childNodes
					});

					newNode.save(function(err){
						if (err) {
							throw err;
						}
						else {
							console.log('saved successfully');
							console.log('requestPromise for URL: '+url);
				            resolve(nextNodes);
						}
					});

		            
				}
				else {
					reject("---------------Network Error----------");
				}
			});
		});

    }

    var crawl = function(nodes){

    	Promise.all(nodes.map(requestPromise)).then(function(nodess){

    		nodess.forEach(function(nodes){
    			console.log('node: '+JSON.stringify(nodes));
    			crawl(nodes);
    		});
    		
    	}, function(testErrors){
    		testErrors.forEach(function(testError){
    			console.log('testError: '+testError);
    		});
    	})

    };

    var crawlStart = function(url) {
    	console.log('***************** Starting with URL: '+url+ ' **********************');

    	request(url, function(error, response, html){
	    	console.log('inside crawler request: '+url);

	        if(!error){

	        	const parentNode = null;
				const currentNode = 1234;
				var nextNodes = [];

	        	console.log('inside crawler request success');
	            var $ = cheerio.load(html);
	            var anchorLists = $('a');

	            var childNodes = [];

	            for (var i = 0; i < 12; i++) {
	            	console.log(i+'-'+anchorLists[i].attribs.href);
	            	var href = anchorLists[i].attribs.href;

	            	if (href) {
	            		if (href.substring(0,4)==="http") {
		            		console.log('vvvvvvvvvvvvvvvvvvv-- '+href+' allowed--vvvvvvvvvvvvvvvvvvv');
		            		var tempCurrentNode = Date.now()+Math.floor((Math.random() * 10) + 1);
		            		nextNodes.push({
		            			'parentNode': currentNode,
		            			'currentNode': tempCurrentNode,
		            			'url': href
		            		});

		            		childNodes.push(tempCurrentNode)
		            	}
		            	else {
		            		continue;
		            	}
	            	}
	            	else {
	            		continue;
	            	}

	            }

	            console.log('childNodes: '+childNodes);
	            var rootNode = nodeModel({
					parentNode: null,
					currentNode: currentNode,
					url: url,
					childNodes: childNodes
				});

				rootNode.save(function(err){
					if (err) {
						throw err;
					}
					else {
						console.log('saved successfully');
						crawl(nextNodes);
					}
				});
				

	        }
	        else{
	        	console.log('error: '+error)
	        }

	    })
    }

    crawlStart(url);
});

module.exports = router;