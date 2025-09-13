import subprocess

def get_user_crontab():
    result = subprocess.run(['crontab', '-l'],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE)
    if b'no crontab for' in result.stderr:
        return ""  # No crontab exists
    elif result.returncode != 0:
        raise RuntimeError(result.stderr.decode())
    return result.stdout.decode()

def get_root_crontab():
    result = subprocess.run(['sudo', 'crontab', '-l'],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE)
    if b'no crontab for' in result.stderr:
        return ""  # No crontab exists
    elif result.returncode != 0:
        raise RuntimeError(result.stderr.decode())
    return result.stdout.decode()