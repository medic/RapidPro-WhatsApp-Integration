const supertest = require("supertest");
const axiosMock = require("axios");
const { useV1Routes } = require("./routes");
const { RPPostHandler, WAResponseHandler } = require("./handlers");

const app = useV1Routes();

jest.mock("axios");
// jest.mock("./handlers");
axiosMock.post.mockImplementation(
  () => Promise.resolve({ status: 200 })
);
axiosMock.mockImplementation(() => Promise.resolve({ status: 200 }));

describe('routes', () => {
  describe('V1 Routes', () => {
    afterEach(jest.clearAllMocks);
    describe('POST /webhook', () => {
      afterEach(jest.clearAllMocks);
      it('should return 400 for empty request body', async () => {
        const response = await supertest(app).post('/webhook');
        expect(response.statusCode).toBe(400);
      });

      describe('messages from rapidpro', () => {

        const rapidproCMsg = {
          "text": "welcome_enrolled|en",
          "to_no_plus": "27777777777"
        };

        it('should return 200 for a valid request', async () => {
          const response = await supertest(app)
            .post('/webhook')
            .send(rapidproCMsg);
          expect(response.statusCode).toBe(200);
          // expect(RPPostHandler).toHaveBeenCalledTimes(1);
        });
      });
      describe('messages from whatsapp', () => {

        // const waStatusChange = {
        //   "object": "whatsapp_business_account",
        //   "entry": [
        //     {
        //       "id": "105881185877964",
        //       "changes": [
        //         {
        //           "value": {
        //             "messaging_product": "whatsapp",
        //             "metadata": {
        //               "display_phone_number": "27664379847",
        //               "phone_number_id": "116227634832696"
        //             },
        //             "statuses": [
        //               {
        //                 "id": "wamid.HBgLMjc3ODg4MzAzNzcVAgARGBI0NTRGQTY5MDgwNzFDOEU3NjYA",
        //                 "status": "sent",
        //                 "timestamp": "1695980883",
        //                 "recipient_id": "27788830377",
        //                 "conversation": {
        //                   "id": "047228be4a93d599d3157b41ac91ff51",
        //                   "expiration_timestamp": "1696067340",
        //                   "origin": {
        //                     "type": "utility"
        //                   }
        //                 },
        //                 "pricing": {
        //                   "billable": true,
        //                   "pricing_model": "CBP",
        //                   "category": "utility"
        //                 }
        //               }
        //             ]
        //           },
        //           "field": "messages"
        //         }
        //       ]
        //     }
        //   ]
        // };

        const waInboundMsg = {
          "object": "whatsapp_business_account",
          "entry": [
            {
              "id": "105881185877964",
              "changes": [
                {
                  "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {
                      "display_phone_number": "27664379847",
                      "phone_number_id": "116227634832696"
                    },
                    "contacts": [
                      {
                        "profile": {
                          "name": "Maxaba"
                        },
                        "wa_id": "27836904450"
                      }
                    ],
                    "messages": [
                      {
                        "from": "27836904450",
                        "id": "wamid.HBgLMjc4MzY5MDQ0NTAVAgASGCAxMTZBOEJFNkU4N0JENkFBNDI3Mzg1REI1RTI0MUI3MQA=",
                        "timestamp": "1695984412",
                        "text": {
                          "body": "Hi"
                        },
                        "type": "text"
                      }
                    ]
                  },
                  "field": "messages"
                }
              ]
            }
          ]
        };

        it('should return 200 for a valid request', async () => {
          const response = await supertest(app)
            .post('/webhook')
            .send(waInboundMsg);
          expect(response.statusCode).toBe(200);
          expect(axiosMock).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

});