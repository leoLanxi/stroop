## 数据库表设计与建表 SQL

### users
- 字段：
  - `id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT`
  - `username VARCHAR(64) NOT NULL UNIQUE`
  - `password_hash VARCHAR(255) NOT NULL`
  - `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- 建表：
```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### game_results
- 规则：`avg_reaction_time_ms` 仅基于正确题目计算；错误题目不计入平均。
- 字段：
  - `id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT`
  - `user_id BIGINT UNSIGNED NOT NULL`
  - `avg_reaction_time_ms INT NOT NULL`
  - `error_rate DECIMAL(5,2) NOT NULL` 例：`0.40` 表示 40%
  - `total_rounds INT NOT NULL`
  - `created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`
- 约束与索引：`FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`；`INDEX (user_id, created_at)`
- 建表：
```sql
CREATE TABLE IF NOT EXISTS game_results (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  avg_reaction_time_ms INT NOT NULL,
  error_rate DECIMAL(5,2) NOT NULL,
  total_rounds INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_game_results_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_game_results_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 后端技术栈与目录结构
- 技术：Python + Flask + MySQL（`mysql-connector-python` 或 `PyMySQL`），密码哈希用 `bcrypt`。
- 目录：
  - `server/app.py`（路由与会话）
  - `server/db.py`（数据库连接池）
  - `server/models.py`（数据访问函数）
  - `.env`（`MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`, `SECRET_KEY`）
- 会话：Flask `session` + HttpOnly Cookie；允许跨域 `localhost`，`fetch` 需 `credentials: 'include'`。

## 接口设计（URL/方法/请求与响应示例）

### 注册 POST `/api/register`
- 请求：`{ "username": "alice", "password": "pass123" }`
- 响应成功：`{ "ok": true }`
- 响应失败：`{ "ok": false, "error": "USERNAME_TAKEN" }`

### 登录 POST `/api/login`
- 请求：`{ "username": "alice", "password": "pass123" }`
- 响应成功（设置会话）：`{ "ok": true, "user": { "username": "alice", "id": 1 } }`
- 响应失败：`{ "ok": false, "error": "INVALID_CREDENTIALS" }`

### 登出 POST `/api/logout`
- 响应成功：`{ "ok": true }`

### 提交本局结果 POST `/api/game/submit`
- 说明：仅在登录态下允许；`avg_reaction_time_ms` 基于正确题目，`error_rate`=错误数/总轮数。
- 请求：
```json
{ "avg_reaction_time_ms": 420, "error_rate": 0.2, "total_rounds": 5 }
```
- 响应成功：`{ "ok": true, "id": 123 }`

### 个人历史 GET `/api/game/history`
- 响应：
```json
{
  "ok": true,
  "records": [
    { "avg_reaction_time_ms": 380, "error_rate": 0.20, "created_at": "2025-12-03T08:05:02Z" },
    { "avg_reaction_time_ms": 450, "error_rate": 0.40, "created_at": "2025-12-03T08:15:24Z" }
  ],
  "aggregates": {
    "overall_avg_reaction_time_ms": 415,
    "overall_error_rate": 0.30
  }
}
```

### 全局统计 GET `/api/game/stats/global`
- 分布区间（示例）：`0–200`, `200–400`, `400–600`, `600–800`, `>800`（服务端注释说明采用此方案）。
- 响应：
```json
{
  "ok": true,
  "global_avg_reaction_time_ms": 430,
  "distribution": [
    { "range": "0-200ms", "count": 5, "percentage": 0.10 },
    { "range": "200-400ms", "count": 20, "percentage": 0.40 },
    { "range": "400-600ms", "count": 15, "percentage": 0.30 },
    { "range": "600-800ms", "count": 8, "percentage": 0.16 },
    { "range": ">800ms", "count": 2, "percentage": 0.04 }
  ]
}
```

### 登录态检查 GET `/api/me`
- 响应成功：`{ "ok": true, "user": { "id": 1, "username": "alice" } }`
- 未登录：`{ "ok": false }`

## 后端示例代码（概要）
- 连接池：`db.py` 建立 MySQL 连接；`models.py` 封装 `create_user`, `get_user_by_username`, `insert_game_result`, `get_user_history`, `get_global_stats`。
- 路由：`app.py` 注册上述所有接口；登录写入 `session['uid']`；登出清除 `session`。
- 统计：
  - 个人历史：查询 `game_results` by `user_id`，计算 `overall_avg_reaction_time_ms` 与 `overall_error_rate`。
  - 全局统计：查询所有 `avg_reaction_time_ms`，求平均并按区间统计数量与比例。

## 前端增量改动
- 新增模块：
  - `assets/js/modules/api.js`：`get`, `post` 封装（携带 `credentials: 'include'`）。
  - `assets/js/modules/auth.js`：渲染/控制登录注册表单，处理注册/登录与错误提示，登录后隐藏表单显示游戏。
  - `assets/js/modules/history.js`：拉取并渲染个人历史（列表/表格）。
  - `assets/js/modules/global_stats.js`：在结果区下方渲染全局平均与 5 段分布列表。
- DOM/UI：
  - 入口页：初始仅显示登录/注册；登录成功后显示原游戏容器（通过添加/移除类控制显示）。
  - 顶部栏：新增「查看历史记录」按钮与「登出 / 切换账户」。
- 集成时机：
  - 页面初始化：调用 `/api/me` 决定显示登录页或游戏页。
  - 游戏完成（现有 `onComplete` 钩子后）：调用 `POST /api/game/submit` 提交结果 → 成功后调用 `GET /api/game/stats/global` 渲染全体统计块。
  - 查看历史：点击按钮调用 `GET /api/game/history` 并渲染列表与总体平均。
  - 登出：按钮调用 `POST /api/logout`，清理前端状态（用户名等），隐藏游戏与统计区域，显示登录页。

### 前端提交/获取示例
- 提交本局结果：
```js
import { post } from './modules/api.js';
post('/api/game/submit', { avg_reaction_time_ms: avg, error_rate, total_rounds: 5 });
```
- 获取历史：
```js
import { get } from './modules/api.js';
const res = await get('/api/game/history');
```
- 获取全局统计：
```js
const res = await get('/api/game/stats/global');
```
- 登录/注册：
```js
post('/api/register', { username, password });
post('/api/login', { username, password });
```
- 登出：
```js
post('/api/logout', {});
```

## 本地运行与初始化
- 安装 MySQL 并创建库与用户：
```sql
CREATE DATABASE stroop_db CHARACTER SET utf8mb4;
CREATE USER 'stroop'@'localhost' IDENTIFIED BY '***';
GRANT ALL PRIVILEGES ON stroop_db.* TO 'stroop'@'localhost';
```
- 执行建表 SQL。
- 后端：
```bash
python3 -m venv venv && source venv/bin/activate
pip install flask mysql-connector-python bcrypt python-dotenv
FLASK_APP=server/app.py FLASK_RUN_PORT=5000 flask run
```
- 前端：继续使用现有静态服务器（如 `python3 -m http.server 8000`），前端通过相对路径 `/api/...` 访问后端（同机不同端口）。

## 安全与约束
- 密码哈希存储（bcrypt）；不记录明文；会话 Cookie 使用 HttpOnly；生产可考虑 CSRF/速率限制，本地环境简化处理。
- 保持现有 Stroop UI 风格与核心逻辑不变；新增 UI 使用现有 BEM 命名与柔和风格。

请确认以上方案；确认后我将按该设计依次实现：后端代码与路由、前端模块与页面切换、完成后联调与本地运行说明。