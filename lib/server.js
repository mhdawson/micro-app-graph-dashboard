var fs = require('fs');
var mqtt = require('mqtt');
var socketio = require('socket.io');

const BORDERS = 15;
const HEIGHT_PER_GRAPH = 50;
const PAGE_WIDTH = 400;

var eventSocket = null;

var Server = function() {
}


Server.getDefaults = function() {
  return { 'title': 'House Graph Data' };
}

var replacements;
Server.getTemplateReplacments = function() {
  if (replacements === undefined) {
    var config = Server.config;
    var height = BORDERS;
    var graphEntriesHTML = new Array();

    // by the object definition for the graph configuration 
    var graphs = '        var graphs = [\n';
    for (var i = 0; i < config.graphEntries.length; i++) {
      graphs = graphs + '                       { chartName: "chart' + i + '" }';
      if (i !== config.graphEntries.length - 1) {
        graphs = graphs + ',';
      }
      graphs = graphs + '\n';
    }
    graphs = graphs + '                     ];'

    // build the html for the graphs configured
    for (var i = 0; i < config.graphEntries.length; i++) {
      graphEntriesHTML[i] = '        <tr width="100%"><td width="100%">\n' +
                            '           <div id=chart' + i + ' style="width:100% min-height:100%  height:100%"></div>\n' +
                            '        </td></tr>\n'


      height = height + HEIGHT_PER_GRAPH;
    }
  
    replacements = [{ 'key': '<DASHBOARD_TITLE>', 'value': Server.config.title },
                    { 'key': '<UNIQUE_WINDOW_ID>', 'value': Server.config.title },
                    { 'key': '<GRAPHS>', 'value': graphs },
                    { 'key': '<GRAPHS_HTML>', 'value': graphEntriesHTML.join('') },
                    { 'key': '<PAGE_WIDTH>', 'value': PAGE_WIDTH },
                    { 'key': '<PAGE_HEIGHT>', 'value': height }];

  }
  return replacements;
}


var status = new Object();
Server.startServer = function(server) {
  var config = Server.config;
  var history = new Array();
  var mqttOptions;
  if (Server.config.mqttServerUrl.indexOf('mqtts') > -1) {
    mqttOptions = { key: fs.readFileSync(path.join(__dirname, 'mqttclient', '/client.key')),
                    cert: fs.readFileSync(path.join(__dirname, 'mqttclient', '/client.cert')),
                    ca: fs.readFileSync(path.join(__dirname, 'mqttclient', '/ca.cert')),
                    checkServerIdentity: function() { return undefined }
    }
  }

  var mqttClient = mqtt.connect(Server.config.mqttServerUrl, mqttOptions);
  eventSocket = socketio.listen(server);

  eventSocket.on('connection', function(client) {
    // need to feed all of the existing data for the graphs
  });

  var topicLookup = new Object();
  mqttClient.on('connect',function() {
    // subscribe to the topic for each of the configured graphs
    // and add to topicLookup map so we can get the graph id
    // given the topic
    for (var i = 0; i < config.graphEntries.length; i++) {
      history[i] = new Array();
      topicLookup[config.graphEntries[i].topic] = i;
      mqttClient.subscribe(config.graphEntries[i].topic);
    }
  });

  mqttClient.on('message', function(topic, data) {
    // bundle the data into an object that we'll send to 
    // the gui.  The object includes the message type, 
    // the new data and the graph to which the data
    // is associated
    var message = new Object();
    message.type = 'data';
    message.graphId = topicLookup[topic];
    message.data =  parseFloat(data.slice(data.indexOf(':') + 1).toString());
    history[message.graphId].push(message.data);
    eventSocket.emit('message', message);
  });
}


if (require.main === module) {
  var path = require('path');
  var microAppFramework = require('micro-app-framework');
  microAppFramework(path.join(__dirname), Server);
}