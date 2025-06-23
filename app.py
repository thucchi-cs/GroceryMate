from flask import Flask, render_template, redirect, request
from supabase import create_client, Client
import helpers as h
from dotenv import load_dotenv
from psycopg2 import pool
import os

app = Flask(__name__)
# flask run --debug

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
    print("hi")
    return render_template("index.html") 

if __name__ == "__main__":
    app.run()