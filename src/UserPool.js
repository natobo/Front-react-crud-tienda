import {CognitoUserPool} from 'amazon-cognito-identity-js';
import env from "react-dotenv";

const poolData={
    UserPoolId: env.USER_POOL_ID,
    ClientId: env.CLIENT_ID
}

export default new CognitoUserPool(poolData);