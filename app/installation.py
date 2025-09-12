import shutil
import subprocess

def is_chrontab_installed():
    if shutil.which('crontab') is None:
        try: # Failover check
            subprocess.run(['crontab', '-l'], capture_output=True, check=False)
        except FileNotFoundError:
            return False

    return True

if __name__ == "__main__":
    print(f"Chrontab: {is_chrontab_installed()}")