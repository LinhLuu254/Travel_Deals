const { Firestore } = require('@google-cloud/firestore');

exports.writeSubscriber = async (message, context) => {
    console.log(`Encoded message: ${message.data}`);
  
    const incomingMessage = Buffer.from(message.data, 'base64').toString('utf-8');
  
    const parsedMessage = JSON.parse(incomingMessage);
  
    console.log(`Decoded message: ${JSON.stringify(parsedMessage)}`);
    console.log(`Email address: ${parsedMessage.email_address}`); 

    // Construct document to be added to Firestore
    const subscriberData = {
        email_address: parsedMessage.email_address,
        watch_regions: parsedMessage.watch_region
    };

    await writeToFS(subscriberData);
}

async function writeToFS(dataObject) {
    const firestore = new Firestore({
        projectId: "sp24-cit412-llinh-traveldeals"
    });
  
    console.log(dataObject);
    
    try {
        const collectionRef = firestore.collection('subscribers');
        const documentRef = await collectionRef.add(dataObject);
    
        console.log(`Document created: ${documentRef.id}`);
    } catch (error) {
        console.error('Error writing document to Firestore:', error);
    }
}
