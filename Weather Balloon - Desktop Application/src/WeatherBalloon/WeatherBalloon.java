/*
This class establishes a connection with the serial port in order to listen for new incoming data from the weather balloon.
The code will attach an event listener on the serial port and alert the program once data becomes available through the port.
This class allows for different devices to access the weather balloon data by dynamically establishing the port depending on 
your system. The code allows for the following systems to be used: Mac OS X, Linux or Windows.
The Xbee Explorer usb must be plugged into a port on your device in order for this program to receive the data coming
from the arduino. This program only receives and stores the data as a string, the Output class actually displays the data
by creating an instance of the WeatherBalloon class.
 */
package WeatherBalloon;

import gnu.io.CommPortIdentifier;
import gnu.io.PortInUseException;
import gnu.io.SerialPort;
import gnu.io.SerialPortEvent;
import gnu.io.SerialPortEventListener;
import gnu.io.UnsupportedCommOperationException;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.TooManyListenersException;

/*This class utilizes the interface SerialPortEventListener in order to listen over the port
that the Xbee Explorer usb is connected to. This way the data recievied through the Xbee reciever
will be accessible by the weather balloon desktop application */
public class WeatherBalloon implements SerialPortEventListener {
  
//establishing the different possible port for different platforms. Makes the program more portable.    
SerialPort serialPort;
    /** The port we're normally going to use. */
private static final String PORT_NAMES[] = {                  
        "/dev/tty.usbserial-A9007UX1", // Mac OS X
        "/dev/ttyUSB0", // Linux
        "COM6", // Windows
};

//Global variables 
private BufferedReader input;
private OutputStream output;
private static final int TIME_OUT = 2000;
private static final int DATA_RATE = 9600;

//This method will initialize the serial port for recieving the incoming data
public void initialize() {
    //establishes the port identifier 
    CommPortIdentifier portId = null;
    Enumeration portEnum = CommPortIdentifier.getPortIdentifiers();

    //First, Find an instance of serial port as set in PORT_NAMES.
    while (portEnum.hasMoreElements()) {
        CommPortIdentifier currPortId = (CommPortIdentifier) portEnum.nextElement();
        for (String portName : PORT_NAMES) {
            if (currPortId.getName().equals(portName)) {
                portId = currPortId;
                break;
            }
        }
    }
    //response if not port is found
    if (portId == null) {
        System.out.println("Could not find COM port.");
        return;
    }

    try {
        //opens the port and sets the port parameters 
        serialPort = (SerialPort) portId.open(this.getClass().getName(),
                TIME_OUT);
        serialPort.setSerialPortParams(DATA_RATE,
                SerialPort.DATABITS_8,
                SerialPort.STOPBITS_1,
                SerialPort.PARITY_NONE);

        // open the streams
        input = new BufferedReader(new InputStreamReader(serialPort.getInputStream()));
        output = serialPort.getOutputStream();
        
        //attaches an event listerner to the port
        serialPort.addEventListener(this);
        serialPort.notifyOnDataAvailable(true);
        
        //exception handling while initializing the port
    } catch (PortInUseException | UnsupportedCommOperationException | IOException | TooManyListenersException e) {
        System.err.println(e.toString());
    }
}

//This method will close the port and remove the event listener from the port
public synchronized void close() {
    if (serialPort != null) {
        serialPort.removeEventListener();
        serialPort.close();
    }
}

    /**
     *
     * @param oEvent
     */
    @Override
    /*Once data becomes available through the port, the event listener attached to the port will notify the serialEvent method
     of the new data. This method will then read the incoming data. */
public synchronized void serialEvent(SerialPortEvent oEvent) {
    //checks if the port has available data
 if (oEvent.getEventType() == SerialPortEvent.DATA_AVAILABLE) { 
    try {
        //if there is data coming over the port, that data will be read and stored as a string
        String inputLine;
        
        if (input.ready()) {
            inputLine = input.readLine();
            System.out.println(inputLine);
        }
        //exception handling during the data read
    } catch (Exception e) {
        System.err.println(e.toString());
    }
 }
// Ignore all the other eventTypes, but you should consider the other ones.
}

/*This programs main method will begin the process of listening to the serial port connected to the weather balloon and
  read the incoming weather related data from the port */
public static void main(String[] args) throws Exception {
    //creating an instance of the class
    WeatherBalloon main = new WeatherBalloon();
    //initializing the port and placing the event listener on the port
    main.initialize();
    Thread t;
    t = new Thread() {
        @Override
        //running the thread constantly to listen for new incoming data to be sent over the port
        public void run() {
            //the following line will keep this app alive for 1000 seconds,
            //waiting for events to occur and responding to them (printing incoming messages to console).
            try {Thread.sleep(1000000);} catch (InterruptedException ie) {}
        }
    };
    //starting the thread
    t.start();  
    }
}

