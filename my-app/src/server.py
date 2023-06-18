# pip3 install mysql-connector-python
from flask import Flask, request, abort, make_response
from settings import dbpwd, dbpwd_remote, aws_access_key_id, aws_secret_access_key
import mysql.connector as mysql
import json
from flask_cors import CORS
import uuid
import bcrypt
from datetime import datetime
import boto3

db = mysql.connect(
    host="rustam-database.cbrdyb6rueag.eu-central-1.rds.amazonaws.com",
    user="admin",
    passwd=dbpwd_remote,
    database="fullstackblog")
'''db = mysql.connect(
        host="localhost",
        user="root",
        passwd=dbpwd,
        database="fullstackblog")'''

print(db)

session = boto3.Session(
                    aws_access_key_id=aws_access_key_id,
                    aws_secret_access_key=aws_secret_access_key)

s3 = session.resource('s3')

for bucket in s3.buckets.all():
    print(bucket.name)


app = Flask(__name__)

CORS(app,supports_credentials=True,origins=["http://localhost:3000", "rustam-database.cbrdyb6rueag.eu-central-1.rds.amazonaws.com"],expose_headers='Set-Cookie')


@app.route('/users', methods=['GET', 'POST'])
def manage_users():
    if request.method == 'GET':
        return get_all_users()
    else:
        return add_user()

@app.route('/posts', methods=['GET', 'POST'])
def manage_posts():
    if request.method == 'GET':
        return get_all_posts()
    else:
        check_login()
        return add_post()

@app.route('/post', methods=['GET', 'POST'])
def manage_post():
    if request.method == 'GET':
        post_id = request.args.get('id')
        return get_post(post_id)
    else:
        check_login()
        return add_post()

def get_all_users():
    db = mysql.connect(
        host="rustam-database.cbrdyb6rueag.eu-central-1.rds.amazonaws.com",
        user="admin",
        passwd=dbpwd_remote,
        database="fullstackblog")
    query = "select id, name, role, created_at, login from users"
    cursor = db.cursor()
    cursor.execute(query)
    records = cursor.fetchall()
    cursor.close()
    print(records)
    header = ['id', 'name', 'role', 'created_at', 'login']
    data = []
    for r in records:
        created_at = r[3].strftime("%Y-%m-%d %H:%M:%S")
        data.append(dict(zip(header, [r[0], r[1], r[2], created_at, r[4]])))
    return json.dumps(data)

@app.route('/user/<login>', methods=['GET'])
def get_user(login):
    db = mysql.connect(
        host="rustam-database.cbrdyb6rueag.eu-central-1.rds.amazonaws.com",
        user="admin",
        passwd=dbpwd_remote,
        database="fullstackblog")
    query = "SELECT id, name, role, created_at, login, password_hash FROM users WHERE login = %s"
    values = (login,)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    if record is None:
        return "User not found", 404
    header = ['id', 'name', 'role', 'created_at', 'login', 'password_hash']
    created_at = record[3].strftime("%Y-%m-%d %H:%M:%S")
    response = dict(zip(header, [record[0], record[1], record[2], created_at, record[4], record[5]]))
    return response


@app.route('/registration', methods=['POST'])
def add_user():
    db = mysql.connect(
        host="rustam-database.cbrdyb6rueag.eu-central-1.rds.amazonaws.com",
        user="admin",
        passwd=dbpwd_remote,
        database="fullstackblog")
    data = request.get_json()
    print(data)
    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    timestamp = datetime.now()
    values = (data['name'], timestamp, data['login'], hashed)
    query = "INSERT INTO users (name, role, created_at, login, password_hash) VALUES (%s,'User', %s, %s , %s)"
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    cursor.close()
    return get_user(data['login'])


def get_post(id):
    db = mysql.connect(
        host="rustam-database.cbrdyb6rueag.eu-central-1.rds.amazonaws.com",
        user="admin",
        passwd=dbpwd_remote,
        database="fullstackblog")
    query = "select id, title, body, created_at, image, published, likes from posts where id = %s"
    values = (id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    print(record)
    cursor.close()
    header = ['id', 'title', 'body', 'created_at', 'image', 'published', 'likes']
    image_url = (record[4]).decode("utf-8")
    created_at = record[3].strftime("%Y-%m-%d %H:%M:%S")
    return json.dumps(dict(zip(header, [record[0], record[1], record[2], created_at, image_url, record[5], record[6]])))


def get_all_posts():
    db = mysql.connect(
        host="rustam-database.cbrdyb6rueag.eu-central-1.rds.amazonaws.com",
        user="admin",
        passwd=dbpwd_remote,
        database="fullstackblog")
    query = "select id, title, body, created_at, image, published, likes from posts"
    cursor = db.cursor()
    cursor.execute(query)
    records = cursor.fetchall()
    cursor.nextset()  # Skip any remaining result sets
    cursor.close()

    header = ['id', 'title', 'body', 'created_at', 'image', 'published', 'likes']
    data = []
    for r in records:
        created_at = r[3].strftime("%Y-%m-%d %H:%M:%S")
        image = r[4]
        if image is not None:
            image_url = (image).decode("utf-8")
        else:
            image_url = None
        data.append(dict(zip(header, [r[0], r[1], r[2], created_at, image_url, r[5], r[6]])))
    return json.dumps(data)


@app.route('/getId/<session_id>', methods=['GET'])
def getId(session_id):
    db = mysql.connect(
        host="rustam-database.cbrdyb6rueag.eu-central-1.rds.amazonaws.com",
        user="admin",
        passwd=dbpwd_remote,
        database="fullstackblog")
    query = "SELECT id FROM sessions WHERE session_id = %s"
    values = (session_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()

    if record is not None:
        header = ['id']
        return json.dumps(dict(zip(header, record)))
    else:
        return "Session ID not found"

def add_post():
    db = mysql.connect(
        host="rustam-database.cbrdyb6rueag.eu-central-1.rds.amazonaws.com",
        user="admin",
        passwd=dbpwd_remote,
        database="fullstackblog")
    data = request.get_json()
    print(data)
    query = "INSERT INTO posts (owner_id, title, image, body, created_at, published, likes) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    values = (
        data['owner_id'],
        data['title'],
        data['image'],
        data['body'],
        data['created_at'],
        data['published'],
        data['likes']
    )
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    new_post_id = cursor.lastrowid
    cursor.close()
    return get_post(new_post_id)


@app.route('/login', methods=['POST'])
def login():
    db = mysql.connect(
        host="rustam-database.cbrdyb6rueag.eu-central-1.rds.amazonaws.com",
        user="admin",
        passwd=dbpwd_remote,
        database="fullstackblog")
    data = request.get_json()
    print(data)
    query = "select login, password_hash, id from users where login = %s"
    values = (data['login'],)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    if not record:
        abort(401)
    print(record)
    user_id = record[2]
    hashed_pwd = record[1].encode('utf-8')
    if not bcrypt.checkpw(data['password_hashed'].encode('utf-8'), hashed_pwd):
        abort(401)
    if not is_session_exist(user_id):
        query = "insert into sessions (id ,session_id) values (%s, %s)"
        session_id = str(uuid.uuid4())
        values = (user_id, session_id)
        cursor = db.cursor()
        cursor.execute(query, values)
        db.commit()
        cursor.close()
    else:
        session_id = get_session_id(user_id)
    resp = make_response()
    resp.set_cookie("session_id", value=str(session_id), path="/", samesite='None', secure=True)

    return resp

def is_session_exist(id):
    query = "select id, session_id from sessions where id= %s"
    values = (id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    if not record:
        return False
    return True

def get_session_id(user_id):
    query = "select session_id from sessions where id = %s"
    values = (user_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    if record:
        session_id = record[0]
        return session_id
    return None
@app.route('/check_login', methods=['GET'])
def check_login():
    print(request)
    session_id = request.cookies.get("session_id")
    if not session_id:
        abort(401)
    query = "select id from sessions where session_id = %s"
    values = (session_id,)
    cursor = db.cursor()
    print("session_id:", session_id)
    print("SQL query:", query % values)
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    if not record:
        abort(401)
    response_data = {
        "session_id": session_id,
        "isAuthenticated": True  # Assuming authentication is successful
    }
    return json.dumps(response_data)

@app.route('/logout', methods=['GET','POST'])
def logout():
    data = request.get_json()
    session_id = data['session_id']
    if not session_id:
        abort(401)

    query = "DELETE FROM sessions WHERE session_id = %s"
    values = (session_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    cursor.close()

    response_data = {
        "message": "Logout successful"
    }
    return json.dumps(response_data)


if __name__ == "__main__":
    app.run()
