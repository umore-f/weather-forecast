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
    this.tokenGenerationPromise = null;
    this.initialized = false; // 添加初始化标志

    // 延迟验证，避免在导入时就生成 token
    setTimeout(() => {
      this.validateConfig();
      this.initialized = true;
    }, 0);
  }

  validateConfig() {
    const missingVars = [];

    if (!this.config.privateKey) missingVars.push('VITE_HF_PRIVATE_KEY');
    if (!this.config.keyId) missingVars.push('VITE_HF_KEY_ID');
    if (!this.config.projectId) missingVars.push('VITE_HF_PROJECT_ID');

    if (missingVars.length > 0) {
      console.error('❌ 缺少必要的环境变量:', missingVars.join(', '));
      throw new Error(`缺少环境变量: ${missingVars.join(', ')}`);
    }

    console.log('✅ 环境变量检查通过');
  }

  async generateToken() {
    // 如果已经在生成 token，返回同一个 Promise
    if (this.tokenGenerationPromise) {
      console.log('⏳ Token 正在生成中，等待结果...');
      return this.tokenGenerationPromise;
    }

    console.log('🔧 开始生成 Token...');

    this.tokenGenerationPromise = (async () => {
      try {
        const privateKey = await importPKCS8(this.config.privateKey, 'EdDSA');
        console.log('✅ 私钥导入成功');

        const iat = Math.floor(Date.now() / 1000) - 30;
        const exp = iat + 3600;

        console.log('📝 创建 JWT payload:', { iat, exp });

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

        console.log('✅ Token生成成功', {
          tokenLength: token.length,
          expiry: new Date(this.tokenExpiry).toISOString()
        });

        return token;
      } catch (error) {
        console.error('❌ Token生成失败:', error.message);
        // 生成失败时清空缓存
        this.currentToken = null;
        this.tokenExpiry = null;
        throw error;
      } finally {
        // 无论成功失败，都清除生成中的 Promise
        this.tokenGenerationPromise = null;
      }
    })();

    return this.tokenGenerationPromise;
  }

  isTokenValid() {
    // 如果没有初始化完成，认为 token 无效
    if (!this.initialized) {
      console.log('🔍 管理器未初始化，Token 无效');
      return false;
    }

    // 添加 5 分钟缓冲时间，避免在临界点过期
    const bufferTime = 5 * 60 * 1000; // 5分钟
    const isValid = this.currentToken && (Date.now() < (this.tokenExpiry - bufferTime));

    console.log('🔍 Token有效性检查:', {
      hasToken: !!this.currentToken,
      expiry: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null,
      currentTime: new Date().toISOString(),
      isValid,
      bufferTime: `${bufferTime / 1000 / 60}分钟`
    });

    return isValid;
  }

  async getToken() {
    // 等待初始化完成
    if (!this.initialized) {
      console.log('⏳ 等待 Token 管理器初始化...');
      // 简单的等待初始化完成
      await new Promise(resolve => {
        const checkInitialized = () => {
          if (this.initialized) {
            resolve();
          } else {
            setTimeout(checkInitialized, 10);
          }
        };
        checkInitialized();
      });
    }

    if (this.isTokenValid()) {
      console.log('✅ 使用缓存 Token');
      return this.currentToken;
    }

    console.log('🔄 Token 无效或即将过期，生成新 Token');
    return await this.generateToken();
  }

  // 清理 token 缓存（用于登出等情况）
  clearToken() {
    this.currentToken = null;
    this.tokenExpiry = null;
    this.tokenGenerationPromise = null;
    console.log('🗑️ Token 缓存已清除');
  }

  // 获取 token 信息（用于调试）
  getTokenInfo() {
    return {
      hasToken: !!this.currentToken,
      expiry: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null,
      isValid: this.isTokenValid(),
      isGenerating: !!this.tokenGenerationPromise,
      initialized: this.initialized
    };
  }
}

// 创建单例
export const tokenManager = new SimpleTokenManager();
