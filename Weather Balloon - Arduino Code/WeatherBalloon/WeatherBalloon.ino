/*
This program utilizes the arduino weather shield in order to develop a functional weather analysis balloon. The program reads the following sensors from the weather 
shield: humidity, pressure, battery level and reports the received data over the serial comm port. From these sensors we can calculate the current environments humidity, 
temperature, pressure and altitude. The code will also keep track of time starting from when the arduino was first powered on. The units of the values are as follows:

Relative humidity - percent humidity
Temperature - fahrenheit
Pressure - pascals
Altitude - meters
Time - seconds

New data is generated every 4-5 seconds. The data is then wirelessly transmitted in real-time to a receiving device. We used two Xbee Pro 60mW series
devices for the wireless communication. 

This program utilizes two main libraries in order to calculate current humidity, pressure, altitude and temperature values: the HTU21D Humidity Sensor Library 
and the MPL3115A2 Barometric Pressure Sensor Library. 

The code allows for battery level to be calculated, however that functionality is not utilized currently.

The program outputs the current values for humidity, temperature, pressure, altitude and time to a desktop application designed to accept the transmitted
data and present that data in real-time. This application offers the user the option to then save that data as a text file. 

*/

/*
Hardware Hookup:
  Connect the arduino and weather shield with soldered on headers.
  Connect the Xbee shield to the weather shield with soldered on headers.
  Connect one of the Xbee devices to the Xbee shield.
  Connect the other Xbee device to the Xbee explorer usb.

  The XBee Shield makes all of the connections you'll need
  between Arduino and XBee. If you have the shield make
  sure the SWITCH IS IN THE "DLINE" POSITION. That will connect
  the XBee's DOUT and DIN pins to Arduino pins 2 and 3.
*/

// We'll use SoftwareSerial to communicate with the XBee:
#include <SoftwareSerial.h>
 
// XBee's DOUT (TX) is connected to pin 2 (Arduino's Software RX)
// XBee's DIN (RX) is connected to pin 3 (Arduino's Software TX)
SoftwareSerial XBee(2, 3); // RX, TX

#include <Wire.h> //I2C needed for sensors
#include "MPL3115A2.h" //Pressure sensor library
#include "HTU21D.h" //Humidity sensor library 
#include <stdlib.h>
#include <Time.h> 

MPL3115A2 myPressure; //Create an instance of the pressure sensor
HTU21D myHumidity; //Create an instance of the humidity sensor
char buff[10];

//Hardware pin definitions
// digital I/O pins
const byte STAT1 = 7;
const byte STAT2 = 8;

// analog I/O pins
const byte REFERENCE_3V3 = A3;
const byte LIGHT = A1;
const byte BATT = A2;

//Global Variables
unsigned long timePassed = 0;
long lastSecond; //The millis counter to see when a second rolls by
byte seconds; //When it hits 60, increase the current minute
byte minutes; //Keeps track of where we are in various arrays of data

float humidity = 0; // [%]
float altitude = 0;// [meters]
float tempf = 0; // [temperature F]
float pressure = 0;//[pascal]
float batt_lvl = 11.8; //[analog value from 0 to 1023]

void setup()
{
  // Set up both ports at 9600 baud. This value is most important
  // for the XBee. Make sure the baud rate matches the config
  // setting of your XBee.
  XBee.begin(9600);

  Serial.begin(9600); //Line important for weather shield as well

  pinMode(STAT1, OUTPUT); //Status LED Blue
  pinMode(STAT2, OUTPUT); //Status LED Green

  pinMode(REFERENCE_3V3, INPUT);
  pinMode(LIGHT, INPUT);

  //Configure the pressure sensor
  myPressure.begin(); // Get sensor online
  myPressure.setModeBarometer(); // Measure pressure in Pascals from 20 to 110 kPa
  myPressure.setOversampleRate(7); // Set Oversample to the recommended 128
  myPressure.enableEventFlags(); // Enable all three pressure and temp event flags
  
  //Configure the humidity sensor
  myHumidity.begin();

  seconds = 0;
  lastSecond = millis();

  // turn on interrupts
  interrupts();
}


void loop()
{
  //Keep track of which minute it is
  if(millis() - lastSecond >= 1000)
  {
    digitalWrite(STAT1, HIGH); //Blink stat LED
    lastSecond += 1000;

    //Report all readings every second
    printWeather();

    digitalWrite(STAT1, LOW); //Turn off stat LED
  }
  delay(100);
}


//Calculates each of the variables 
void calcWeather()
{
  //calc time
  timePassed = (millis() / 1000);

//calc pressure
  myPressure.begin(); // Get sensor online
  myPressure.setModeAltimeter(); // Measure pressure in Pascals from 20 to 110 kPa  
  myPressure.setOversampleRate(7); // Set Oversample to the recommended 128
  myPressure.enableEventFlags(); // Enable all three pressure and temp event flags
  pressure = myPressure.readPressure();

delay(500);

 //calc altitude
  altitude = (myPressure.readAltitude());
  myPressure.begin(); // Get sensor online
  myPressure.setModeBarometer(); // Measure pressure in Pascals from 20 to 110 kPa
  myPressure.setOversampleRate(7); // Set Oversample to the recommended 128
  myPressure.enableEventFlags(); // Enable all three pressure and temp event flags

  //Calc humidity
  humidity = myHumidity.readHumidity();

  //Calc tempf from pressure sensor
  tempf = myPressure.readTempF();

  //Calc battery level
  batt_lvl = get_battery_level();
}


//Returns the voltage of the raw pin based on the 3.3V rail
//This allows us to ignore what VCC might be (an Arduino plugged into USB has VCC of 4.5 to 5.2V)
//Battery level is connected to the RAW pin on Arduino and is fed through two 5% resistors:
//3.9K on the high side (R1), and 1K on the low side (R2)
float get_battery_level()
{
  float operatingVoltage = analogRead(REFERENCE_3V3);
  float rawVoltage = analogRead(BATT);
  operatingVoltage = 3.30 / operatingVoltage; //The reference voltage is 3.3V
  rawVoltage = operatingVoltage * rawVoltage; //Convert the 0 to 1023 int to actual voltage on BATT pin
  rawVoltage *= 4.90; //(3.9k+1k)/1k - multiple BATT voltage by the voltage divider to get actual system voltage
  return(rawVoltage);
}


//Transmits the calculated data to the receiving Xbee device 
void printWeather()
{

  calcWeather(); //Go calc all the various sensors and variables

//sends th humidity value
  XBee.write("\t\t#");
  dtostrf(humidity, 4, 1, buff);  //4 is mininum width, 6 is precision
  XBee.write(buff); 
  XBee.write(",\t\t\t#");

//sends the temperature value
  dtostrf(tempf, 4, 2, buff);  //4 is mininum width, 6 is precision
  XBee.write(buff); 
  XBee.write(",\t\t#");

//sends the pressure value
  dtostrf(pressure, 4, 2, buff);  //4 is mininum width, 6 is precision
  XBee.write(buff);
  XBee.write(",\t\t#");

//sends the altitude value
  dtostrf(altitude, 4, 2, buff);  //4 is mininum width, 6 is precision
  XBee.write(buff);
  XBee.write(",\t#");

//sends the time value
  dtostrf(timePassed, 4, 2, buff);  //4 is mininum width, 6 is precision
  XBee.write(buff);

//provides a buffer space between data intervals 
  XBee.write(",\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");

//waits for next data interval   
  delay(3500);

}


