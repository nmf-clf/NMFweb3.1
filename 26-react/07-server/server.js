const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const server = http.createServer((req,res)=>{
	res.setHeader("Access-Control-Allow-Origin","*");
	let data = ['learn react','learn nodejs'];
	let dataSource = []
	for(var i=0;i<103;i++){
		dataSource.push({
			key: i,
			name: `Edward King ${i+1}`,
			age: 32,
			address: `London, Park Lane no. ${i}`,
		})
	}
	//res.end(JSON.stringify(data))
	//console.log("server-data::",data)
	//console.log("dataSource::",dataSource)
	res.end(JSON.stringify(dataSource))
});

// app.use((req,res,next)=>{
// 	//console.log(req.session);
// 	req.userInfo = req.session.userInfo || {};
// 	next();
// });

/* //4.添加处理post请求的中间件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//处理路由
app.use("/dataSource",require('./routes/dataSource.js')); */


server.listen(3000,'127.0.0.1',()=>{
	console.log('server is runing at 127.0.0.1:3000')
})