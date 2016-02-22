# micro-app-graph-dashboard - MQTT/Node based graphing dashboard

Micro app to display one or more graphs based on data received
through MQTT.  In my case MQTT data is fed by home sensors
through the house.  The dashboard is updated in realtime
using socket.io.

The dashboards listens on a number of mqtt topics for updates and then
forwards the updates to clients using socket.io.  It provides a simple way
to display graphjs of sensor data on a client (of course it can display
any date fed through MQTT regardless of how it is generated).

This is an example display:

![picture of dashboard main window](pictures/graph_dashboard.jpg?raw=true)

The following projects can be used to connect a variety of sensors including
temperature, power, humidity and power sensors.

* [PI433WirelessRecvMananager](https://github.com/mhdawson/PI433WirelessRecvManager)

# Usage

After installation modify ../lib/config.json to match your configuration

The configuration entries that must be updated include:

* mqttServerUrl - url of the mqtt server to connect to.  This can either start
  with tcp:// or mqtts://. If it starts with mqtts://  there must be a subdirectory
  in the lib directory called mqttclient which contains ca.cert, client.cert,
  client.key which contain the key and associated certificates for a client
  which is authorized to connect to the mqtt server.
* graphEntries - array in which each entry which contain a name, topic field,
  rentionSeconds(optional), and yPixelsPerLabel(optional).  One graph will
  be included on the page for the app for each entry configured.
  The name is what will be display as the label for the graph and the topic
  is the topic on which the dashboard will listen for updates.  Updates on the
  topic should be in the form of yyyyy,xxxx:value were yyyyy is generally a
  timestamp and the dasboard will extract the value after the ':' character and
  display it as the value for the corresponding label.  The retentionSeconds 
  specifies the maximum time in seconds a particular data point will be 
  displayed in seconds, and yPixelsPerLabel controls the minimum number of 
  pixels between each yAxis label.
* serverPort - port on which the dashboard listens for connections
* title - title for the dashbaord page (optional)

As a micro-app the dashboard also supports other options like authentication and
tls for the dashboard connection.  See the documentation for the micro-app-framework
for additional details.

The following is an example of the configuration file:

<PRE>
"title": "House Temp Data",
  "serverPort": 3000,
  "mqttServerUrl": "tcp://X.X.X.X:1883",
  "graphEntries": [ { "name": "Indoor Temp", "topic": "house/nexxtech/temp", "retentionSeconds": 86400},
                    { "name": "Bdr Light", "topic": "house/arduinoLightSensor/40"}
                  ]
}
</PRE>

# Installation

Simply run npm install micro-app-graph-dashboard

# Running

To run the graph-dashboard app, add node.js to your path (currently requires 4.x or better) and
then run:

<PRE>
npm start
</PRE>

from the directory in the micro-app-graph-dashboard was installed.

Once the server is started. Point your browser at the host/port for the server.
(or now use the micro-app-electron-launcher). 
If you have configured your browser to allow javascript to close the current page
the original window will be closed and one with the correct size of the
simple-dashboard app page will be created.

This micro-app allows resizing and the graphs will change to fit the available
space in the window.

# Example

The following is the page shown for a sample configuration:

![picture of dashboard main window](pictures/graph_dashboard.jpg?raw=true)

# Key Depdencies

## micro-app-framework
As a micro-app the graph-dashboard app depends on the micro-app-framework:

* [micro-app-framework npm](https://www.npmjs.com/package/micro-app-framework)
* [micro-app-framework github](https://github.com/mhdawson/micro-app-framework)

See the documentation on the micro-app-framework for more information on general
configurtion options that are availble (ex using tls, authentication, serverPort, etc)

