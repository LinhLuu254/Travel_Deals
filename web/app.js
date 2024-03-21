const express = require('express');
const path = require('path');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const {PubSub} = require('@google-cloud/pubsub')

//middleware
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// ROUTES
app.get('/', (req, res) => {
  //res.status(200).send('Hello, world!');
  res.sendFile(path.join(__dirname, '/public/index.html'));
});


//Set a variable
const pubsub_topic = "travel_deals_signup";

app.post('/subscribe', async (req, res) => {
  const email = req.body.email_address;
  const regions = req.body.watch_region;

  //Create a PubSun client
  const pubSubClient = new PubSub();

  //Create a "payload" for our message
  const message_data = JSON.stringify({
    email_address: email,
    watch_region: regions
  });

  //Create a data buffet that allows us to stream the message to the topic
  const dataBuffer = Buffer.from(message_data);

  //Public the message to the Pubsub topic
  const messageID = await pubSubClient.topic(pubsub_topic).publishMessage({data: dataBuffer});

  console.log(`Message ID: ${messageID}`);

  res.status(200).send(`Thanks for signing up for TravelDeals. <br/>Message Id: ${messageID}`);

})

app.listen(port, () => {
  console.log(`TravelDeals Web App listening on port ${port}`);
});

