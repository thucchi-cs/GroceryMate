from flask import redirect, session, flash
from functools import wraps
from werkzeug.security import check_password_hash

def format_usd(num):
    if ((type(num) != int) and (type(num) != float)):
        return num
    print(num)
    return f'$%0.2f' % float(num)

# Check if currently logged in
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/")
        return f(*args, **kwargs)

    return decorated_function

# Log in user
def set_session_id(cur, username):
    cur.execute(f"SELECT * FROM users WHERE username='{username}';")
    user = cur.fetchall()[0]
    session["user_id"] = user[0]