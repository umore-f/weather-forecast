// src/utils/tokenManager.js
class SimpleTokenManager {
  constructor() {
    this.config = {
      privateKey: import.meta.env.VITE_HF_PRIVATE_KEY,
      keyId: import.meta.env.VITE_HF_KEY_ID,
      projectId: import.meta.env.VITE_HF_PROJECT_ID
    };
    this.currentToken = null;
    this.tokenExpiry = null;
    this.jose = null; // 用于缓存jose模块
    this.validateConfig();
  }

  validateConfig() {
    const missingVars = [];
    if (!this.config.privateKey) missingVars.push('VITE_HF_PRIVATE_KEY');
    if (!this.config.keyId) missingVars.push('VITE_HF_KEY_ID');
    if (!this.config.projectId) missingVars.push('VITE_HF_PROJECT_ID');

    if (missingVars.length > 0) {
      throw new Error(`缺少环境变量: ${missingVars.join(', ')}`);
    }
  }

  // 动态加载jose库，使用CDN
  async loadJose() {
    if (this.jose) return this.jose;
    try {
      // 关键步骤：从CDN动态导入
      const joseModule = await import('https://esm.sh/jose@4.14.4');
      this.jose = joseModule;
      console.log('✅ jose库通过CDN加载成功');
      return this.jose;
    } catch (error) {
      console.error('❌ 无法从CDN加载jose库:', error);
      throw error;
    }
  }

  async generateToken() {
    try {
      // 确保jose库已加载
      const { importPKCS8, SignJWT } = await this.loadJose();

      // 检查函数是否可用
      if (typeof importPKCS8 === 'undefined' || typeof SignJWT === 'undefined') {
        throw new Error('jose库中的必要函数未定义，请检查CDN版本。');
      }

      const privateKey = await importPKCS8(this.config.privateKey, 'EdDSA');
      console.log('✅ 私钥导入成功');

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
