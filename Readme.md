# RapidPro-WhatsApp-Integration
Integrating whatsapp Cloud Api using External api

# Required WhatsApp Business setup
Flow the steps [here](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) to setup WhatsApp Business

# RapidPro External API setup

1. When creating an External API Channel under URN Type leave as Phone Number

2. Under Phone Number put the phone number of your whatsapp chatbot starting with country code eg 2335xxxx566

3. Leave method as HTTP POST

4. Leave Encoding as Default Encoding

5. Change Content Type to Application/json

6. update Max Length to to suit your desired text length. max length allowed is 640

7. On send URL is the webhook that accepts POST request when RapidPro want to send a message. this is where our webhook conduit between RP and facebook's Graph API comes in. it accepts request from RP then post that data to https://graph.facebook.com/v17.0/. It also accepts request from WhatsApp then post that data to RP. example of send URL will be https://a65e-154-160-14-26.ngrok-free.app/webhook

8. On Request Body use this Json format {"text":{{text}},"to_no_plus":{{to_no_plus}},"from_no_plus":{{from_no_plus}}}

9. On Reponse put the text 'OK'

10. Save the channel. It will take you to next step where it generates Receive URL, this URL is the one that receives data posted to RP and triggers a Flow.

11. add the webhook inside Meta dashboard and also copy Access token and add it to .env file.

## Getting started

1. Clone the repository

2. Update environment variables
  - `VERIFY_TOKEN` a random string of your choosing
  - `RAPIDPRO_URL` is the url of your RapidPro deployment  
  - `WHATSAPP_TOKEN` copy the value of your temporary/permanent access token from WhatsApp > API Setup in your App Dashboard
  - `PHONE_NUMBER_ID` copy the value of the Phone number ID from WhatsApp > API Setup in your App Dashboard
  - `RP_RECEIVE_URL` the generated Receive URL from RP
3. Run `npm install`
4. Run `npm start`


## How it works
- It accepts request from RP then post that data to https://graph.facebook.com/v17.0/. 
- It accepts request from WhatsApp then post that data to RP.

## Notes/known issues
1. WhatsApp TOKEN refreshes every 24hours. We are yet to add the token refresh snippet. We  currently manually copy the token from Meta dashboard.
2. Messages from RP flows needs to be saved as templates on Meta Dashboard. And template title is used as flow messages.

## Reference
https://developers.facebook.com/docs/whatsapp/sample-app-endpoints