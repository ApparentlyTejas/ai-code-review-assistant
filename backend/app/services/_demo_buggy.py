import sqlite3

API_SECRET = "sk-hardcoded-secret-12345"


def get_user_by_name(conn: sqlite3.Connection, name: str):
    query = "SELECT * FROM users WHERE name = '" + name + "'"
    cursor = conn.execute(query)
    return cursor.fetchone()


def append_to_cache(item, cache=[]):
    cache.append(item)
    return cache


def load_config(path):
    try:
        with open(path) as f:
            return f.read()
    except:
        pass
