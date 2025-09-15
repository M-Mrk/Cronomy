from flask import Flask, render_template, redirect, jsonify
import os
from dotenv import load_dotenv
from functools import wraps
load_dotenv()

app = Flask(__name__)

# Page serving
def onboarding(f):
    @wraps(f)
    def decor(*args, **kwargs):
        load_dotenv()
        if os.getenv('onboarded', 'false').lower() != 'true':
            print(f'Not onboarded!: {os.getenv('onboarded')}')
            return redirect('/onboarding')
        return f(*args, **kwargs)
    return decor

@app.route('/')
@app.route('/entries')
@onboarding
def show_entries():
    return render_template("entries.html") # replace with home later

@app.route('/scheduled')
def show_scheduled():
    return jsonify({'error': 'Not implemented'}), 500

@app.route('/onboarding')
def show_onboarding():
    if os.getenv('onboarded', 'false').lower() == 'true':
        return redirect('/')
    return render_template("onboarding.html")

# API
@app.route('/api/dependencies')
def api_dependencies():
    from app.installation import is_crontab_installed
    try:
        if is_crontab_installed():
            return jsonify({'installed': True}), 200
        else:
            return jsonify({'installed': False}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/crontab_path')
def api_crontab_path():
    from app.installation import check_crontab
    try:
        return jsonify({'found': check_crontab()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)