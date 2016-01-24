var mqtt = require('mqtt');

var config = require('./config.json'); // #A 
var thngId=config.thngId; 
var thngUrl='/thngs/'+thngId;
var thngApiKey=config.thngApiKey;
var interval;

console.log('Using Thng #'+thngId+' with API Key: '+ thngApiKey);

var client = mqtt.connect("mqtts://mqtt.evrythng.com:8883", {// #B
  username: 'authorization',
  password: thngApiKey 
});

client.on('connect', function () { // #C
  client.subscribe(thngUrl+'/properties/'); //#D
  updateProperty('livenow', true); //#E

  interval = setInterval(updateProperties, 5000); //#F
});

client.on('message', function (topic, message) { // #G
  console.log(message.toString());
});


function updateProperties () {
  var voltage = (219.5 + Math.random()).toFixed(3); // #H
  updateProperty ('voltage',voltage);

  var current = (Math.random()*10).toFixed(3); // #I
  updateProperty ('current',current);

  var power = (voltage * current * (0.6+Math.random()/10)).toFixed(3); // #J
  updateProperty ('power',power);
}

function updateProperty (property,value) {
  client.publish(thngUrl+'/properties/'+property, '[{"value": '+value+'}]');
}

// Let's close this connection cleanly
process.on('SIGINT', function() { // #K
  clearInterval(interval);
  updateProperty ('livenow', false);
  client.end();
  process.exit();
});

//#A Load configuration from file (thng id and thng API Key)
//#B Connects to the MQTT server on EVRYTHNG
//#C Callback called once when the MQTT connection succeeded
//#D Subscribe to All Properties
//#E Set the property 'livenow' to true on EVRYTHNG
//#F Call the function updateProperties() in 5 seconds
//#G Called every time an MQTT message is received from the broker
//#H 'Measures' voltage (fluctuates around ~220 volts)
//#I 'Measures' current (fluctuates between 0-10 ampères)
//#J 'Measures' power using P=U*I*PF (PF=power factor fluctuates between 60-70%)
//#K Cleanly exits this code (and sets the 'livenow' property to false)