var net = require('net');
var Socket25001;
var conttxn_count = 0;
var CARDWAIT_count = 0;
var server1 = net.createServer(function(socket){
	Socket25001 = socket;
	socket.write('100,0,45,LoginRequired,\n');
	socket.on('data',function(data){
	console.log('Receiving data at port 25001 from	PAYMENT SERVICE:'+ data.toString()); 
	});
	socket.on('close',function(){console.log('closed');});
	sleep(3000).then(()=>{
	socket.write('100,0,45,Login Required,\n');
	console.log('Login required from 25001...');
	})
});

server1.listen(25001,'127.0.0.1');
var server2 = net.createServer(function(socket){
	socket.on('data',function(data){
		console.log('Receiving data from Payment Service: '+data.toString());//REQINFO,6,0,ALL,-1
		var data_ps = data.toString();
		var data_arr = data_ps.split(",");
		console.log('0th element is:'+data_arr[0]);
		if(data_arr[0] == 'CANCELCARDWAIT'){
			socket.write('-99,0,,,,,,,0,\n');
			console.log('99 login successful --- from 25001');
			Socket25001.write('100,0,46,Ready,\n');
			console.log('Ready ... second from 25001');
		}
		if(data_arr[0] == 'REQINFO'){
			console.log('first element is REQINFO');
			socket.write('0,1,,,,EMV,,,,,\n');//first 8 digits recognising PED
		} else if (data_arr[0] == 'L2'){
			console.log('first element is REQINFO');
			socket.write('0,1,,,,Login Successful,,,,,9849\n');
			sleep(4000).then(()=>{
				Socket25001.write('100,0,190,Contactless Initialisation Success,\n);
			})
			sleep(4500).then(()=>{
				Socket25001.write('100,0,46,Ready,\n');
				console.log('Ready from 25001');
			})
		} else if (data_arr[0] == 'CARDWAIT'){
			Socket25001.write('100,0,3,Awaiting Card'\n');
			if(CARDWAIT_count == 0){
				sleep(9000).then(()=>{
					socket.write('-99,,,,,,,,0,\n');
					console.log('99 Login success from CARDWAIT block');
				})
				sleep(9500).then(()=>{
					Socket25001.write('100,0,46,Ready,\n');
					console.log('Ready from CARDWAIT block');
				})
			}
		} else if (data_arr[0] == 'T'){
			console.log('Total Amount: '+data_arr[10]);
			Socket25001.write('100,0,32,Starting Transaction,\n');
			sleep(10000).then(()=>{
				Socket25001.write('100,0,3,Awaiting Card,\n');
			})
			sleep(12000).then(()=>{
				Socket25001.write('100,0,5,CardInserted,\n');
			})
			sleep(14000).then(()=>{
				Socket25001.write('100,0,7,CardProcessing,\n');
			})
		}// more conditions here
	});
});

server2.listen(25000,'127.0.0.1');
function sleep(time){
	return new Promise((resolve)=>setTimeout(resolve,time));
}
