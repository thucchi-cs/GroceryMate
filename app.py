from flask import Flask, jsonify, render_template, redirect, request, session, flash
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
app.jinja_env.filters["cap"] = h.capitalize
app.jinja_env.filters["date"] = h.format_date

@app.route("/")
@h.login_required
def index():
    if session.get("is_setup") or not session.get("user_id"):
        return redirect("/list") 
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
        flash("Incorect username and/or password!")
        return redirect("/login")
    return render_template("login.html")

@app.route("/logout", methods=["POST", "GET"])
@h.login_required
def logout():
    session.clear()
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

        # Update this week's list's budget
        sunday = date.today() - timedelta(days = date.today().isoweekday() % 7)
        cur.execute(f"UPDATE grocery_lists SET budget={budget} WHERE week_start='{sunday}' AND user_id={session["user_id"]};")
        conn.commit()

        # Go back to settings page
        return redirect("/settings")
    
    # Get user's current budget
    cur.execute(f"SELECT curr_budget FROM users WHERE id={session["user_id"]};")
    budget = cur.fetchall()[0][0]

    # Go to settings page
    return render_template("settings.html", categories=session["categories"], budget=budget, page="settings")

# This week's grocery list
@app.route("/list")
@h.login_required
def grocery_list():
    if not request.args.get("id"):
        sunday = date.today() - timedelta(days = date.today().isoweekday() % 7)
        cur.execute(f"SELECT * FROM grocery_lists WHERE week_start='{sunday}' AND user_id={session["user_id"]};")
        grocery_list = cur.fetchall()
        if len(grocery_list) == 0:
            saturday = sunday + timedelta(days=6)
            # Get user's current budget
            cur.execute(f"SELECT curr_budget FROM users WHERE id={session["user_id"]};")
            budget = cur.fetchall()[0][0]
            cur.execute(f"INSERT INTO grocery_lists (user_id, week_start, week_end, budget) VALUES ({session["user_id"]}, '{sunday}', '{saturday}', {budget});")
            conn.commit()
            cur.execute(f"SELECT * FROM grocery_lists WHERE week_start='{sunday}' AND user_id={session["user_id"]};")
            grocery_list = cur.fetchall()
    else:
        cur.execute(f"SELECT * FROM grocery_lists WHERE id={request.args.get("id")};")
        grocery_list = cur.fetchall()
        if (len(grocery_list) == 0) or (grocery_list[0][1] != session["user_id"]):
            flash("List not found!")
            return redirect("/history")

    grocery_list = {"id": grocery_list[0][0], "start": grocery_list[0][2], "end": grocery_list[0][3], "budget": float(grocery_list[0][4]), "spent": float(grocery_list[0][5]), "items": grocery_list[0][6], "total": float(grocery_list[0][7])}    
    
    cur.execute(f"SELECT * FROM grocery_items WHERE list_id={grocery_list["id"]} ORDER BY id;")
    items = cur.fetchall()
    items = [{"id":i[0], "list_id":i[1], "item":i[2].replace("_"," "), "cat_id":i[3], "category":h.find_categories(i[3]), "price":float(i[4]), "qty":i[5], "bought":i[6]} for i in items]

    return render_template("list.html", grocery_list=grocery_list, categories=session["categories"], items=items, page="list")

@app.route("/update_list", methods=["POST"])
@h.login_required
def update():
    print(request.form)
    cur.execute(f"UPDATE grocery_lists SET spent={request.form.get("spent")}, num_items={request.form.get("items")}, total={request.form.get("total")} WHERE id={request.form.get("id")};")
    conn.commit()

    return "sup"

@app.route("/add_items",methods=["POST"])
@h.login_required
def add():
    print(request.form)
    cur.execute(f"INSERT INTO grocery_items (list_id, item, category_id, price, quantity) VALUES ({int(request.form.get("list_id"))}, '{request.form.get("name")}', {int(request.form.get("category"))}, {float(request.form.get("price"))}, {int(request.form.get("quantity"))}) RETURNING id;")
    conn.commit()
    id = cur.fetchall()
    return str(id[0][0])

@app.route("/delete_items", methods=["POST"])
@h.login_required
def delete():
    print(request.form)
    cur.execute(f"DELETE FROM grocery_items WHERE id={request.form.get("new_id")};")
    conn.commit()
    return request.form

@app.route("/check_items", methods=["POST"])
@h.login_required
def check():
    print(bool(request.form.get("bought")))
    bought = bool(request.form.get("bought"))
    cur.execute(f"UPDATE grocery_items SET bought={bought} WHERE id={request.form.get("new_id")};")
    conn.commit()
    return request.form

@app.route("/history")
@h.login_required
def history():
    cur.execute(f"SELECT * FROM grocery_lists WHERE user_id={session["user_id"]} ORDER BY week_start DESC;")
    data = cur.fetchall()
    lists = [{"id":d[0], "start":d[2], "end":d[3], "budget":float(d[4]), "spent":float(d[5]), "items":d[6], "total":float(d[7])} for d in data]
    return render_template("history.html", lists=lists, page="history")

@app.route("/analysis")
@h.login_required
def analysis():
    return render_template("analysis.html")

@app.route("/weeks_data")
@h.login_required
def get_weeks_data():
    td = date.today()
    sd = h.get_sundays(td.month, td.year)
    results = get_data(sd, {})
    print("\nRESULTS")
    print(results)

    return jsonify(results)
    
@app.route("/months_data")
@h.login_required
def get_months_data():
    td = date.today()
    td = date(td.year, td.month, 15)

    spent_data = []
    dates_data = []
    categories = {}
    total = 0.0
    count = 0
    over_budget = 0.0
    budget_data = []

    for i in range(5,-1, -1):
        day = td - timedelta(i*30)
        sd = h.get_sundays(day.month, day.year)
        results = get_data(sd, categories)
        dates_data.append(day.strftime("%B"))
        if results["total"] > 0:
            total += results["total"]
            spent_data.append(results["total"])
            over_budget += results["over_budget"]
            count += 1
            results["budget"] = [budget for budget in results["budget"] if budget]
            budget = sum(results["budget"])
            budget_data.append(budget)
        else:
            spent_data.append(None)
            budget_data.append(None)

    if count != 0:
        avg = total/count
    else:
        avg = 0
    
    return jsonify({"dates": dates_data, "spent": spent_data, "total": total, "count": count, "over_budget": over_budget, "categories": categories, "avg": avg, "budget":budget_data})

def get_data(sd, categories):
    spent_data = []
    dates_data = []
    budget_data = [] 

    cur.execute("SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'grocery_lists';")
    list_keys = cur.fetchall()
    list_keys = [k[0] for k in list_keys]
    print(list_keys) 

    total = 0.0
    count = 0
    over_budget = 0.0
    most_bought = {}
    print("\nOG\n", categories)

    for sunday in sd:
        cur.execute(f"SELECT * FROM grocery_lists WHERE user_id={session["user_id"]} AND week_start='{sunday}';")
        data = cur.fetchall()
        if len(data) > 0:
            data = {list_keys[i]: data[0][i] for i in range(len(list_keys))}
            spent_data.append(float(data["spent"]))
            budget_data.append(float(data["budget"]))
            dates_data.append(f"{data["week_start"].strftime("%d/%m")} - {data["week_end"].strftime("%d/%m")}")
            total += spent_data[-1]
            count += 1
            if spent_data[-1] > budget_data[-1]:
                over_budget += spent_data[-1] - budget_data[-1]

            cur.execute(f"SELECT * FROM grocery_items WHERE list_id={data["id"]} AND bought=true;")
            items = cur.fetchall()
            for i in items:
                most_bought[i[2]] = most_bought.get(i[2], 0) + int(i[5])
                category = categories.get(h.find_categories(i[3]), {"count": 0, "value": 0.0})
                categories.update({h.find_categories(i[3]): {
                    "count": category["count"]+1,
                    "value": category["value"]+float(i[4])
                    }})
        else:
            spent_data.append(None)
            budget_data.append(None)
            dates_data.append(f"{sunday.strftime("%d/%m")} - {(sunday + timedelta(days=6)).strftime("%d/%m")}")
        print(data)

    if count != 0:
        avg = total/count
    else:
        avg = 0

    if len(most_bought) > 0:
        most_bought = dict(sorted(most_bought.items(), key=lambda item:item[1])[-3:])
        print(len(most_bought))

    print("\nYAY\n")
    print(categories)

    for s in sd:
        print(s, end="   ")
    return {"spent":spent_data, "budget":budget_data, "dates":dates_data, "total":total, "over_budget":over_budget, "avg":avg, "most_bought":most_bought, "categories":categories, "user_id":session["user_id"]}

@app.route("/ping", methods=["POST"])
def ping():
    cur.execute(f"SELECT 1;")
    conn.commit()
    return "pinged"

if __name__ == '__main__':
    app.run()