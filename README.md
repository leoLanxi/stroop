# Stroop Test 中文版（含登录与统计模块）

## 环境准备

- 安装 MySQL 服务：`brew install mysql`，启动：`brew services start mysql`
- 安装 Python3（macOS 通常已自带）
- 可选安装 MySQL 客户端：`brew install mysql-client`

## 数据库初始化

- 连接：`mysql -h 127.0.0.1 -P 3306 -u root -p`
- 创建库（若未创建）：`CREATE DATABASE stroop_db CHARACTER SET utf8mb4;`
- 后端服务启动时会自动创建表 `users` 与 `game_results`（无需手动建表）

## 启动（开发环境）

- 后端（Flask）
  - 创建虚拟环境：`python3 -m venv venv`
  - 激活虚拟环境：`source venv/bin/activate`
  - 安装依赖：`pip install flask mysql-connector-python bcrypt flask-cors`
  - 启动服务：
    - `FLASK_APP=server.app MYSQL_HOST=127.0.0.1 MYSQL_PORT=3306 MYSQL_USER=root MYSQL_PASSWORD=544688504lL MYSQL_DB=stroop_db SECRET_KEY=local-dev flask run -p 5050`
- 前端（静态）
  - 在项目根目录：`python3 -m http.server 8000`
  - 访问：`http://localhost:8000/`

## 刹停（停止服务）

- 在对应终端按 `Ctrl + C` 停止后端或前端
- 若端口被占用：
  - 查看占用 5050：`lsof -i :5050`；结束：`kill -9 <PID>`
  - 查看占用 8000：`lsof -i :8000`；结束：`kill -9 <PID>`

## 重新启动

- 后端：
  - `source venv/bin/activate`
  - `FLASK_APP=server.app MYSQL_HOST=127.0.0.1 MYSQL_PORT=3306 MYSQL_USER=root MYSQL_PASSWORD=544688504lL MYSQL_DB=stroop_db SECRET_KEY=local-dev flask run -p 5000`
- 前端：`python3 -m http.server 8000`

## 部署（生产建议）

- 后端（Gunicorn + Nginx）
  - 安装：`./venv/bin/pip install gunicorn`
  - 启动：`./venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 server.app:app`
  - 用 Nginx 反向代理到 `127.0.0.1:5000`；静态资源由 Nginx 直接服务
- 前端（静态）
  - Nginx 指向项目根目录，入口 `index.html`

## 功能说明

- 未登录仅显示登录/注册层；登录成功后显示游戏界面
- 右上角：跳过等待、中英文切换、查看历史、登出/切换账户、重新开始
- 游戏结束自动提交本局结果（平均反应时间仅统计正确题目）并展示全体统计

## 接口校验与反馈

- 注册：唯一性、长度校验；前端提示“注册成功，请登录”或错误信息
- 登录：验证账号与密码；前端提示“登录成功”或“账号或密码错误”
- 登出：清除会话；前端提示“已登出，请重新登录”并回到登录页

## 数据库查看

- 切库：`USE stroop_db;`
- 查看表：`SHOW TABLES;`
- 表结构：`DESCRIBE users;`、`DESCRIBE game_results;`
- 最近数据：`SELECT * FROM game_results ORDER BY created_at DESC LIMIT 20;`

## 键位与测试

- 键位：`F=红`、`D=黄`、`J=蓝`、`K=绿`
- 作答后：空格或点击主功能框进入下一轮（若开启“跳过等待”，则自动 300ms 跳转）
