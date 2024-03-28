const { Firestore } = require('@google-cloud/firestore');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Initialize Firestore 
const db = new Firestore({
    projectId: "sp24-cit412-llinh-traveldeals"
});

// Set up SendGrid with  API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendDeals = async (event, context) => {

    console.log("Event:", event);

    const incomingData = Buffer.from(event.data, 'base64').toString('utf-8');

    const parsedData = JSON.parse(incomingData);

    console.log(`Decoded message: ${JSON.stringify(parsedData)}`);
    
    // Extract regions and headline from the event
    const headLine = parsedData.deal_headline;
    const locations = parsedData.deal_location;

    console.log(locations)

    // Get subscribers collection reference
    const subscriberRef = db.collection('subscribers');

    // Query subscribers whose watch regions contain any of the specified regions
    const subscribersSnapshot = await subscriberRef.where('watch_regions', 'array-contains-any', locations).get();

    // If there are matching subscribers, send them deals via email
    if (!subscribersSnapshot.empty) {
        subscribersSnapshot.forEach(doc => {
            const subscriberData = doc.data();
            const email = subscriberData.email_address;

            // Create email deal message
            const deal = {
                to: email,
                from: process.env.SENDGRID_SENDER,
                subject: headLine,
                text: `Check out this exciting travel deal: ${headLine}`,
                html: `<p>Check out this exciting travel deal from <i>Linh Luu</i>: <strong>${headLine}</strong></p>`
            };

            console.log(deal);

            // Send the deal through SendGrid
            sgMail.send(deal)
                .then(() => {
                    console.log("Email sent successfully.");
                })
                .catch(error => {
                    console.error("Error sending email:", error);
                });
        });
    } else {
        console.log('No matching documents.');
    }
   
};

        
        
   

   

 