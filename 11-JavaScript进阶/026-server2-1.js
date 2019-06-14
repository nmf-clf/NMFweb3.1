/*
* @Author: TomChen
* @Date:   2018-05-24 18:08:59
* @Last Modified by:   TomChen
* @Last Modified time: 2018-05-25 18:08:57
*/
var http = require('http');
//var fs = require('fs');

var server = http.createServer(function(req,res){

	res.end('<h1>hello nodejs,你好</h1>');
});

server.listen(3000,'127.0.0.1',function(){
	console.log("server is running at http://127.0.0.1:3000");
})