var express = require('express');
var app = express();
const fs = require('fs');
var dateTime = require('node-datetime');
mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'me2',
    password: '',
    database: 'mytemp'
})
connection.connect();


app.get('/', function(req, res) {
  res.send('Hello World!');
});

var seq=0;
var seq2=0;

function insert_sensor(value,time) {
  obj = {};
  //obj.seq = seq;
  //obj.device = device;
  //obj.unit = unit;
  //obj.type = type;
  obj.value = value;
        obj.time =time;
  //obj.ip = ip.replace(/^.*:/, '')

  var query = connection.query('insert into sensors set ?', obj, function(err, rows, cols) {
    if (err) throw err;
    console.log("database insertion ok= %j", obj);
  });
}


app.get('/log',function(req,res){


        res.send('log is');


        /*fs.appendFile('log.txt', JSON.stringify(req.query)+"\n",function (err){
        if (err) throw err
        console.log("%j",req.query);
        res.end("Got "+String(seq++) + " "+JSON.stringify(req.query));
        });*/
})


app.get('/data',function(req,res){


        //var date = req.query.date;

        var temper = req.query.temper;
        var moment = require('moment');
        require('moment-timezone');
        moment.tz.setDefault("Asia/Seoul");
        var date= moment().format('YYYY-MM-DD HH:mm:ss');

//      require('date-utils');
//      var newDate = new Date();
//      var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
//      var date=time;
        //var dt = dateTime.create();
        //var date = dt.format('Y-m-d H:M:S');

        //console.log(date);
        var temp=new Date(date).toLocaleString().split(' ');
        //var temp=date.split(' ');
        //console.log(temp);

        var ymd=temp[0].split('/');
        //console.log(ymd);
        var temp2=ymd[2].split(',');

        for(var k=0;k<2;k++){
        if(ymd[k]<10)
                ymd[k]="0"+ymd[k];
        }
        var hms = temp[1].split(':');
        //console.log(hms);

        if(temp[2]=='PM' && hms[0]<12){
        hms[0]=Number(hms[0])+12;
        //console.log(hms[0]);
        }



        fs.appendFile('data.txt',temp2[0]+ymd[0]+ymd[1]+","+String(hms[0])+":"+String(hms[1])+":"+String(hms[2])+","+String(temper)+"\n",function (err){
        if (err) throw err
        console.log("Arduino to server ok = %j",req.query.temper);
        res.end("Got "+String(seq++) + " "+JSON.stringify(req.query));
        });

        insert_sensor(temper,date);
        //res.end('OK:' + JSON.stringify(req.query));
})


app.get('/dump',function(req,res){


        var count = req.query.count;
        var fs=require("fs");

        data=fs.readFileSync('data.txt','utf-8')

        var temp='\0';
        var result='\0';

        result =data.split("\n");

        for(var i=result.length-2;i>=result.length-count-1;i--){


                if(i>=0){
                        temp+=result[i]+"::";

                }
        }

                var rev= temp.split("::");
                ret="\0";

                for(var i=rev.length-2;i>=0;i--){

                ret+=rev[i]+'</br>';
                }

        res.send(ret)
        res.end(seq++);

        })

app.get('/graph', function (req, res) {
    console.log('got app.get(graph)');
    var html = fs.readFile('./graph.html', function (err, html) {
    html = " "+ html
    console.log('read file');

        var header="";

   //var qstr = 'SELECT * from sensors';
            var qstr = 'SELECT * from sensors ORDER BY time';
    connection.query(qstr, function(err, rows, cols) {
      if (err) throw err;

      var data = "";
      var comma = ""
      for (var i=0; i< rows.length; i++) {
         r = rows[i];
                //console.log(r.time);
               //data += comma + "[new Date(2019,03-09,00,38,"+r.id+"),"+ r.value +"]";
        var date=new Date(r.time).toLocaleString().split(' ');
              //console.log(date);
        var ymd=date[0].split('/');
              //console.log(ymd);
        var hms=date[1].split(':');

              if(date[2]=='AM'&&hms[0]==12){
                      hms[0]='0';
              }
        if(date[2]=='PM' && hms[0]<12){
        hms[0]=Number(hms[0])+12;
                hms[0]=String(hms[0]);
       // console.log(hms[0]);
        }

            //  console.log(hms);
        data+=comma+"[new Date("+ymd[2]+ymd[0]+","+ymd[1]+","+hms[0]+","+hms[1]+","+hms[2]+"),"+r.value + "]";
              comma = ",";
      }
      header = "data.addColumn('date', 'Date/Time');"
      header += "data.addColumn('number', 'Temperature');"
      html = html.replace("<%HEADER%>", header);
      html = html.replace("<%DATA%>", data);

      res.writeHeader(200, {"Content-Type": "text/html"});
      res.write(html);
      res.end();
    });
  });
})


var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('listening at http://%s:%s', host, port)
});
//app.listen(3000, function () {
//  console.log('Example app listening on port 3000!');
//})
