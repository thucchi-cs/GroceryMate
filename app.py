from flask import Flask, render_template, redirect, request, session
from flask_session import Session
from supabase import create_client, Client
import helpers as h
from dotenv import load_dotenv
from psycopg2 import pool
import os
from werkzeug.security import generate_password_hash
from datetime import date, timedelta

# Set up web app
app = Flask(__name__)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
# flask run --debug

# Load environment variables
load_dotenv()

# Get the connection string from the environment variable
connection_string = os.getenv('DATABASE_URL')

# Create a connection pool
connection_pool = pool.SimpleConnectionPool(
    1,  # Minimum number of connections in the pool
    10,  # Maximum number of connections in the pool
    connection_string
)

# Check if the pool was created successfully
if connection_pool:
    print("Connection pool created successfully")

# Get a connection from the pool
conn = connection_pool.getconn()

# Create a cursor object
cur = conn.cursor()

app.jinja_env.filters["usd"] = h.format_usd

@app.route("/")
@h.login_required
def index():
    if session.get("is_setup"):
        return render_template("index.html") 
    else:
        return redirect("/settings")

@app.route("/register", methods=["POST","GET"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        if h.register(cur, username):
            password = generate_password_hash(request.form.get("password"))
            cur.execute(f"INSERT INTO users (username, password) VALUES ('{username}', '{password}');")
            conn.commit()
            h.set_session_id(cur, username)
            return redirect("/")
        return redirect("/register")
    return render_template("register.html", h="l")

@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if h.login(cur, username, password):
            h.set_session_id(cur, username)
            return redirect("/")
        return redirect("/login")
    return render_template("login.html")

@app.route("/logout", methods=["POST"])
@h.login_required
def logout():
    print("loggingout")
    print(session)
    session.clear()
    print(session)
    return redirect("/")

@app.route("/settings", methods=["POST", "GET"])
@h.login_required
def settings():
    # Update user's setup status
    if not session.get("is_setup"):
        cur.execute(f"UPDATE users SET setup=TRUE WHERE id={session["user_id"]};")
        conn.commit()
        session["is_setup"] = True

    # Edit based on changes
    if request.method == "POST":
        # Add new categories
        new_categories = request.form.getlist("new_cat")
        for cat in new_categories:
            if cat != "":
                cur.execute(f"INSERT INTO categories (user_id, name) VALUES ({session["user_id"]}, '{cat}');")
                conn.commit()

        # Delete categories
        old_categories = request.form.getlist("category")
        for cat in old_categories:
            if int(cat[-1]) == 1:
                delete_id = int(cat[:-1])
                cur.execute(f"DELETE FROM categories WHERE id={delete_id};")
                conn.commit()

        # Update user's categories
        h.update_categories(cur)

        # Update user's budget
        budget = request.form.get("budget")
        cur.execute(f"UPDATE users SET curr_budget={budget} WHERE id={session["user_id"]};")
        conn.commit()

        # Go back to settings page
        return redirect("/settings")
    
    # Get user's current budget
    cur.execute(f"SELECT curr_budget FROM users WHERE id={session["user_id"]};")
    budget = cur.fetchall()[0][0]

    # Go to settings page
    return render_template("settings.html", categories=session["categories"], budget=budget)

# This week's grocery list
@app.route("/list")
def list():
    sunday = date.today() - timedelta(days = date.today().isoweekday() % 7)
    cur.execute(f"SELECT * FROM grocery_lists WHERE week_start='{sunday}';")
    grocery_list = cur.fetchall()
    if len(grocery_list) == 0:
        saturday = sunday + timedelta(days=6)
        # Get user's current budget
        cur.execute(f"SELECT curr_budget FROM users WHERE id={session["user_id"]};")
        budget = cur.fetchall()[0][0]
        cur.execute(f"INSERT INTO grocery_lists (user_id, week_start, week_end, budget) VALUES ({session["user_id"]}, '{sunday}', '{saturday}', {budget});")
        conn.commit()
        cur.execute(f"SELECT * FROM grocery_lists WHERE week_start='{sunday}';")
        grocery_list = cur.fetchall()

    grocery_list = {"id": grocery_list[0][0], "start": grocery_list[0][2], "end": grocery_list[0][3], "budget": grocery_list[0][4], "spent": grocery_list[0][5], "items": grocery_list[0][6]}
    return render_template("list.html", grocery_list=grocery_list)

if __name__ == '__main__':
    app.run()