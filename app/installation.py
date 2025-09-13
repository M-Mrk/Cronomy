import shutil
import subprocess
import os
from dotenv import load_dotenv
load_dotenv()

def is_crontab_installed():
    if shutil.which('crontab') is None:
        try: # Failover check
            subprocess.run(['crontab', '-l'], capture_output=True, check=False)
        except FileNotFoundError:
            return False
    return True

def check_crontab():
    try:
        from .crontab import get_user_crontab, get_root_crontab
    except ImportError: # Different import when calling this file directly
        from crontab import get_user_crontab, get_root_crontab # type: ignore (ignore error)

    try:
        get_user_crontab()
        get_root_crontab()
        complete_onboarding()
        return True
    except Exception as e:
        return f"{e}"
    
def complete_onboarding():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
    with open(env_path, 'a') as file:
        file.write('onboarded=True')
    load_dotenv()

if __name__ == "__main__":
    print(f"crontab: {is_crontab_installed()}")
    print(f"files: {check_crontab()}")