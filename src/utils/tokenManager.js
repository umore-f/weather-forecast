// src/utils/tokenManager.js
import { SignJWT, importPKCS8 } from 'jose';

class SimpleTokenManager {
  constructor() {
    this.config = {
      privateKey: import.meta.env.VITE_HF_PRIVATE_KEY,
      keyId: import.meta.env.VITE_HF_KEY_ID,
      projectId: import.meta.env.VITE_HF_PROJECT_ID
    };
    this.currentToken = null;
    this.tokenExpiry = null;
  }

  async generateToken() {
    try {
      const privateKey = await importPKCS8(this.config.privateKey, 'EdDSA');
      const iat = Math.floor(Date.now() / 1000) - 30;
      const exp = iat + 3600;

      const token = await new SignJWT({
        sub: this.config.projectId,
        iat: iat,
        exp: exp
      })
        .setProtectedHeader({
          alg: 'EdDSA',
          kid: this.config.keyId
        })
        .sign(privateKey);

      this.currentToken = token;
      this.tokenExpiry = exp * 1000;

      console.log('✅ Token生成成功');
      return token;
    } catch (error) {
      console.error('❌ Token生成失败:', error);
      throw error;
    }
  }

  isTokenValid() {
    return this.currentToken && Date.now() < this.tokenExpiry;
  }

  async getToken() {
    if (this.isTokenValid()) {
      return this.currentToken;
    }
    return await this.generateToken();
  }
}

// 创建单例
export const tokenManager = new SimpleTokenManager();
