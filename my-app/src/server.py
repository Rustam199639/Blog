from flask import Flask, request, abort, make_response
from settings import dbpwd, dbpwd_remote, aws_access_key_id, aws_secret_access_key
import mysql.connector as mysql
import json
from flask_cors import CORS
import uuid
import bcrypt
from datetime import datetime
import boto3
import mysql.connector, mysql.connector.pooling

app = Flask(__name__, static_folder='/home/ubuntu/build', static_url_path='/')

"""pool = mysql.connector.pooling.MySQLConnectionPool(
    host = "localhost",
    user = "root",
    passwd = dbpwd,
    database = "fullstackblog",
    buffered = True,
    pool_size = 6
)"""

pool = mysql.connector.pooling.MySQLConnectionPool(
    host = "rustam-database.cbrdyb6rueag.eu-central-1.rds.amazonaws.com",
    user = "admin",
    passwd = dbpwd_remote,
    database = "fullstackblog",
    buffered = True,
    pool_size = 5,
    pool_name="rus_pool"
)

@app.route('/about')
@app.route('/newPost')
@app.route('/post/<int:id>')
@app.route('/login')
@app.route('/contact')
@app.route('/profile')
@app.route('/')
def catch_all(id=None):
    return app.send_static_file("index.html")

#session = boto3.Session(
#                    aws_access_key_id=aws_access_key_id,
#                    aws_secret_access_key=aws_secret_access_key)

#s3 = session.resource('s3')

#for bucket in s3.buckets.all():
#    print(bucket.name)


#app = Flask(__name__)

#CORS(app)
#CORS(app,supports_credentials=True,origins=["http://localhost:3000", "rustam-database.cbrdyb6rueag.eu-central-1.rds.amazonaws.com"],expose_headers='Set-Cookie')
#CORS(app,supports_credentials=True,origins=["http://localhost:3000", "http://localhost:5000", "https://www.google.com"],expose_headers='Set-Cookie', methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
@app.route('/server_users', methods=['GET', 'POST'])
def manage_users():
    if request.method == 'GET':
        return get_all_users()
    else:
        return add_user()

@app.route('/server_posts', methods=['GET', 'POST'])
def manage_posts():
    if request.method == 'GET':
        return get_all_posts()
    else:
        check_login()
        return add_post()

@app.route('/server_comments', methods=['GET', 'POST', 'PUT', 'DELETE'])
def manage_comments():
    if request.method == 'GET':
        return get_all_comments()
    if request.method == 'POST':
        check_login()
        return add_comment()
    if request.method == 'PUT':
        comment_id = request.args.get('comment_id')
        return update_comment(comment_id)
    if request.method == 'DELETE':
        comment_id = request.args.get('id')
        return delete_comment(comment_id)

@app.route('/server_post', methods=['GET', 'POST', 'PUT', 'DELETE'])
def manage_post():
    if request.method == 'GET':
        post_id = request.args.get('id')
        return get_post(post_id)
    if request.method == 'PUT':
        post_id = request.args.get('id')
        return update_post(post_id)
    if request.method == 'DELETE':
        post_id = request.args.get('id')
        return delete_post(post_id)
    else:
        check_login()
        return add_post()

def get_all_users():
    print("Opened pool in get_all_users")
    db = pool.get_connection()
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
    print("Closed pool in get_all_users")
    db.close()
    return json.dumps(data)

@app.route('/server_user/<login>', methods=['GET'])
def get_user(login):
    db = pool.get_connection()
    print("Opened pool in get_user")
    query = "SELECT id, name, role, created_at, login, password_hash FROM users WHERE login = %s"
    values = (login,)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    if record is None:
        db.close()
        return "User not found", 404
    header = ['id', 'name', 'role', 'created_at', 'login', 'password_hash']
    created_at = record[3].strftime("%Y-%m-%d %H:%M:%S")
    response = dict(zip(header, [record[0], record[1], record[2], created_at, record[4], record[5]]))
    db.close()
    print("Closed pool in get_user")
    return response


@app.route('/server_registration', methods=['POST'])
def add_user():
    db = pool.get_connection()
    print("Opened pool in add_user")
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
    db.close()
    print("Closed pool in add_user")
    return get_user(data['login'])


def get_post(id):
    db = pool.get_connection()
    print("Opened pool in get_post")
    query = "select id, title, body, created_at, image, published, likes from posts where id = %s"
    values = (id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    post_record = cursor.fetchone()

    header = ['id', 'title', 'body', 'created_at', 'image', 'published', 'likes']
    if post_record[4]:
        image_url = (post_record[4]).decode("utf-8")
    else:
        image_url = None
    created_at = post_record[3].strftime("%Y-%m-%d %H:%M:%S")

    query = "select comment_by, body, likes, comment_date, user_id, id from comments where post_id = %s"
    cursor.execute(query, values)
    comments_records = cursor.fetchall()

    check_in = False
    post_data = dict(zip(header, [post_record[0], post_record[1], post_record[2], created_at, image_url, post_record[5], post_record[6]]))
    owner_of_comment_id = getId(cursor)
    cursor.close()
    db.close()
    print("Closed pool in get_post")
    if owner_of_comment_id != "Session ID not found":
        try:
            check_in = True
            data = json.loads(owner_of_comment_id)
            id_value = data['id']
            check_owner_list = [id_value == comment_owner_from_comments[4] for comment_owner_from_comments in comments_records]
        except:
            check_owner_list = [False] * len(comments_records)
    else:
        check_owner_list = [False] * len(comments_records)

    comments_data = [
        {
            'comment_by': record[0],
            'body': record[1],
            'likes': record[2],
            'comment_date': record[3].strftime("%Y-%m-%d %H:%M:%S"),
            'isOwnerComment': check_owner_list[i],
            'comment_id': record[5]
        }
        for i, record in enumerate(comments_records)
    ]
    return json.dumps({'post': post_data, 'comments': comments_data, 'checkLogged' : check_in})


def get_all_posts():
    db = pool.get_connection()
    print("Opened pool in get_all_posts")
    query = "SELECT posts.id, owner_id, posted_by, title, posts.body AS body, created_at, image, " \
            "published, posts.likes AS likes," \
            " COUNT(comments.post_id) AS comment_count " \
            "FROM posts LEFT JOIN comments ON posts.id = comments.post_id " \
            "GROUP BY posts.id"

    cursor = db.cursor()
    cursor.execute(query)
    records = cursor.fetchall()
    cursor.nextset()  # Skip any remaining result sets
    header = ['id','isOwner', 'posted_by', 'title', 'body', 'created_at', 'image', 'published', 'likes', 'comments_count']
    data = []

    owner_of_post_id = getId(cursor)
    cursor.close()
    if owner_of_post_id != "Session ID not found":
        id_value = json.loads(owner_of_post_id)['id']
        check_owner_list = [id_value == post_owner_id[1] for post_owner_id in records]
    else:
        check_owner_list = [False] * len(records)

    for i,r in enumerate(records):
        created_at = r[5].strftime("%Y-%m-%d %H:%M:%S")
        image = r[6]
        if image is not None:
            image_url = (image).decode("utf-8")
        else:
            image_url = None
        data.append(dict(zip(header, [r[0], check_owner_list[i], r[2], r[3], r[4], created_at, image_url, r[7], r[8], r[9]])))
    db.close()
    print("Closed pool in get_all_posts")
    return json.dumps(data)

def get_all_comments():
    db = pool.get_connection()
    print("Opened pool in get_all_comments")
    query = "select user_id, post_id, body, likes from comments"
    cursor = db.cursor()
    cursor.execute(query)
    records = cursor.fetchall()
    cursor.nextset()  # Skip any remaining result sets
    cursor.close()
    header = ['user_id', 'post_id', 'body', 'likes']
    data = []
    for r in records:
        data.append(dict(zip(header, r)))
    db.close()
    print("Closed pool in get_all_comments")
    return json.dumps(data)

def get_comment(comment_id):
    db = pool.get_connection()
    print("Opened pool in get_comment")
    query = "select user_id, comment_by, post_id, body, likes, comment_date from comments where id = %s"
    values = (comment_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.nextset()  # Skip any remaining result sets
    cursor.close()
    header = ['user_id', 'comment_by', 'post_id', 'body', 'likes', 'comment_date']
    data = []
    comment_date = record[5].strftime("%Y-%m-%d %H:%M:%S")
    data.append(dict(zip(header, [record[0], record[1], record[2], record[3],record[4], comment_date])))
    db.close()
    print("Closed pool in get_comment")
    return json.dumps(data)

def add_comment():
    db = pool.get_connection()
    print("Opened pool in add_comment")
    session_id = request.cookies.get("session_id")
    query = "SELECT id FROM sessions WHERE session_id = %s"
    values = (session_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    if not record:
        cursor.close()
        db.close()
        abort(401)
    owner_id = record[0]
    query = "SELECT name FROM users WHERE id = %s"
    values = (record[0],)
    cursor = db.cursor()
    cursor.execute(query, values)
    comment_by = cursor.fetchone()
    if not comment_by:
        cursor.close()
        db.close()
        abort(401)
    data = request.get_json()
    print(data)
    query = "INSERT INTO comments (user_id, comment_by, post_id, body, likes, comment_date) VALUES (%s, %s, %s, %s, %s, %s)"
    values = (
        owner_id,
        comment_by[0],
        data['post_id'],
        data['body'],
        0,
        data['comment_date']
    )
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    new_post_id = cursor.lastrowid
    cursor.close()
    db.close()
    print("Closed pool in add_comment")
    return get_comment(new_post_id)

def delete_post(post_id):
    db = pool.get_connection()
    print("Opened pool in delete_post")
    query = "DELETE FROM comments WHERE post_id = %s"
    values = (post_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    query = "DELETE FROM posts WHERE id = %s"
    values = (post_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    cursor.close()
    db.close()
    print("Closed pool in delete_post")
    return "Deleted"
def update_post(post_id):
    db = pool.get_connection()
    print("Opened pool in update_post")
    data = request.get_json()
    print(data)
    query = "UPDATE posts SET body = %s WHERE id = %s"
    values = (data['body'], post_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    query = "SELECT body FROM posts WHERE id = %s"
    values = (post_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    text_of_post = cursor.fetchone()
    if not text_of_post:
        cursor.close()
        db.close()
        abort(401)
    db.commit()
    cursor.close()
    db.close()
    print("Closed pool in update_post")
    return json.dumps(dict(zip('body', text_of_post)))

def update_comment(comment_id):
    db = pool.get_connection()
    print("Opened pool in update_comment")
    data = request.get_json()
    print(data)
    query = "UPDATE comments SET body = %s WHERE id = %s"
    values = (data['body'], comment_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    query = "SELECT body FROM comments WHERE id = %s"
    values = (comment_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    text_of_comment = cursor.fetchone()
    if not text_of_comment:
        cursor.close()
        db.close()
        abort(401)
    db.commit()
    cursor.close()
    db.close()
    print("Closed pool in update_comment")
    return json.dumps(dict(zip('body', text_of_comment)))

def delete_comment(comment_id):
    db = pool.get_connection()
    print("Opened pool in delete_comment")
    query = "DELETE FROM comments WHERE id = %s"
    values = (comment_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    cursor.close()
    db.close()
    print("Closed pool in delete_comment")
    return "Deleted"

def getId(cursor):
    #db = pool.get_connection()
    #print("Opened pool in getId")
    session_id = request.cookies.get("session_id")
    query = "SELECT id FROM sessions WHERE session_id = %s"
    values = (session_id,)
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    #db.close()
    #print("Closed pool in getId")
    if record is not None:
        header = ['id']
        return json.dumps(dict(zip(header, record)))
    else:
        return "Session ID not found"

@app.route('/server_post', methods=['POST','GET'])
def add_post():
    db = pool.get_connection()
    print("Opened pool in add_post")
    session_id = request.cookies.get("session_id")
    query = "SELECT id FROM sessions WHERE session_id = %s"
    values = (session_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    if not record:
        cursor.close()
        db.close()
        abort(401)
    query = "SELECT name FROM users WHERE id = %s"
    values = (record[0],)
    cursor = db.cursor()
    cursor.execute(query, values)
    name_of_owner = cursor.fetchone()
    if not name_of_owner:
        cursor.close()
        db.close()
        abort(401)
    data = request.get_json()
    print(data)
    query = "INSERT INTO posts (owner_id, posted_by, title, image, body, created_at, published, likes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
    values = (
        record[0],
        name_of_owner[0],
        data['title'],
        data['image'],
        data['body'],
        data['created_at'],
        data['published'],
        0
    )
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    new_post_id = cursor.lastrowid
    cursor.close()
    db.close()
    print("Closed pool in add_post")
    return get_post(new_post_id)

@app.route('/server_login', methods=['POST'])
def login():
    db = pool.get_connection()
    print("Opened pool in login")
    data = request.get_json()
    print(data)
    query = "select login, password_hash, id from users where login = %s"
    values = (data['login'],)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    if not record:
        cursor.close()
        db.close()
        abort(401)
    print(record)
    user_id = record[2]
    hashed_pwd = record[1].encode('utf-8')
    if not bcrypt.checkpw(data['password_hashed'].encode('utf-8'), hashed_pwd):
        cursor.close()
        db.close()
        abort(401)
    if not is_session_exist(user_id, cursor):
        query = "insert into sessions (id ,session_id) values (%s, %s)"
        session_id = str(uuid.uuid4())
        values = (user_id, session_id)
        cursor.execute(query, values)
        db.commit()
    else:
        session_id = get_session_id(user_id, cursor)
    resp = make_response()
    resp.set_cookie("session_id", value=str(session_id), path="/", samesite='None', secure=True)
    cursor.close()
    db.close()
    print("Closed pool in login")
    return resp

def is_session_exist(id, cursor):
    query = "select id, session_id from sessions where id= %s"
    values = (id,)
    cursor.execute(query, values)
    record = cursor.fetchone()
    if not record:
        return False
    return True

def get_session_id(user_id, cursor):
    query = "select session_id from sessions where id = %s"
    values = (user_id,)
    cursor.execute(query, values)
    record = cursor.fetchone()
    if record:
        session_id = record[0]
        return session_id
    return None

@app.route('/server_check_login', methods=['GET'])
def check_login():
    db = pool.get_connection()
    print("Opened pool in check_login")
    print(request)
    try:
        session_id = request.cookies.get("session_id")
    except:
        db.close()
        abort(401)
    query = "select id from sessions where session_id = %s"
    values = (session_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    record = cursor.fetchone()
    cursor.close()
    if not record:
        db.close()
        abort(401)
    response_data = {
        "session_id": session_id,
        "isAuthenticated": True  # Assuming authentication is successful
    }
    db.close()
    print("Closed pool in check_login")
    return json.dumps(response_data)

@app.route('/server_logout', methods=['GET','POST'])
def logout():
    db = pool.get_connection()
    print("Opened pool in logout")
    data = request.get_json()
    session_id = data['session_id']
    if not session_id:
        db.close()
        abort(401)
    query = "DELETE FROM sessions WHERE session_id = %s"
    values = (session_id,)
    cursor = db.cursor()
    cursor.execute(query, values)
    db.commit()
    response_data = {
        "message": "Logout successful"
    }
    response = make_response(json.dumps(response_data))
    response.set_cookie('session_id', '', expires=0)
    cursor.close()
    db.close()
    print("Closed pool in logout")
    return response

if __name__ == "__main__":
    app.run()
