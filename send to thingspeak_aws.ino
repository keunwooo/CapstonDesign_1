#include <Time.h>
#include <TimeLib.h>
#include <ESP8266WiFi.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define myPeriodic 15 //in sec | Thingspeak pub is 15sec
#define ONE_WIRE_BUS 2  // DS18B20 on arduino pin2 corresponds to D4 on physical board

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature DS18B20(&oneWire);
float prevTemp = 0;
const char* server = "api.thingspeak.com";
const char* server2 = "18.191.228.12";
String apiKey ="XLTL6DFFAB7QER25";
const char* MY_SSID = "SK_WiFiGIGAEDBC";
//const char* MY_SSID = "3627";
const char* MY_PWD = "1701012482";
//const char* MY_PWD = "hyeongchan";
int sent = 0;
String date ="";


void setup() {
  Serial.begin(115200);
  setTime(18,43,0,19,3,19); //테스트용
  connectWifi();
}

void loop() {
  float temp;
  
  DS18B20.requestTemperatures(); 
  temp = DS18B20.getTempCByIndex(0);

  //Serial.print(String(sent)+" Temperature: ");
  digitalClockDisplay(); //테스트용
  Serial.print(date); //테스트용
 Serial.println(temp);
 
  sendTeperatureTS(temp);
  sendTeperatureSV(temp,date);
  
  int count = myPeriodic;
 // while(count--)
 // delay(1);
  //서버 시간차이 줄이는 구문인데 필요x
}

void connectWifi()
{
  Serial.print("Connecting to "+*MY_SSID);
  WiFi.begin(MY_SSID, MY_PWD);
  while (WiFi.status() != WL_CONNECTED) {
  delay(1000);
  Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("Connected");
  Serial.println("");  
}//end connect

void sendTeperatureTS(float temp)
{  
   WiFiClient client;
   
   if (client.connect(server, 80)) { // use ip 184.106.153.149 or api.thingspeak.com
   Serial.println("TS WiFi Client connected ");
   
   String postStr = apiKey;
   postStr += "&field1=";
   postStr += String(temp);
   postStr += "\r\n\r\n";
   
   client.print("POST /update HTTP/1.1\n");
   client.print("Host: api.thingspeak.com\n");
   client.print("Connection: close\n");
   client.print("X-THINGSPEAKAPIKEY: " + apiKey + "\n");
   client.print("Content-Type: application/x-www-form-urlencoded\n");
   client.print("Content-Length: ");
   client.print(postStr.length());
   client.print("\n\n");
   client.print(postStr);
   delay(60000);
   //delay(15000);
   
   }//end if
 client.stop();
}//end send

void sendTeperatureSV(float temp,String date)
{  
   WiFiClient client;
     if (client.connect(server2, 3000)) { 
   Serial.println("SV WiFi Client connected ");
   
   //client.print("GET /data HTTP/1.1\n");
   
    String getheader = "GET /data?date="+ String(date)+"&temper="+ String(temp) +" HTTP/1.1";
    client.println(getheader);
    client.println("User-Agent: ESP8266 ");  
   client.print("Host: 18.191.228.12\n");
   client.print("Connection: close\n");
   client.print("\n\n");

   delay(60000);
   //delay(15000);

  }
  client.stop();
}


  
  /* if (client.connect(server2, 3000)) { // use ip 184.106.153.149 or api.thingspeak.com
   Serial.println("SV WiFi Client connected ");

  String postStr = "";//apiKey;
   postStr += "&temper=";
   postStr += String(temp);
   postStr += "\r\n\r\n";
   
   client.print("POST /data HTTP/1.1\n");
   client.print("Host: 18.191.228.12\n");
   client.print("Connection: close\n");
   //client.print("X-THINGSPEAKAPIKEY: " + apiKey + "\n");
   //client.print("Content-Type: application/x-www-form-urlencoded\n");
   //client.print("Content-Length: ");
   //client.print(postStr.length());
   client.print("\n\n");
   client.print(postStr);
   
   delay(5000);
   }//end if
*/


void digitalClockDisplay(){ //아두이노에서 시간 테스트
    date="";
    //Serial.print(year()); 
    date+=String(year());
    printDigits(month());
    //date+=String(month());
    printDigits(day());
    date+=",";
    //Serial.print(",");
    printDigits(hour());
    date+=":";
    //Serial.print(":");
    printDigits(minute());
    date+=",";
    //Serial.print(",");
 }

 void printDigits(int digits){
    if (digits < 10)
    date+="0"+String(digits);
    else
    date+=String(digits);
       //Serial.print('0');
    //Serial.print(digits);

 }
