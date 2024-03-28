const { Firestore } = require('@google-cloud/firestore');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

exports.sendDeals = async (event, context) => {
    
  const db = new Firestore({
      projectId: "sp24-cit412-llinh-traveldeals"
  });

  const subscriberRef = db.collection('subscribers');
  const dealRef = db.collection('deals');

  const subscribersSnapshot = await subscriberRef.get();

  if (subscribersSnapshot.empty) {
      console.log('No matching documents.');
      return;
  }

  subscribersSnapshot.forEach(async doc => {
    const subscriberData = doc.data();
    const email = subscriberData.email_address;
    const regions = subscriberData.watch_regions;


    console.log(subscriberData);
    console.log(email);
    console.log(regions);

    // Query deals that match subscriber's watch_regions
    const dealsSnapshot = await dealRef.where('location', 'array-contains-any', regions).get();

    if (!dealsSnapshot.empty) {
      dealsSnapshot.forEach(dealDoc => {
          const dealData = dealDoc.data();

          console.log("Deal's data");
          console.log(dealData);

          // GET OUR API KEY
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);

          // CREATE AN EMAIL DEAL MESSAGE
          const deal = {
              to: email,
              from: process.env.SENDGRID_SENDER,
              subject: dealData.headline,
              text: "Check out this exciting travel deal: " + dealData.headline,
              html: "<p>Check out this exciting travel deal from TravelDeals: <strong>" + dealData.headline + "</strong></p>"
          };

          console.log('Deal');
          console.log(deal)

          // SEND THE DEAL THROUGH SENDGRID
          sgMail.send(deal)
              .then(() => {
                  console.log("Email sent successfully.");
              })
              .catch(error => {
                  console.error("Error sending email:", error);
              });
      });
    } else {
        console.log('No matching deals found for subscriber:', email);
    }


   } )

  
};
 C