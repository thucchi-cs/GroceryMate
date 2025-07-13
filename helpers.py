from flask import redirect, session, flash
from functools import wraps
from werkzeug.security import check_password_hash
import datetime

def format_usd(num):
    if ((type(num) != int) and (type(num) != float)):
        return num
    return f'$%0.2f' % float(num)

def capitalize(s):
    return s.capitalize()

# Format date
def format_date(date):
    # date = datetime.datetime.strptime(date, "%Y-%m-%d")
    return date.strftime("%d/%m/%Y")

# Check if currently logged in
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated_function

# Log in user
def set_session_id(cur, username):
    cur.execute(f"SELECT * FROM users WHERE username='{username}';")
    user = cur.fetchall()[0]
    session["user_id"] = user[0]
    session["username"] = user[1]
    session["is_setup"] = user[4]
    cur.execute(f"SELECT * FROM categories WHERE user_id=1 OR user_id={session["user_id"]};")
    categories = cur.fetchall()
    session["categories"] = [{"category":c[2], "id": c[0], "user_id": c[1]} for c in categories]

# Update list of categories
def update_categories(cur):
    print(session['user_id'])
    cur.execute(f"SELECT * FROM categories WHERE user_id=1 OR user_id={session["user_id"]};")
    categories = cur.fetchall()
    session["categories"] = [{"category":c[2], "id": c[0], "user_id": c[1]} for c in categories]

# Check valid registration
def register(cur, username):
    # Get list of existing usernames
    cur.execute("SELECT * FROM users;")
    users = cur.fetchall()
    usernames = [u[1] for u in users]
    
    # Check if username is valid
    if username in usernames:
        flash("Username already exists!")
        return False
    
    # All fields pass
    return True

# Check valid log in
def login(cur, username, pwd):
    cur.execute(f"SELECT * FROM users WHERE username='{username}';")
    user = cur.fetchall()
    if len(user) == 0:
        return False
    hashed_pwd = user[0][2]
    return check_password_hash(hashed_pwd, pwd)

def find_categories(id):
    for cat in session["categories"]:
        if cat["id"] == id:
            return cat["category"]
    return None


def sundays():
    sd = []
    date = datetime.date
    td = datetime.date.today() - datetime.timedelta(days=150)
    first = datetime.date(td.year, td.month, 1)
    sunday = first - datetime.timedelta(days = first.isoweekday() % 7)
    if ((first.isoweekday()+1) % 8) <= 4:
        sd.append(sunday)
    sunday += datetime.timedelta(days=7)
    while sunday.month <= td.month:
        sd.append(sunday)
        sunday += datetime.timedelta(days=7)

    next_first = datetime.date(td.year, td.month+1, 1)
    sunday = next_first - datetime.timedelta(days = next_first.isoweekday() % 7)
    if ((next_first.isoweekday()+1) % 8) <= 4:
        if sunday in sd:
            sd.remove(sunday)

    for s in sd:
        print(s, end="   ")

sundays()