import shutil
import subprocess

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
        from crontab import get_user_crontab, get_root_crontab # Ignore Error

    try:
        get_user_crontab()
        get_root_crontab()
        return True
    except Exception as e:
        return f"{e}"
    
if __name__ == "__main__":
    print(f"crontab: {is_crontab_installed()}")
    print(f"files: {check_crontab()}")