var express = require('express');
var router = express.Router();

var nodeModel = require('../database/nodeSchema');

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

router.get('/', function(req, res, next) {
	// var sampleTreeNode = {
	// 	"name": "",
	//     "parent": "",
	//     "children": []
	// };

	// var getTreeNodePromise = function(nodeId){
		
	// 	return new Promise(function(resolve, reject){
	// 		nodeModel.findOne({ 'currentNode': nodeId }, {}, function (err, node) {
	// 			if(err) return err;

	// 			if(node) {
	// 				console.log('**********************START**************************');
	// 				console.log('node: '+node.currentNode);
	// 				resolve(node);
	// 				console.log('**********************END**************************');
	// 			}
	// 			else {
	// 				resolve('null');
	// 			}
	// 		});
	// 	});
	// };

	// var populateTree = function(nodeId, tree) {

	// 	var sampleTreeNode = {
	// 		"name": "",
	// 	    "parent": "",
	// 	    "children": []
	// 	};
		
	// 	return new Promise(function(resolve, reject) {
	// 		getTreeNodePromise(nodeId).then(function(node){
	// 			if (node!=='null') {
	// 				tree.name = node.url;
	// 				tree.parent = node.parentNode;

	// 				Promise.all(node.childNodes.map(getTreeNodePromise)).then(function(childNodes){

	// 					Promise.all(childNodes.map(function(childNode){
	// 						console.log();
	// 						return populateTree(childNode.currentNode, sampleTreeNode);

	// 					})).then(function(nextTrees){

	// 						console.log('**********************FILLING CHILDREN**************************');
	// 						nextTrees.forEach(function(nextTree){
	// 							console.log(nextTree);
	// 							tree.children.push(nextTree);
	// 						});
	// 						console.log('**********************FILLING CHILDREN END**************************');
	// 						resolve(tree);

	// 					}, function(){});

	// 				}, function(){});
	// 			}
	// 			else {
	// 				console.log('------------END----------------');
	// 				resolve(tree);
	// 			}
	// 		}, function(){});
	// 	});

	// };

	// populateTree(1234, sampleTreeNode).then(function(tree){
	// 	res.json(tree);
	// });


	var tree = {
		"name": "",
	    "children": []
	};

	var getChildNodesPromise = function(parentNode){
		return new Promise(function(resolve, reject){
			nodeModel.find({ 'parentNode':parentNode }, {}, function(err, nodes){
				if(err) return err;

				if(nodes) {
					console.log('**********************START**************************');
					console.log('nodes: '+nodes);
					resolve(nodes);
					console.log('**********************END**************************');
				}
				else {
					resolve('null');
				}
			});
		});
	};

	var getAllChildNodesPromise = function(parentNodes){
		console.log('parentNodes Array: '+parentNodes);
		return Promise.all(parentNodes.map(getChildNodesPromise));
	};

	var getChildren = function(currentNode){
		console.log('currentNode: '+currentNode);
		return new Promise(function(resolve, reject){
			getChildNodesPromise(currentNode).then(function(childNodes){
				if (childNodes.length) {
					console.log('-----------childNodes----------');
					console.log(childNodes);
					var treeChildren = [];
					childNodes.forEach(function(childNode){
						treeChildren.push({
							'name': childNode.url,
							// 'parent': childNode
							'children': []
						});
					});
					// resolve(treeChildren);
					// if (true) {}

					Promise.all(childNodes.map(function(childNode){return getChildNodesPromise(childNode.currentNode);}))
						.then(function(childNodes_s){
							// console.log('childNodes_s-------------------------------------'+JSON.stringify(childNodes_s));
							// console.log('treeChildren-------------------------------------'+JSON.stringify(treeChildren));
							// childNodes_s.forEach(function(childNodess, ind){
							// 	childNodess.forEach(function(childNode){
							// 		treeChildren[ind].children.push({
							// 			'name': childNode.url,
							// 			'children': getChildren(childNode.currentNode)
							// 		});
							// 	});
							// });

							// Promise.all(childNodes_s.map(function(childNodes, ind){return {'childNodes':childNodes, 'index':ind};}))
							// 	.then(function(childNodess){
							// 		console.log('childNodess: '+JSON.stringify(childNodess[0]));

							// 		Promise.all(childNodess.map(function(childNodes){
							// 			Promise.all(childNodes.childNodes.map(function(childNode){return getChildren(childNode.currentNode);}))
							// 				.then(function(treeLeaf){
							// 					return treeLeaf;
							// 				});
							// 		})).then(function(treeLeaf){
							// 			console.log('treeLeaf: '+treeLeaf);
							// 		});
							// 	});

							Promise.all(childNodes_s.map(function(childNodess){
								return Promise.all(childNodess.map(function(childNode){
									return getChildren(childNode.currentNode);
								})).then(function(treeLeaf){return treeLeaf;});
							})).then(function(treeLeafs){
								console.log('treeLeafs: '+treeLeafs);

							});

							// resolve(treeChildren);
						}, function(){});

					// Promise.all(childNodes.map(function(childNode){return getChildren(childNode.currentNode);}))
					// 	.then(function(childNodes_s){
					// 		console.log('childNodes_s-------------------------------------'+JSON.stringify(childNodes_s));
					// 		console.log('treeChildren-------------------------------------'+JSON.stringify(treeChildren));
					// 		childNodes_s.forEach(function(childNodess){
					// 			if (childNodess==='null') {
					// 				// resolve(treeChildren);
					// 			}
					// 			else {
					// 				childNodess.forEach(function(childNode, ind){
					// 					console.log('childNode--------: '+ind+'-'+JSON.stringify(childNode));
					// 					treeChildren[ind].children.push({'name':childNode.name, 'children':childNode.children});
					// 				});
					// 			}
					// 		});
					// 		resolve(treeChildren);
					// 	}, function(){});
				}
				else {
					resolve('null');
				}
			}, function(){});
		});
	};

	var populateTree = function(startNode){
		return new Promise(function(resolve, reject){
			getChildNodesPromise(startNode).then(function(parentNode){
				console.log('-----------parentNode----------');
				console.log(parentNode);
				console.log(parentNode[0].url);
				tree.name = parentNode[0].url;
				// tree.parent = parentNode[0].parentNode;

				getChildren(parentNode[0].currentNode).then(function(treeChildren){
					tree.children = treeChildren;
					resolve(tree);
				});

			}, function(){});
		});
	};

	populateTree(null).then(function(tree){
		console.log('$$$$$$$$$$$$$$$$------TREE------$$$$$$$$$$$$$$$$$');
		console.log(JSON.stringify(tree));
		console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
		res.json(tree);
	}, function(){});

	// getChildNodesPromise(1234).then(function(nodes){
	// 	console.log(nodes);
	// 	getAllChildNodesPromise(nodes.map(function(node){return node.currentNode}))
	// 		.then(function(){

	// 		}, function(){});
	// }, function(){});
});

module.exports = router;