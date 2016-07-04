from flask import Flask, render_template, url_for

app = Flask(__name__)

@app.route('/')
@app.route('/<plot>')
def index(plot=None):
    return render_template("index.html",
                           plot=plot,
                           script=url_for('static', filename="js/script.js"))

if __name__ == "__main__":
    app.run(debug=True)