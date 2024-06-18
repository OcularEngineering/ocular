import { TransactionBaseService } from "./transaction-base-service";

/**
 * Interface for file connectors
 * @interface
 */
class BaseauthService extends TransactionBaseService {
  static _isAuthService = true;

  static isAuthService(obj) {
    return obj?.constructor?._isAuthService;
  }

  generateToken(code: string, installation_id?: string, metadata?: any) {
    throw Error("generateToken must be overridden by the child class");
  }

  refreshToken(refresh_token: string) {
    throw Error("refreshToken must be overridden by the child class");
  }

  destroyToken() {
    throw Error("destroyToken must be overridden by the child class");
  }
}

export default BaseauthService;
