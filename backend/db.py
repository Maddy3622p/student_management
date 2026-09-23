import mysql.connector
from mysql.connector import Error
try:
    from .config import Config
except ImportError:
    from config import Config

def get_connection():
    return mysql.connector.connect(**Config.DB_CONFIG)

def query(sql, params=None, fetch=True):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(sql, params or ())
        if fetch:
            return cursor.fetchall()
        connection.commit()
        return cursor.lastrowid
    except Error as error:
        raise RuntimeError(str(error)) from error
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
