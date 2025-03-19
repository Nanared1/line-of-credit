export declare const createApplication: (event: import("aws-lambda").APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
export declare const disburseFunds: (event: import("aws-lambda").APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
export declare const repayFunds: (event: import("aws-lambda").APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
export declare const rejectApplication: (event: import("aws-lambda").APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
export declare const getUserApplications: (event: import("aws-lambda").APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
export declare const getApplicationTransactions: (event: import("aws-lambda").APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
export declare const getAllClientApplications: (event: import("aws-lambda").APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
