from flask import Flask, render_template, redirect, request, session
from flask_session import Session
from supabase import create_client, Client
import helpers as h
from dotenv import load_dotenv
from psycopg2 import pool
import os
from werkzeug.security import generate_password_hash

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
def index():
    if session.get("user_id"):
        return render_template("index.html") 
    return redirect("/login")

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
def logout():
    session.clear()
    return redirect("/")

if __name__ == '__main__':
    app.run(debug=True)