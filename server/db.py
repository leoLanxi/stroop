import os
import mysql.connector

def get_conn():
  return mysql.connector.connect(
    host=os.environ.get('MYSQL_HOST','127.0.0.1'),
    port=int(os.environ.get('MYSQL_PORT','3306')),
    user=os.environ.get('MYSQL_USER','root'),
    password=os.environ.get('MYSQL_PASSWORD',''),
    database=os.environ.get('MYSQL_DB','stroop_db')
  )

def ensure_database_and_tables():
  host=os.environ.get('MYSQL_HOST','127.0.0.1')
  port=int(os.environ.get('MYSQL_PORT','3306'))
  user=os.environ.get('MYSQL_USER','root')
  password=os.environ.get('MYSQL_PASSWORD','')
  dbname=os.environ.get('MYSQL_DB','stroop_db')
  # connect without selecting database
  conn = mysql.connector.connect(host=host, port=port, user=user, password=password)
  cur = conn.cursor()
  try:
    cur.execute(f"CREATE DATABASE IF NOT EXISTS `{dbname}` CHARACTER SET utf8mb4")
    conn.commit()
  finally:
    cur.close(); conn.close()
  # create tables
  conn2 = mysql.connector.connect(host=host, port=port, user=user, password=password, database=dbname)
  cur2 = conn2.cursor()
  try:
    cur2.execute(
      """
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(64) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      """
    )
    cur2.execute(
      """
      CREATE TABLE IF NOT EXISTS game_results (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,
        avg_reaction_time_ms INT NOT NULL,
        error_rate DECIMAL(5,2) NOT NULL,
        total_rounds INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_game_results_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_game_results_user_created (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      """
    )
    cur2.execute(
      """
      CREATE TABLE IF NOT EXISTS fastest_rankings (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(64) NOT NULL,
        avg_ms INT NOT NULL,
        accuracy DECIMAL(5,2) NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_fastest_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      """
    )
    conn2.commit()
  finally:
    cur2.close(); conn2.close()
