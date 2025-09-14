# 跨链桥CCB - Web3钱包应用

## 项目概述

跨链桥CCB（Cross Chain Bridge）是一个基于 uni-app 开发的 Web3 钱包应用，专注于以太坊网络的钱包管理。应用提供完整的钱包创建、导入、管理、转账和收款功能，支持助记词和私钥导入，具有现代化的用户界面和良好的安全性。

## 主要功能

### 💼 钱包管理
- **创建钱包**: 支持生成新钱包，包含助记词生成和验证流程
- **导入钱包**: 支持通过助记词或私钥导入现有钱包
- **多账户管理**: 支持管理多个钱包账户，可切换和删除
- **助记词备份**: 安全的助记词显示和备份提醒
- **助记词验证**: 创建钱包后的助记词验证步骤

### 💰 资产管理
- **ETH余额显示**: 实时显示以太坊余额
- **价格查询**: 集成ETH价格API，显示美元价值
- **余额更新**: 自动刷新余额（每10分钟）
- **地址格式化**: 友好的地址显示格式

### 💸 交易功能
- **转账**: 支持ETH转账，包含地址验证和余额检查
- **收款**: 生成收款二维码和地址，支持复制功能
- **交易记录**: 显示交易状态和哈希

### 📈 市场功能
- **行情展示**: 集成币安API，展示主流加密货币行情
- **币种搜索**: 支持按币种名称或符号搜索
- **筛选排序**: 支持按市值、涨跌幅等条件筛选
- **实时更新**: 每30秒自动刷新行情数据

### 🔄 兑换功能
- **币币兑换**: 支持不同加密货币之间的兑换
- **汇率查询**: 实时获取兑换汇率
- **交易确认**: 完整的交易确认流程

### 👥 社区功能
- **用户交流**: 用户讨论和交流平台
- **项目讨论**: 项目相关话题讨论
- **技术分享**: 技术知识和经验分享
- **活动公告**: 平台活动和公告

### 👤 个人中心
- **用户信息**: 显示用户基本信息和资产概览
- **钱包管理**: 快速访问钱包管理功能
- **安全设置**: 密码和安全相关设置
- **应用设置**: 应用偏好和配置

## 技术栈

- **前端框架**: uni-app + Vue 3
- **区块链**: Web3.js + ethers.js
- **加密库**: bip39 + @scure/bip39
- **HTTP请求**: axios
- **图标**: SVG图标 + Material Design Icons
- **二维码**: tki-qrcode
- **构建工具**: HBuilderX

## 在HBuilderX中运行

### 1. 环境要求
- HBuilderX 3.0+
- Node.js 14+
- npm 或 yarn

### 2. 安装步骤
1. 克隆项目到本地
2. 使用HBuilderX打开项目目录
3. 在HBuilderX终端中运行 `npm install`
4. 等待依赖安装完成

### 3. 运行项目
- **H5**: 右键项目 -> 运行 -> 运行到浏览器
- **微信小程序**: 运行 -> 运行到小程序模拟器 -> 微信开发者工具
- **App**: 运行 -> 运行到手机或模拟器

### 4. 开发调试
- 使用HBuilderX内置的调试工具
- 支持热重载和实时预览
- 支持多平台同时调试

## 项目结构

```
web3/
├── pages/                 # 页面文件
│   ├── index/            # 首页
│   ├── market/           # 市场页面
│   │   ├── market.vue    # 行情列表
│   │   └── exchange.vue  # 兑换功能
│   ├── community/        # 社区页面
│   ├── profile/          # 我的页面
│   └── wallet/           # 钱包相关页面
│       ├── create.vue     # 创建钱包
│       ├── import.vue    # 导入钱包
│       ├── manage.vue    # 钱包管理
│       ├── mnemonic.vue  # 助记词
│       └── verify-mnemonic.vue # 验证助记词
├── components/           # 组件文件
│   ├── TabBar/          # 自定义TabBar
│   │   └── CustomTabBar.vue
│   ├── icons/           # 图标组件
│   │   ├── IconWrapper.vue
│   │   ├── CryptoIcon.vue
│   │   └── index.js
│   └── CryptoIcon.vue
├── utils/               # 工具文件
│   ├── web3Utils.js     # Web3相关工具
│   ├── marketApi.js     # 市场API
│   ├── exchangeApi.js   # 兑换API
│   └── icons.js         # 图标工具
├── static/              # 静态资源
│   ├── icons/          # 图标文件
│   └── materialdesignicons-webfont.woff2 # 字体文件
├── plugins/            # 插件
│   └── iconify.js      # 图标配置
├── manifest.json       # 应用配置
├── pages.json         # 页面配置
├── App.vue            # 应用入口
└── main.js            # 应用启动文件
```

#### TabBar图标
- ✅ `mdi:home` / `mdi:home-outline` - 首页图标
- ✅ `mdi:chart-line` / `mdi:chart-line-variant` - 市场图标  
- ✅ `mdi:forum` / `mdi:forum-outline` - 社区图标
- ✅ `mdi:account` / `mdi:account-outline` - 我的图标

#### 功能图标
- ✅ `mdi:menu` - 菜单图标
- ✅ `mdi:plus` - 添加图标
- ✅ `mdi:send` - 发送图标
- ✅ `mdi:arrow-left` - 返回图标
- ✅ `mdi:content-copy` - 复制图标
- ✅ `mdi:qr-code` - 二维码图标
- ✅ `mdi:wallet` - 钱包图标
- ✅ `mdi:alert-circle` - 警告图标
- ✅ `mdi:delete` - 删除图标
- ✅ `mdi:scan` - 扫描图标
- ✅ `mdi:back` - 返回图标
- ✅ `mdi:magnify` - 搜索图标
- ✅ `mdi:construction` - 建设中图标
- ✅ `mdi:check-circle` - 成功图标
- ✅ `mdi:account-circle` - 用户图标
- ✅ `mdi:shield-check` - 安全图标
- ✅ `mdi:cog` - 设置图标
- ✅ `mdi:information` - 信息图标
- ✅ `mdi:chevron-right` - 右箭头图标

#### 新增图标
- ✅ `mdi:chevron-down` - 下箭头图标
- ✅ `mdi:history` - 历史图标
- ✅ `mdi:swap-vertical` - 垂直交换图标
- ✅ `mdi:close` - 关闭图标

### ✅ 静态图标文件

#### TabBar SVG图标
- ✅ `/static/icons/home.svg` - 首页普通状态
- ✅ `/static/icons/home-active.svg` - 首页激活状态
- ✅ `/static/icons/market.svg` - 市场普通状态
- ✅ `/static/icons/market-active.svg` - 市场激活状态
- ✅ `/static/icons/community.svg` - 社区普通状态
- ✅ `/static/icons/community-active.svg` - 社区激活状态
- ✅ `/static/icons/profile.svg` - 我的普通状态
- ✅ `/static/icons/profile-active.svg` - 我的激活状态

#### 加密货币图标
- ✅ `/static/crypto-icons/color/eth.svg` - 以太坊彩色图标
- ✅ `/static/crypto-icons/color/btc.svg` - 比特币彩色图标

### ✅ 组件配置

#### IconWrapper组件
- ✅ 支持Material Design Icons
- ✅ 支持主题颜色
- ✅ 支持动画效果
- ✅ 支持旋转角度
- ✅ 错误处理和降级方案

#### CustomTabBar组件
- ✅ 使用IconWrapper组件
- ✅ 集成TABBAR_ICONS配置
- ✅ 支持动态图标切换
- ✅ 支持状态管理

#### CryptoIcon组件
- ✅ 支持加密货币图标
- ✅ 支持图标缓存
- ✅ 支持降级显示
- ✅ 支持多种尺寸

## 功能特色

### 🎨 现代化UI设计
- 简洁美观的界面设计
- 响应式布局适配
- 流畅的动画效果
- 统一的视觉风格

### 🔒 安全可靠
- 本地私钥存储
- 助记词安全备份
- 交易签名验证
- 地址格式检查

### 🚀 高性能
- 快速的钱包创建
- 实时的余额更新
- 流畅的页面切换
- 优化的加载速度

### 📱 跨平台支持
- H5浏览器
- 微信小程序
- Android App
- iOS App

## 开发说明

### 环境配置
1. 确保已安装HBuilderX
2. 配置Node.js环境
3. 安装项目依赖

### 开发规范
- 遵循Vue 3 Composition API
- 使用uni-app API
- 注意平台兼容性
- 使用条件编译

### 调试技巧
- 使用HBuilderX调试工具
- 查看控制台日志
- 使用真机调试
- 测试多平台兼容性

## 更新日志

### v1.0.3 (2024-09-14)
- ✅ 删除重复的字体文件
- ✅ 统一使用static目录下的字体文件
- ✅ 优化项目文件结构

### v1.0.2 (2024-09-14)
- ✅ 修复TabBar SVG图标路径问题
- ✅ 添加缺失的构建脚本
- ✅ 优化图标显示调试信息
- ✅ 创建SVG图标测试页面

### v1.0.1 (2024-09-12)
- ✅ 修复ETH价格获取失败问题
- ✅ 添加多个备用API源
- ✅ 优化错误处理和缓存机制
- ✅ 支持HBuilderX开发环境

### v1.0.0 (2024-09-12)
- ✅ 完成基础钱包功能
- ✅ 实现TabBar导航
- ✅ 添加市场行情功能
- ✅ 完成社区和个人中心
- ✅ 支持HBuilderX开发环境

## 最新修改记录

### 2024-09-14 字体文件统一修复

#### 问题发现
在项目中发现存在重复的字体文件：
- `plugins/materialdesignicons-webfont.woff2` (重复文件)
- `static/materialdesignicons-webfont.woff2` (正确位置)

#### 解决方案
**删除重复文件** ✅
- 删除`plugins/materialdesignicons-webfont.woff2`
- 统一使用`static/materialdesignicons-webfont.woff2`

**验证文件引用** ✅
确认所有文件都正确引用static目录下的字体文件：
- `App.vue` - 字体预加载
- `components/icons/IconWrapper.vue` - 字体加载
- 所有测试文件 - 字体引用

#### 技术改进
1. **文件结构优化**：消除重复文件，保持项目结构清晰
2. **路径统一**：所有字体引用统一使用`/static/`路径
3. **维护简化**：只需维护一个字体文件，减少维护成本
4. **构建优化**：减少不必要的文件复制，优化构建体积

#### 修改文件
- 删除：`plugins/materialdesignicons-webfont.woff2`
- 保持：`static/materialdesignicons-webfont.woff2`

#### 验证结果
- ✅ 重复字体文件已删除
- ✅ 所有文件都使用static目录下的字体文件
- ✅ 没有文件引用plugins目录下的字体文件
- ✅ 项目结构更加清晰

现在项目中的字体文件已经统一，所有引用都指向`static/materialdesignicons-webfont.woff2`。

### 2024-12-19 字体引用统一修复

#### 问题分析
在检查项目字体引用时发现以下问题：
1. **内联字体问题**：多个页面文件使用了内联的 base64 编码字体
2. **字体不一致**：部分文件使用 `iconfont` 字体，部分使用 Material Design Icons
3. **路径不统一**：需要确保所有文件都正确引用 `/static/materialdesignicons-webfont.woff2`

#### 修复内容

**修复的文件列表**：
- `pages/wallet/verify-mnemonic.vue` - 更新字体引用
- `pages/wallet/mnemonic.vue` - 更新字体引用  
- `pages/wallet/manage.vue` - 更新字体引用
- `pages/wallet/import.vue` - 更新字体引用
- `pages/wallet/create.vue` - 更新字体引用
- `pages/transfer/transfer.vue` - 更新字体引用
- `pages/receive/receive.vue` - 更新字体引用

**修改思路**：
1. 将所有内联的 base64 编码字体替换为外部字体文件引用
2. 统一使用 Material Design Icons 字体
3. 确保所有字体引用都指向 `/static/materialdesignicons-webfont.woff2`
4. 添加 `font-display: swap` 优化字体加载性能

**修改后的字体引用格式**：
```css
@font-face {
    font-family: 'Material Design Icons';
    src: url('/static/materialdesignicons-webfont.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}
```

#### 验证结果
- ✅ 所有页面文件都正确引用 `/static/materialdesignicons-webfont.woff2`
- ✅ 移除了所有内联 base64 字体
- ✅ 字体引用路径统一且正确
- ✅ 添加了字体加载优化
- ✅ 项目字体管理更加规范

### 2024-09-14 TabBar SVG图标路径修复

#### 问题分析
经过测试发现TabBar图标不显示的根本原因是**路径问题**：
1. **uni-app H5路径规则**：在H5环境中，`/static/`路径无法正确解析
2. **开发服务器限制**：开发服务器无法访问静态资源路径
3. **构建工具问题**：package.json中缺少`dev:h5`脚本

#### 解决方案实施

**第一步：修复package.json脚本** ✅
```json
"scripts": {
  "serve": "npm run dev:h5",
  "dev:h5": "uni build --platform h5 --watch",
  "build:h5": "uni build --platform h5",
  "build": "npm run build:h5"
}
```

**第二步：修复SVG路径问题** ✅
```javascript
// 修改前
icon: '/static/icons/home.svg'

// 修改后
icon: require('@/static/icons/home.svg')
```

**第三步：添加调试信息** ✅
```javascript
mounted() {
  console.log('CustomTabBar mounted, tabList:', this.tabList)
  // 调试图标路径
  this.tabList.forEach((item, index) => {
    console.log(`Tab ${index}:`, {
      text: item.text,
      icon: item.icon,
      activeIcon: item.activeIcon,
      iconType: typeof item.icon,
      activeIconType: typeof item.activeIcon
    })
  })
}
```

#### 技术改进
1. **路径解析修复**：使用`require('@/static/icons/xxx.svg')`确保路径正确解析
2. **构建脚本完善**：添加缺失的`dev:h5`和`build:h5`脚本
3. **调试信息增强**：添加详细的图标路径调试信息
4. **测试页面创建**：创建`test-svg-icons.html`用于测试SVG图标显示

#### 修改文件
- `package.json` - 添加缺失的构建脚本
- `components/TabBar/CustomTabBar.vue` - 修复SVG路径和添加调试信息
- `test-svg-icons.html` - 创建SVG图标测试页面

#### 预期效果
修复后，TabBar应该能正确显示SVG图标：
- ✅ 首页：房子图标（灰色/蓝色）
- ✅ 市场：购物车图标（灰色/蓝色）
- ✅ 社区：用户群组图标（灰色/蓝色）
- ✅ 我的：用户头像图标（灰色/蓝色）

#### 测试方法
1. 在HBuilderX中运行项目到H5
2. 查看浏览器控制台的调试信息
3. 检查TabBar图标是否正常显示
4. 测试图标状态切换功能

现在TabBar使用正确的SVG路径，应该能正常显示图标了。

## 修复记录 - 2024年12月

### 修复市场页面买入按钮无反应问题

#### 问题描述
用户点击市场页面中的"买入"按钮没有任何反应，无法进行买入操作。

#### 问题原因
1. `pages/market/market.vue` 中的 `handleBuy` 方法尝试跳转到 `/pages/market/buy` 页面
2. `pages.json` 中没有配置买入页面的路由
3. `/pages/market/buy.vue` 文件不存在

#### 解决方案
1. **创建买入页面** (`pages/market/buy.vue`)：
   - 实现完整的买入功能界面
   - 支持多种支付方式（USDT、ETH、BNB）
   - 包含币种信息展示、数量输入、费用计算
   - 添加风险提示和确认对话框
   - 模拟买入请求处理

2. **更新路由配置** (`pages.json`)：
   - 添加买入页面路由配置
   - 设置页面标题为"买入"
   - 使用自定义导航栏样式

#### 修改文件
- `pages/market/buy.vue` - 新建买入页面
- `pages.json` - 添加买入页面路由配置

#### 功能特性
- ✅ 币种信息展示（图标、名称、价格、涨跌幅）
- ✅ 买入数量输入和USD价值计算
- ✅ 多种支付方式选择
- ✅ 交易费用计算和显示
- ✅ 余额验证和错误提示
- ✅ 买入确认对话框
- ✅ 模拟买入请求处理
- ✅ 风险提示信息
- ✅ 响应式UI设计

#### 测试方法
1. 在市场页面点击任意币种的"买入"按钮
2. 验证是否正常跳转到买入页面
3. 测试买入数量输入和计算功能
4. 测试支付方式切换
5. 测试买入确认流程

现在市场页面的买入功能应该能正常工作了。

### 修复助记词生成和显示问题

#### 问题描述
用户创建钱包后，助记词页面没有显示任何助记词，页面显示空白。

#### 问题原因
1. `createWallet` 函数返回的 `mnemonic` 是字符串格式
2. `mnemonic.vue` 页面期望接收数组格式的助记词
3. 数据类型不匹配导致助记词无法正确显示

#### 解决方案
1. **修复数据传递** (`pages/wallet/create.vue`)：
   - 在存储到全局变量时，将助记词字符串分割成数组
   - 确保数据类型匹配

2. **增强错误处理** (`pages/wallet/mnemonic.vue`)：
   - 添加数据类型检查和转换逻辑
   - 增加调试日志和错误提示
   - 添加空助记词时的友好提示界面

3. **改进用户体验**：
   - 添加加载状态提示
   - 优化错误提示信息
   - 增强数据验证逻辑

#### 修改文件
- `pages/wallet/create.vue` - 修复助记词数据传递格式
- `pages/wallet/mnemonic.vue` - 增强错误处理和用户体验

#### 功能特性
- ✅ 正确的助记词生成和显示
- ✅ 数据类型自动转换和验证
- ✅ 友好的加载和错误提示
- ✅ 完整的调试日志
- ✅ 空状态处理

#### 测试方法
1. 进入钱包管理页面
2. 点击"创建账号"
3. 输入账号名称并点击"开始创建"
4. 验证助记词页面是否正确显示12个助记词
5. 测试复制助记词功能

现在助记词生成和显示功能应该能正常工作了。

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系开发团队。