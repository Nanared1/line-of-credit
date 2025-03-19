import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

/**
 * GET request handler
 */
export async function getHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from GET Lambda!",
      input: event
    })
  };
}

/**
 * POST request handler
 */
export async function postHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No request body provided" })
    };
  }

  const requestData = JSON.parse(event.body);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from POST Lambda!",
      receivedData: requestData
    })
  };
}
