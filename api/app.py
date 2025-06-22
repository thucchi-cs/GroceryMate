from flask import Flask, render_template, redirect, request
from supabase import create_client, Client
import helpers as h
from dotenv import load_dotenv

app = Flask(__name__)
# flask run --debug

load_dotenv()

app.jinja_env.filters["usd"] = h.format_usd

@app.route("/")
def index():
    return render_template("index.html")