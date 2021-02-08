import {CognitoUserPool} from 'amazon-cognito-identity-js';

const poolData={
    UserPoolId:"us-east-1_vRp4t77EF",
    ClientId:"4i6ajc9qfbimagvftp3hcg4b6a"
}

export default new CognitoUserPool(poolData);