//app uses dummy transaction data
var net = require('net');

var Socket25001;
var conttxn_count = 0;
var CARDWAIT_count = 0;

var server1 = net.createServer(function(socket){
	Socket25001 = socket;
	socket.write('100,0,45,LoginRequired,\n');	// message sent to PAyment Service indicating pairing initiation
	socket.on('data',function(data){
		console.log('Receiving data at PORT 25001 from PAYMENT SERVICE: '+data.toString());
	});
	socket.on('close',function(){
		console.log("Received Socket close directive");
	});
	sleep(3000).then(() => {		
		socket.write('100,0,45,LoginRequired,\n');	
		console.log("login required from 25001 ...");
	})	
});

server1.listen(25001,'127.0.0.1');

var server2 = net.createServer(function(socket){
		
	socket.on('data',function(data){
		console.log('Receiving data from PAYMENT SERVICE: '+data.toString());//REQINFO,6,0,ALL,-1
		var data_ps = data.toString();		
		var data_arr = data_ps.split(",");
		console.log("HELLO 0th element: "+data_arr[0]);
		//socket.write('-99,0,,,,,,,0,,,,Login successful,,,,,,,,,,,,,,,,,,9849\n');
		if (data_arr[0] == 'CANCELCARDWAIT'){
			console.log("IF BLOCK OF CANCELCARDWAIT --- ");
			socket.write('-99,0,,,,,,,0,\n');
			console.log("99 login successful --- from 25001 ...");
			
			Socket25001.write('100,0,46,Ready,\n');
			console.log("Ready        second --- from 25001 ...");
		}
		if (data_arr[0] == 'REQINFO'){
				console.log("First comma separated value is REQINFO...");
				socket.write('0,1,,,,,,,,,,,,,,,,0|EMV|29874002,,,,,,,,,,,,,,,,,,\n');// use first 8 digits only for PED ID as seen in service log e.g. 29869310
								
		} else if (data_arr[0] == 'L2'){
			console.log("First comma separated value is L2...");
			//socket.write('0,1,,,,,,,,,,,,,,,,Login successful,,,,,,,,,,,,,,,,,, 9849,,,,,,,,,,,,,,,,,,\n'); 
			/*Getting error ERROR 2017-11-16 07:35:15:213 GMT IntegrationMessageHandler:911 - Unable to parse transaction response
java.lang.IllegalArgumentException: the nameMapping array and the number of columns read should be the same size (nameMapping length = 36, columns = 54)*/
			socket.write('0,1,,,,,,,,,,,,,,,,Login successful,,,,,,,,,,,,,,,,,,9849\n');
			sleep(4000).then(() => {
				Socket25001.write('100,0,190,Contactless Initialisation Success,\n');
			})
			sleep(4500).then(()=>{
				Socket25001.write('100,0,46,Ready,\n');
				console.log("Ready --- from 25001 ...");
			})
			
		} else if (data_arr[0] == 'CARDWAIT'){
			console.log("First comma separated value is CARDWAIT...");
			Socket25001.write('100,0,3,AwaitingCard,\n'); 
			if (CARDWAIT_count == 0) {
				sleep(9000).then(()=>{
					socket.write('-99,0,,,,,,,0,\n');
					console.log("99 LOGIN SUCCESS from cardwait block");
				})			
				sleep(9500).then(()=>{
					Socket25001.write('100,0,46,Ready,\n');
					console.log("READY from cardwait block");
				})
				
			} 
			/*else if (CARDWAIT_count == 1) {
				console.log("CARDWAIT_count value is :"+CARDWAIT_count);
				Socket25001.write('100,0,3,AwaitingCard,\n');
			}*/
				
		} else if (data_arr[0] == 'T'){
			console.log("First comma separated value is T...");
			console.log("TOTAL AMOUNT : "+data_arr[10]);
			Socket25001.write('100,0,32,StartingTransaction,\n');
			sleep(10000).then(()=>{
				Socket25001.write('100,0,3,AwaitingCard,\n');
				console.log("Awaiting Card AFTER STARTTRANSAC --- from 25001 ...");
			})
			sleep(12000).then(()=>{
				Socket25001.write('100,0,5,CardInserted,\n');
				console.log("CardInserted --- from 25001 ...");
			})
			sleep(14000).then(()=>{
				Socket25001.write('100,0,7,CardProcessing,\n');
				console.log("CardProcessing --- from 25001 ...");
			})
			sleep(16000).then(()=>{
				Socket25001.write('100,0,12,PinEntry,\n');
				console.log("PinEntry --- from 25001 ...");
			})
			sleep(19000).then(()=>{
				Socket25001.write('100,0,13,RiskManagementComplete,\n');
				console.log("RiskManagementComplete --- from 25001 ...");
			})
			sleep(21000).then(()=>{
				Socket25001.write('100,0,14,AuthorisingTxn,\n');
				console.log("AuthorisingTxn --- from 25001 ...");
			})
			sleep(22000).then(()=>{
				Socket25001.write('100,0,15,WaitingForResult,\n');
				console.log("WaitingForResult --- from 25001 ...");
			})
			sleep(23000).then(()=>{
				Socket25001.write('100,0,16,AuthResultReceived,\n');
				console.log("AuthResultReceived --- from 25001 ...");
			})
			sleep(24000).then(()=>{
				//socket.write('6,0,13.73,0.00,0.00,476173******0226,1215,,,20171124135821,6651939,90010122,VISA DEBIT02,0.00,8696,789DE,,AUTH CODE:789DE,ICC,826,,,,,,,2,10000004801,0,0,0,n3zgY69LfDFkHunn5U4tCsQ1TQz7v8bPV0HKwGCdVkQeFqlDDl9Hg/daScaVmzRfXtAk1g==,,,AuthDB\CSTMIDB025V3A2,8330525\n');
				
				//socket.write('0,1,305.00,0.00,0.00,476173******0010,1215,,,20171128105749,6651939,90010122,ELECTRON DE VISA,0.00,8979,789DE,,AUTHORISED,ICC,826,,,,,,,2,10283107901,0,0,0,T0rs1P1g0GplH2B/gdHAQwNUfa4tp7fBNq9quU72Z3qxPykhPluuaxv6Z2j5tgo9WTd66Q==,,,AuthDB\CSTMIDB025V3A2,8453730\n');
				
				socket.write('6,0,13.73,0.00,0.00,476173******0119,1215,,,20171130122739,6651939,90010122,CREDITO DE VISA,0.00,9207,789DE,,AUTH CODE:789DE,ICC,826,,,,,,,2,10000016001,0,0,0,LI6RPYaHBzLFYM5c1BNfVwuiYvGqwEA4bulV14Emrpxz9i4jMAfSoguxiQMPwHg36hPEuA==,,,AuthDB\CSTMIDB025V3A2,8481737\n');
				
				console.log("CARD DETAILS STRING --- from 25001 ...");
			})
			sleep(25000).then(()=>{
				Socket25001.write('100,0,21,ConfirmingTxn,\n');
				console.log("ConfirmingTxn --- from 25001 ...");
			})
			sleep(26000).then(()=>{
				Socket25001.write('100,0,23,FinalResultReceived,\n');
				console.log("FinalResultReceived --- from 25001 ...");
			})
			sleep(27000).then(()=>{
				Socket25001.write('100,0,25,RemoveCard,\n');
				console.log("RemoveCard --- from 25001 ...");
			})
			sleep(30000).then(()=>{
				//Socket25001.write('100,0,170,Printing Merchant Receipt,XML=<?xml version="1.0" encoding="utf-8"?><VoucherDetails><TrainingMode>false</TrainingMode><ReceiptType>Merchant</ReceiptType><Header>DCT644</Header><PTID>29874002</PTID><TID>90010122</TID><MID>6651939</MID><MkTransactionID>8330525</MkTransactionID><TxnDateTime>2017-11-24 13:58:08</TxnDateTime><CardScheme>VISA DEBIT02</CardScheme><PAN>************0226</PAN><TxnType>SALE</TxnType><CaptureMethod>ICC</CaptureMethod><CustomerPresent>true</CustomerPresent><ECommerce>false</ECommerce><ContAuth>false</ContAuth><AccountOnFile>false</AccountOnFile><PinEntered>true</PinEntered><CreditDebitMessage>Please debit my account</CreditDebitMessage><CurrencySymbol></CurrencySymbol><CurrencyAbbreviation>GBP</CurrencyAbbreviation><Amount>13.73</Amount><Total>13.73</Total><CVM>PIN VERIFIED</CVM><KeepText1>Please keep receipt</KeepText1><KeepText2>for your records</KeepText2><EFTSN>8696</EFTSN><AuthCode>789DE</AuthCode><Reference>0036 1317 131714</Reference><AID>A0000000031010</AID><AppEff>090701</AppEff><AppSeq>05</AppSeq><AppExp>151231</AppExp><CardHolder>VISA DEBIT</CardHolder><CardAVN>008C</CardAVN><Footer>DCT644</Footer><GratuityBoxRequired>false</GratuityBoxRequired><ExtendedReceipt>false</ExtendedReceipt><DisableCurrencySymbol>false</DisableCurrencySymbol><AuthOnly>false</AuthOnly><CardSchemePrintText></CardSchemePrintText><PrintAttempts>1</PrintAttempts><ContactlessMSD>false</ContactlessMSD><TokenID>10000004801</TokenID><TokenRegistrationResult>Registration successful</TokenRegistrationResult><TokenRegistrationOnly>false</TokenRegistrationOnly><ARC>00</ARC><ExpiryDate>1215</ExpiryDate><Duplicate>false</Duplicate><Gratuity>0</Gratuity></VoucherDetails>\n');
				
				Socket25001.write('100,0,170,Printing Merchant Receipt,XML=<?xml version="1.0" encoding="utf-8"?><VoucherDetails><TrainingMode>false</TrainingMode><ReceiptType>Merchant</ReceiptType><Header>DCT644</Header><PTID>29874002</PTID><TID>90010122</TID><MID>6651939</MID><MkTransactionID>8481737</MkTransactionID><TxnDateTime>2017-11-30 12:27:28</TxnDateTime><CardScheme>CREDITO DE VISA</CardScheme><PAN>************0119</PAN><TxnType>SALE</TxnType><CaptureMethod>ICC</CaptureMethod><CustomerPresent>true</CustomerPresent><ECommerce>false</ECommerce><ContAuth>false</ContAuth><AccountOnFile>false</AccountOnFile><PinEntered>true</PinEntered><CreditDebitMessage>Please debit my account</CreditDebitMessage><CurrencySymbol></CurrencySymbol><CurrencyAbbreviation>GBP</CurrencyAbbreviation><Amount>13.73</Amount><Total>13.73</Total><CVM>PIN VERIFIED</CVM><KeepText1>Please keep receipt</KeepText1><KeepText2>for your records</KeepText2><EFTSN>9207</EFTSN><AuthCode>789DE</AuthCode><Reference>0015 1317 131714</Reference><AID>A0000000031010</AID><AppEff>090701</AppEff><AppSeq>01</AppSeq><AppExp>151231</AppExp><CardHolder>VISA ACQUIRER TEST CARD 01</CardHolder><CardAVN>008C</CardAVN><Footer>DCT644</Footer><GratuityBoxRequired>false</GratuityBoxRequired><ExtendedReceipt>false</ExtendedReceipt><DisableCurrencySymbol>false</DisableCurrencySymbol><AuthOnly>false</AuthOnly><CardSchemePrintText></CardSchemePrintText><PrintAttempts>1</PrintAttempts><ContactlessMSD>false</ContactlessMSD><TokenID>10000016001</TokenID><TokenRegistrationResult>Registration successful</TokenRegistrationResult><TokenRegistrationOnly>false</TokenRegistrationOnly><ARC>00</ARC><ExpiryDate>1215</ExpiryDate><Duplicate>false</Duplicate><Gratuity>0</Gratuity></VoucherDetails>\n');
				
				console.log("Printing Merchant Receipt --- from 25001 ...");
			})
			sleep(32000).then(()=>{
				Socket25001.write('100,0,19,ContinueRequired,\n');
				console.log("ContinueRequired --- from 25001 ...");
			})
		} else if (data_arr[0] == 'CONTTXN'){
			//conttxn_count++;
			console.log("First comma separated value is CONTTXN...");
			console.log("Count of CONTTXN: "+conttxn_count);
			if (conttxn_count == 0){
				//Socket25001.write('100,0,530,Printing Customer Receipt,XML=<?xml version="1.0" encoding="utf-8"?><VoucherDetails><TrainingMode>false</TrainingMode><ReceiptType>Customer</ReceiptType><Header>DCT644</Header><PTID>29874002</PTID><TID>####0122</TID><MID>##51939</MID><MkTransactionID>8330525</MkTransactionID><TxnDateTime>2017-11-24 13:58:08</TxnDateTime><CardScheme>VISA DEBIT02</CardScheme><PAN>************0226</PAN><TxnType>SALE</TxnType><CaptureMethod>ICC</CaptureMethod><CustomerPresent>true</CustomerPresent><ECommerce>false</ECommerce><ContAuth>false</ContAuth><AccountOnFile>false</AccountOnFile><PinEntered>true</PinEntered><CreditDebitMessage>Please debit my account</CreditDebitMessage><CurrencySymbol></CurrencySymbol><CurrencyAbbreviation>GBP</CurrencyAbbreviation><Amount>13.73</Amount><Total>13.73</Total><CVM>PIN VERIFIED</CVM><KeepText1>Please keep receipt</KeepText1><KeepText2>for your records</KeepText2><EFTSN>8696</EFTSN><AuthCode>789DE</AuthCode><Reference>0036 1317 131714</Reference><AID>A0000000031010</AID><AppEff>090701</AppEff><AppSeq>05</AppSeq><AppExp>151231</AppExp><CardHolder>VISA DEBIT</CardHolder><CardAVN>008C</CardAVN><Footer>DCT644</Footer><GratuityBoxRequired>false</GratuityBoxRequired><ExtendedReceipt>false</ExtendedReceipt><DisableCurrencySymbol>false</DisableCurrencySymbol><AuthOnly>false</AuthOnly><CardSchemePrintText></CardSchemePrintText><PrintAttempts>1</PrintAttempts><ContactlessMSD>false</ContactlessMSD><TokenID>10000004801</TokenID><TokenRegistrationResult>Registration successful</TokenRegistrationResult><TokenRegistrationOnly>false</TokenRegistrationOnly><ARC>00</ARC><ExpiryDate>1215</ExpiryDate><Duplicate>false</Duplicate><Gratuity>0</Gratuity></VoucherDetails>\n');
				
				Socket25001.write('100,0,530,Printing Customer Receipt,XML=<?xml version="1.0" encoding="utf-8"?><VoucherDetails><TrainingMode>false</TrainingMode><ReceiptType>Customer</ReceiptType><Header>DCT644</Header><PTID>29874002</PTID><TID>####0122</TID><MID>##51939</MID><MkTransactionID>8481737</MkTransactionID><TxnDateTime>2017-11-30 12:27:28</TxnDateTime><CardScheme>CREDITO DE VISA</CardScheme><PAN>************0119</PAN><TxnType>SALE</TxnType><CaptureMethod>ICC</CaptureMethod><CustomerPresent>true</CustomerPresent><ECommerce>false</ECommerce><ContAuth>false</ContAuth><AccountOnFile>false</AccountOnFile><PinEntered>true</PinEntered><CreditDebitMessage>Please debit my account</CreditDebitMessage><CurrencySymbol></CurrencySymbol><CurrencyAbbreviation>GBP</CurrencyAbbreviation><Amount>13.73</Amount><Total>13.73</Total><CVM>PIN VERIFIED</CVM><KeepText1>Please keep receipt</KeepText1><KeepText2>for your records</KeepText2><EFTSN>9207</EFTSN><AuthCode>789DE</AuthCode><Reference>0015 1317 131714</Reference><AID>A0000000031010</AID><AppEff>090701</AppEff><AppSeq>01</AppSeq><AppExp>151231</AppExp><CardHolder>VISA ACQUIRER TEST CARD 01</CardHolder><CardAVN>008C</CardAVN><Footer>DCT644</Footer><GratuityBoxRequired>false</GratuityBoxRequired><ExtendedReceipt>false</ExtendedReceipt><DisableCurrencySymbol>false</DisableCurrencySymbol><AuthOnly>false</AuthOnly><CardSchemePrintText></CardSchemePrintText><PrintAttempts>1</PrintAttempts><ContactlessMSD>false</ContactlessMSD><TokenID>10000016001</TokenID><TokenRegistrationResult>Registration successful</TokenRegistrationResult><TokenRegistrationOnly>false</TokenRegistrationOnly><ARC>00</ARC><ExpiryDate>1215</ExpiryDate><Duplicate>false</Duplicate><Gratuity>0</Gratuity></VoucherDetails>\n');
				
				console.log("Printing Customer Receipt --- from 25001 ...");
				sleep(2000).then(()=>{
					Socket25001.write('100,0,19,ContinueRequired,\n');
					console.log("ContinueRequired AFTER Printing Customer Receipt --- from 25001 ...");
				})
				
				conttxn_count = 1; // setting count of conttxn_count to 1 for CardRemoved response from JMR Stub for next CONTTXN from Payment Service
				console.log("VALUE OF conttxn_count has been set to : "+conttxn_count+" in first block...");
			} else if (conttxn_count == 1){
				console.log("SECOND BLOCK CONTTXN...");
				console.log("Count of CONTTXN: "+conttxn_count);
				//conttxn_count = 0; // resetting to 0 for next card payment transaction (still need to check logic)
				console.log("VALUE OF conttxn_count has been set to : "+conttxn_count+" in second block...");
				
				//socket.write('0,1,305.00,0.00,0.00,476173******0010,1215,,,20171128105749,6651939,90010122,ELECTRON DE VISA,0.00,8979,789DE,,AUTHORISED,ICC,826,,,,,,,2,10283107901,0,0,0,T0rs1P1g0GplH2B/gdHAQwNUfa4tp7fBNq9quU72Z3qxPykhPluuaxv6Z2j5tgo9WTd66Q==,,,AuthDB\CSTMIDB025V3A2,8453730\n');
				
				socket.write('6,0,13.73,0.00,0.00,476173******0119,1215,,,20171130122739,6651939,90010122,CREDITO DE VISA,0.00,9207,789DE,,AUTH CODE:789DE,ICC,826,,,,,,,2,10000016001,0,0,0,LI6RPYaHBzLFYM5c1BNfVwuiYvGqwEA4bulV14Emrpxz9i4jMAfSoguxiQMPwHg36hPEuA==,,,AuthDB\CSTMIDB025V3A2,8481737\n');
				
				console.log("CARD DETAILS STRING --- from 25001 ...");
				sleep(2000).then(()=>{
					Socket25001.write('100,0,6,CardRemoved,\n');
					console.log("CardRemoved AFTER Printing Customer Receipt --- from 25001 ...");
				})
				
				sleep(4000).then(()=>{
					Socket25001.write('100,0,46,Ready,\n');
					console.log("Ready AFTER CardRemoved--- from 25001 ...");					
				})
				
				CARDWAIT_count = 1;
				sleep(6000).then(()=>{
					Socket25001.write('100,0,3,AwaitingCard,\n');
					console.log("AwaitingCard AFTER Ready in CONTTXN--- from 25001 ...");
				})
			}			
		}
	});
	socket.on('close',function(){
		console.log("Received Socket close directive");
	});
});

server2.listen(25000,'127.0.0.1');

function sleep(time){
	return new Promise((resolve) => setTimeout(resolve, time));
}
