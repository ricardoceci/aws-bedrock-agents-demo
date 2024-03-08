/* Let's create a lambda function that will handle the getOrderInfo action getting the order status from Shopify. */

// We will use Axios and the Shopify API to get the order status
// Axios is a promise-based HTTP client for the browser and node.js

const axios = require('axios');

// Let's create the axios request to Shopify

/** In order to get the shopToken we'll need to create a custom app in Shopify to use the token */


const shopifyRequest = axios.create({
    baseURL: `https://[YOUR-STORE-DOMAIN]/admin/api/2024-01/graphql.json`,
    headers: {
        'X-Shopify-Access-Token': '[YOUR ACCESS TOKEN GOES HERE]',
        'Content-Type': 'application/json'
    }
});

exports.handler = async (event) => {


    // Let's get the order status from Shopify based on the order number

    //Todo look for the parameter named orderNumber

    const orderNumber = event.parameters[0].value;
    const query = `{
        orders(first:1,query: "name:${orderNumber}") {
            edges {
                node {
                    name
                    displayFulfillmentStatus
                    fulfillments {
                        trackingInfo {
                            number
                            url
                        }
                    }
                }
            }
        }
    }`;

    // Let's get the response from Shopify

    const shopifyResponse = await shopifyRequest.post('', { query: query });

    // Let's get the order fulfillment status from the response

    const orderStatus = shopifyResponse.data.data.orders?.edges[0]?.node.displayFulfillmentStatus;
    const moreInfo = shopifyResponse.data.data.orders?.edges[0]?.node.fulfillments[0]?.trackingInfo[0]?.url;

    // Let's return the response

    let responseBody = {
        'application/json': {
            'body': JSON.stringify({
                "id": orderNumber,
                "status": orderStatus,
                "moreInfo": moreInfo
            })
        }
    }
    let actionResponse = {
        actionGroup: event.actionGroup,
        apiPath: event.apiPath,
        httpMethod: event.httpMethod,
        httpStatusCode: 200,
        responseBody: responseBody,

    }

    let sessionAttributes = event.sessionAttributes;
    let promptSessionAttributes = event.promptSessionAttributes;

    let response = {
        messageVersion: '1.0',
        statusCode: 200,
        response: actionResponse,
        sessionAttributes: sessionAttributes,
        promptSessionAttributes: promptSessionAttributes

    };

    return response;
}
